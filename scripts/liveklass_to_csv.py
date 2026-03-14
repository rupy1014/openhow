#!/usr/bin/env python3

import argparse
import csv
import datetime as dt
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


USER_AGENT = "Mozilla/5.0 (compatible; mdshare-liveklass-csv/1.0)"
DEFAULT_TIMEOUT = 15
CSV_HEADERS = [
    "source_url",
    "channel_name",
    "channel_domain",
    "course_seq",
    "title",
    "subtitle",
    "course_type",
    "difficulty",
    "fare",
    "price_krw",
    "vod_days",
    "max_user_count",
    "attend_count",
    "like_count",
    "review_count",
    "review_rate",
    "curriculum_count",
    "curriculum_title_1",
    "curriculum_duration_sec_1",
    "instructor_1",
    "instructor_2",
    "course_summary",
    "course_purpose",
    "key_questions",
    "status_checked_at",
    "fetch_status",
    "error",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Read explicit LiveKlass class URLs from a text file and export public course info to CSV."
    )
    parser.add_argument("--input", default="urls.txt", help="Input text file. Default: urls.txt")
    parser.add_argument(
        "--output",
        default="liveklass-courses.csv",
        help="Output CSV path. Default: liveklass-courses.csv",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT,
        help=f"Per-request timeout in seconds. Default: {DEFAULT_TIMEOUT}",
    )
    return parser.parse_args()


def read_input_urls(path: Path) -> list[str]:
    urls: list[str] = []
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "," in line:
            _, maybe_url = line.split(",", 1)
            line = maybe_url.strip()
        urls.append(line)
    return urls


def fetch_text(url: str, timeout: int) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return response.read().decode(charset, errors="replace")


def fetch_json(url: str, timeout: int) -> dict | list:
    text = fetch_text(url, timeout)
    return json.loads(text)


def parse_course_url(url: str) -> tuple[str, str]:
    parsed = urllib.parse.urlparse(url)
    match = re.search(r"/classes/(\d+)", parsed.path)
    if not match:
        raise ValueError("unsupported_path")
    return parsed.netloc, match.group(1)


def extract_channel_seq(html_text: str) -> str:
    match = re.search(r"window\.channelSeq\s*=\s*(\d+)", html_text)
    if not match:
        raise ValueError("channel_seq_not_found")
    return match.group(1)


def strip_html(value: str | None) -> str:
    if not value:
        return ""
    no_tags = re.sub(r"<[^>]+>", " ", value)
    unescaped = html.unescape(no_tags)
    return re.sub(r"\s+", " ", unescaped).strip()


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    return re.sub(r"\s+", " ", value).strip()


def extract_instructors(desc6_html: str | None) -> tuple[str, str]:
    text = strip_html(desc6_html)
    names = re.findall(r"([가-힣A-Za-z0-9 .]+)의 선택", text)
    clean_names: list[str] = []
    for name in names:
        normalized = normalize_text(name)
        if normalized and normalized not in clean_names:
            clean_names.append(normalized)
    instructor_1 = clean_names[0] if len(clean_names) > 0 else ""
    instructor_2 = clean_names[1] if len(clean_names) > 1 else ""
    return instructor_1, instructor_2


def build_row(source_url: str, course: dict, curriculums: dict) -> dict[str, str]:
    items = curriculums.get("list", []) if isinstance(curriculums, dict) else []
    first_item = items[0] if items else {}
    instructor_1, instructor_2 = extract_instructors(course.get("desc6"))

    row = {
        "source_url": source_url,
        "channel_name": normalize_text(course.get("channelName")),
        "channel_domain": normalize_text(course.get("domain")),
        "course_seq": str(course.get("courseSeq") or ""),
        "title": normalize_text(course.get("title")),
        "subtitle": normalize_text(course.get("subTitle")),
        "course_type": normalize_text(course.get("courseType")),
        "difficulty": normalize_text(course.get("difficulty")),
        "fare": normalize_text(course.get("fare")),
        "price_krw": "" if course.get("price") is None else str(course.get("price")),
        "vod_days": "" if course.get("vodDays") is None else str(course.get("vodDays")),
        "max_user_count": "" if course.get("maxUserCount") is None else str(course.get("maxUserCount")),
        "attend_count": "" if course.get("attendCount") is None else str(course.get("attendCount")),
        "like_count": "" if course.get("likeCount") is None else str(course.get("likeCount")),
        "review_count": "" if course.get("reviewCount") is None else str(course.get("reviewCount")),
        "review_rate": "" if course.get("reviewRate") is None else str(course.get("reviewRate")),
        "curriculum_count": str(len(items)),
        "curriculum_title_1": normalize_text(first_item.get("title")),
        "curriculum_duration_sec_1": "" if first_item.get("classTime") is None else str(first_item.get("classTime")),
        "instructor_1": instructor_1,
        "instructor_2": instructor_2,
        "course_summary": normalize_text(course.get("desc1")),
        "course_purpose": normalize_text(course.get("desc2")),
        "key_questions": normalize_text(course.get("desc4")),
        "status_checked_at": dt.date.today().isoformat(),
        "fetch_status": "ok",
        "error": "",
    }
    return row


def error_row(source_url: str, message: str) -> dict[str, str]:
    row = {header: "" for header in CSV_HEADERS}
    row["source_url"] = source_url
    row["status_checked_at"] = dt.date.today().isoformat()
    row["fetch_status"] = "error"
    row["error"] = message
    return row


def process_url(url: str, timeout: int) -> dict[str, str]:
    try:
        _, course_seq = parse_course_url(url)
        page_html = fetch_text(url, timeout)
        channel_seq = extract_channel_seq(page_html)
        course_api = f"https://rest.liveklass.com/v1.0/channels/{channel_seq}/courses/{course_seq}"
        curriculum_api = f"https://api.liveklass.com/v1.0/channels/{channel_seq}/courses/{course_seq}/curriculums"
        course_payload = fetch_json(course_api, timeout)
        curriculums_payload = fetch_json(curriculum_api, timeout)
        course = course_payload.get("course")
        if not isinstance(course, dict):
            raise ValueError("course_payload_missing")
        return build_row(url, course, curriculums_payload)
    except urllib.error.HTTPError as exc:
        return error_row(url, f"http_{exc.code}")
    except urllib.error.URLError as exc:
        reason = exc.reason if isinstance(exc.reason, str) else type(exc.reason).__name__
        return error_row(url, f"url_error:{reason}")
    except Exception as exc:  # noqa: BLE001
        return error_row(url, str(exc))


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).resolve()
    output_path = Path(args.output).resolve()

    if not input_path.exists():
        print(f"[error] input file not found: {input_path}", file=sys.stderr)
        return 1

    rows = [process_url(url, args.timeout) for url in read_input_urls(input_path)]

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=CSV_HEADERS)
        writer.writeheader()
        writer.writerows(rows)

    ok_count = sum(1 for row in rows if row["fetch_status"] == "ok")
    error_count = len(rows) - ok_count
    print(f"[done] wrote {len(rows)} row(s) to {output_path}")
    print(f"[done] ok={ok_count} error={error_count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
