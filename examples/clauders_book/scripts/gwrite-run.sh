#!/bin/bash
# gwrite-run.sh — clauders_book 전용 Gemini sub-agent runner
#
# 채널 기반 글로벌 스크립트와 달리, 책 챕터 구조에 맞게 동작한다.
# source-map.md에서 레퍼런스 경로를 파싱 → 실제 파일 내용을 프롬프트에 주입.
#
# Usage:
#   gwrite-run.sh <chapter_number> [feedback_path]          # full chapter
#   gwrite-run.sh <chapter_number> --list-sections           # list section IDs
#   gwrite-run.sh <chapter_number> --section <id> [feedback] # single section
# Example:
#   ./scripts/gwrite-run.sh 06
#   ./scripts/gwrite-run.sh 01 --list-sections
#   ./scripts/gwrite-run.sh 01 --section 01.3

set -euo pipefail

CH_NUM="${1:?Usage: $0 <chapter_number (01~17)> [--list-sections | --section <id> [feedback_path] | feedback_path]}"
MODE="full"
SECTION_ID=""
FEEDBACK_PATH=""

if [ "${2:-}" = "--list-sections" ]; then
  MODE="list-sections"
elif [ "${2:-}" = "--section" ]; then
  MODE="section"
  SECTION_ID="${3:?--section requires section ID (e.g., 01.3)}"
  FEEDBACK_PATH="${4:-}"
else
  FEEDBACK_PATH="${2:-}"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROMPT_FILE="/tmp/gwrite_prompt_ch${CH_NUM}.md"

# --- Paths ---
TOC="${ROOT}/docs/toc-final.md"
SOURCE_MAP="${ROOT}/docs/source-map.md"
TONE_GUIDE="${ROOT}/brain/tone-guide.md"
CHAPTER_TEMPLATE="${ROOT}/brain/chapter-template.md"
WRITING_GUIDE="${ROOT}/docs/writing-guide.md"
EXAMPLES_ROOT="${ROOT}/../clauders.ai"

# --- Determine part & output path ---
CH_INT=$((10#$CH_NUM))
if [ "$CH_INT" -le 5 ]; then
  PART="01"
elif [ "$CH_INT" -le 8 ]; then
  PART="02"
elif [ "$CH_INT" -le 12 ]; then
  PART="03"
else
  PART="04"
fi
OUTPUT_DIR="${ROOT}/docs/part-${PART}"
OUTPUT_FILE="${OUTPUT_DIR}/${CH_NUM}-chapter.md"
mkdir -p "$OUTPUT_DIR"

# ============================================================
# Helper: extract TOC section for this chapter
# ============================================================
extract_toc_section() {
  local ch_num="$1"
  local ch_int=$((10#$ch_num))
  local next_int=$((ch_int + 1))
  local next_num
  next_num=$(printf "%02d" "$next_int")

  # Extract from "[XX장]" to next "[YY장]" or "---"
  awk -v start="[${ch_num}장]" -v stop="[${next_num}장]" '
    index($0, start) { found=1 }
    found && (index($0, stop) || $0 ~ /^---$/) && NR>1 { if (!index($0, start)) exit }
    found { print }
  ' "$TOC"
}

# ============================================================
# Helper: list section IDs from TOC (e.g., "01.1\n01.2\n01.3")
# ============================================================
extract_section_list() {
  local ch_num="$1"
  extract_toc_section "$ch_num" | grep -oE "^${ch_num}\.[0-9]+" | sort -t. -k2 -n || true
}

# ============================================================
# Helper: extract specific section's TOC content
# ============================================================
extract_section_toc() {
  local section_id="$1"  # e.g., "01.3"
  local ch_num="${section_id%%.*}"
  local sec_num="${section_id#*.}"
  local next_num=$((sec_num + 1))
  local next_id="${ch_num}.${next_num}"

  extract_toc_section "$ch_num" | awk -v start="^${section_id} " -v stop="^${next_id} " '
    $0 ~ start { found=1 }
    found && $0 ~ stop { exit }
    found { print }
  '
}

# ============================================================
# --list-sections: print section IDs and exit
# ============================================================
if [ "$MODE" = "list-sections" ]; then
  extract_section_list "$CH_NUM"
  exit 0
fi

# ============================================================
# Section mode: override output path
# ============================================================
if [ "$MODE" = "section" ]; then
  SEC_NUM="${SECTION_ID#*.}"
  OUTPUT_FILE="/tmp/gwrite_section_${CH_NUM}_${SEC_NUM}.md"
  echo "[gwrite] Section mode: generating ${SECTION_ID} → ${OUTPUT_FILE}" >&2
fi

# ============================================================
# Helper: extract source-map references for this chapter
# ============================================================
extract_source_refs() {
  local ch_num="$1"
  local ch_int=$((10#$ch_num))
  local next_num
  next_num=$(printf "%02d" $((ch_int + 1)))

  # Extract from LAST occurrence of "### XX장" to next heading or Part boundary.
  # Uses two-pass: first find last line number of "### XX장", then extract from there.
  local last_start
  last_start=$(grep -n "^### ${ch_num}장" "$SOURCE_MAP" | tail -1 | cut -d: -f1)

  if [ -z "$last_start" ]; then
    return
  fi

  tail -n +"$last_start" "$SOURCE_MAP" | awk -v stop="^### [0-9]" -v stop2="^## Part" '
    NR == 1 { next }
    $0 ~ stop || $0 ~ stop2 { exit }
    /^- / { print }
  '
}

# ============================================================
# Helper: read reference file content (with line limit)
# ============================================================
inject_reference() {
  local ref_path="$1"
  local label="$2"
  local max_lines="${3:-300}"
  local full_path=""

  # Resolve path: examples/clauders.ai/... → absolute
  if [[ "$ref_path" == examples/clauders.ai/* ]]; then
    full_path="${ROOT}/../clauders.ai/${ref_path#examples/clauders.ai/}"
  elif [[ "$ref_path" == backlog/* ]]; then
    full_path="${ROOT}/${ref_path}"
  elif [[ "$ref_path" == examples/* ]]; then
    full_path="${ROOT}/../${ref_path#examples/}"
  else
    full_path="${ROOT}/${ref_path}"
  fi

  if [ -f "$full_path" ]; then
    {
      echo "### 레퍼런스: ${label}"
      echo "<!-- source: ${ref_path} -->"
      echo ""
      head -"$max_lines" "$full_path"
      local total_lines
      total_lines=$(wc -l < "$full_path" | tr -d ' ')
      if [ "$total_lines" -gt "$max_lines" ]; then
        echo ""
        echo "(... ${total_lines}줄 중 ${max_lines}줄만 포함)"
      fi
      echo ""
      echo "---"
      echo ""
    } >> "$PROMPT_FILE"
  else
    echo "[gwrite] WARNING: Reference not found: ${full_path}" >&2
  fi
}

# ============================================================
# Helper: find previous/next chapter files for connection context
# ============================================================
get_adjacent_chapter() {
  local target_num="$1"  # e.g., "05" or "07"
  local target_int=$((10#$target_num))

  # Determine part
  local target_part
  if [ "$target_int" -le 5 ]; then
    target_part="01"
  elif [ "$target_int" -le 8 ]; then
    target_part="02"
  elif [ "$target_int" -le 12 ]; then
    target_part="03"
  else
    target_part="04"
  fi

  local f="${ROOT}/docs/part-${target_part}/${target_num}-chapter.md"
  if [ -f "$f" ]; then
    echo "$f"
  fi
}

# ============================================================
# Phase 1: Build prompt
# ============================================================
echo "[gwrite] Building prompt for chapter ${CH_NUM} (Part ${PART})..." >&2

cat > "$PROMPT_FILE" << 'HEADER'
# 책 챕터 신규 작성 지시

아래의 컨텍스트(톤 규칙, 목차, 레퍼런스, 이전/다음 장 연결)를 모두 읽고,
지시에 따라 챕터 원고를 작성해줘.

---

HEADER

# 1. Tone guide
if [ -f "$TONE_GUIDE" ]; then
  {
    echo "## 톤 규칙"
    cat "$TONE_GUIDE"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# 2. Chapter template
if [ -f "$CHAPTER_TEMPLATE" ]; then
  {
    echo "## 챕터 구조 템플릿"
    cat "$CHAPTER_TEMPLATE"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# 3. Writing guide (if exists)
if [ -f "$WRITING_GUIDE" ]; then
  {
    echo "## 집필 가이드"
    head -100 "$WRITING_GUIDE"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# 4. Book context summary
cat >> "$PROMPT_FILE" << CONTEXT
## 이 책의 맥락

"바로바로 코덱스 + 오픈클로 에이전트 자동화" 입문서. 독자는 비개발자.

- Part 1 (01~05장): 코덱스 설치, AI 개념, 캐릭터 채팅, PRD/피드백 루프, 배포
- Part 2 (06~08장): 스킬/에이전트로 콘텐츠 자동화 설계
- Part 3 (09~12장): 오픈클로에서 24시간 자동 실행
- Part 4 (13~14장): 콘텐츠를 세상에 내보내기

현재 작성 대상: **${CH_NUM}장** (Part ${PART})

---

CONTEXT

# 5. TOC section for this chapter (+ section-specific target)
{
  echo "## 이 챕터의 목차"
  echo ""
  extract_toc_section "$CH_NUM"
  echo ""
  if [ "$MODE" = "section" ]; then
    echo "### ▶ 이번에 작성할 섹션: ${SECTION_ID}"
    echo ""
    extract_section_toc "$SECTION_ID"
    echo ""
    echo "(위 챕터 목차 중 **${SECTION_ID}** 섹션만 작성할 것. 나머지는 맥락 파악용.)"
    echo ""
  fi
  echo "---"
  echo ""
} >> "$PROMPT_FILE"

# 5.5 Previous section output (for section mode continuity)
if [ "$MODE" = "section" ]; then
  PREV_SEC_NUM=$(( ${SECTION_ID#*.} - 1 ))
  if [ "$PREV_SEC_NUM" -ge 1 ]; then
    PREV_SEC_FILE="/tmp/gwrite_section_${CH_NUM}_${PREV_SEC_NUM}.md"
    if [ -f "$PREV_SEC_FILE" ]; then
      {
        echo "## 바로 앞 섹션 (${CH_NUM}.${PREV_SEC_NUM}) 마지막 부분"
        echo "이 섹션에 자연스럽게 이어지도록 톤과 흐름을 맞출 것."
        echo ""
        tail -30 "$PREV_SEC_FILE"
        echo ""
        echo "---"
        echo ""
      } >> "$PROMPT_FILE"
    fi
  fi
fi

# 6. Previous chapter connection (last 40 lines for context)
PREV_NUM=$(printf "%02d" $(( 10#$CH_NUM - 1 )) )
PREV_FILE=$(get_adjacent_chapter "$PREV_NUM")
if [ -n "$PREV_FILE" ]; then
  {
    echo "## 이전 장 연결 (${PREV_NUM}장 마지막 부분)"
    echo ""
    tail -40 "$PREV_FILE"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# 7. Next chapter TOC (for ending transition)
NEXT_NUM=$(printf "%02d" $(( 10#$CH_NUM + 1 )) )
NEXT_TOC=$(extract_toc_section "$NEXT_NUM" 2>/dev/null || true)
if [ -n "$NEXT_TOC" ]; then
  {
    echo "## 다음 장 목차 (${NEXT_NUM}장 — 마무리 예고용)"
    echo ""
    echo "$NEXT_TOC" | head -5
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# 8. Tone reference sample (use completed chapter from Part 1)
TONE_SAMPLE=""
for f in "${ROOT}/docs/part-01/04-chapter.md" "${ROOT}/docs/part-01/03-chapter.md" "${ROOT}/docs/part-01/02-chapter.md"; do
  if [ -f "$f" ]; then
    TONE_SAMPLE="$f"
    break
  fi
done
if [ -n "$TONE_SAMPLE" ]; then
  {
    echo "## 레퍼런스 톤 샘플 (기존 완성 원고)"
    echo "아래 글의 톤, 구조, 표현 방식을 참고하되 내용을 복사하지 마."
    echo ""
    head -120 "$TONE_SAMPLE"
    echo ""
    echo "(... 이하 생략)"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"
fi

# ============================================================
# 9. SOURCE-MAP REFERENCES — 핵심 차별점
# ============================================================
echo "[gwrite] Injecting source-map references..." >&2

REF_COUNT=0
{
  echo "## 참고 레퍼런스 (source-map.md 기반)"
  echo ""
  echo "아래는 이 챕터의 핵심 레퍼런스다. 이 내용을 적극 활용하여"
  echo "구체적인 폴더 구조, 코드 블록, 실행 결과, 설정 예시를 본문에 녹여라."
  echo "비유만으로 때우지 말고, 레퍼런스의 실제 예시를 독자 수준에 맞게 변환하라."
  echo ""
  echo "---"
  echo ""
} >> "$PROMPT_FILE"

while IFS= read -r line; do
  # Parse: - `examples/... or backlog/...` — description
  # Only match paths that start with examples/ or backlog/ (skip inline code like `.claude/`)
  # Note: BSD sed \| alternation fails with Korean chars, so try each prefix separately
  ref_path=$(echo "$line" | sed -n 's/^- `\(examples\/[^`]*\)`.*/\1/p')
  if [ -z "$ref_path" ]; then
    ref_path=$(echo "$line" | sed -n 's/^- `\(backlog\/[^`]*\)`.*/\1/p')
  fi
  ref_desc=$(echo "$line" | sed -n 's/.*— \(.*\)/\1/p')

  if [ -n "$ref_path" ]; then
    # Determine max lines based on "핵심" priority
    if echo "$line" | grep -q "핵심\|뉴스봇만들기\|멀티에이전트\|작업맡기기\|orchestration"; then
      inject_reference "$ref_path" "${ref_desc:-$ref_path}" 300
    else
      inject_reference "$ref_path" "${ref_desc:-$ref_path}" 150
    fi
    REF_COUNT=$((REF_COUNT + 1))
  fi
done <<< "$(extract_source_refs "$CH_NUM")"

echo "[gwrite] Injected ${REF_COUNT} references" >&2

# 10. Feedback from previous round
if [ -n "$FEEDBACK_PATH" ] && [ -f "$FEEDBACK_PATH" ]; then
  {
    echo "## 이전 라운드 피드백 (수정 지시)"
    echo ""
    cat "$FEEDBACK_PATH"
    echo ""
    echo "---"
    echo ""
  } >> "$PROMPT_FILE"

  if [ -f "$OUTPUT_FILE" ]; then
    {
      echo "## 이전 원고 (수정 대상)"
      cat "$OUTPUT_FILE"
      echo ""
      echo "---"
      echo ""
    } >> "$PROMPT_FILE"
  fi
fi

# ============================================================
# 11. Mission instruction (full vs section mode)
# ============================================================
if [ "$MODE" = "section" ]; then
cat >> "$PROMPT_FILE" << MISSION

---

## 미션

위 컨텍스트를 기반으로 **${CH_NUM}장의 섹션 ${SECTION_ID}만 작성**해줘.

**핵심 규칙:**
1. 톤 규칙의 12가지 원칙을 정확히 따를 것
2. **섹션 ${SECTION_ID}의 하위 항목을 빠짐없이, 충분히 풀어쓸 것**
3. 레퍼런스의 구체적 예시(폴더 구조, 코드 블록, 실행 결과, 설정값)를 본문에 녹일 것
   - 비유만으로 때우지 말 것. 독자가 따라할 수 있는 구체적 행동이 있어야 함
   - 코드/설정 예시는 코드블록으로 보여줄 것
   - 실행 결과 예시가 있으면 반드시 포함할 것
4. 이미지: \`<!-- IMG: 설명 -->\` 형식
5. 한 문장 2줄(약 80자) 이내, 한 문단 3~5문장
6. 금지: 반말, 평어체, "따라서/그러므로", AI 냄새 표현 ("살펴보겠습니다", "알아보도록 하겠습니다")
7. 분량: **3000~5000자**. 이 섹션의 모든 하위 항목을 구체적으로 설명할 것
8. 마크다운으로 출력, 코드펜스(\`\`\`markdown)로 감싸지 마
9. 챕터 제목(# 헤딩)은 넣지 마. 섹션 제목(## ${SECTION_ID} ...)부터 시작할 것
10. 바로 앞 섹션이 있으면 자연스럽게 이어질 것. 없으면 챕터 도입으로 시작
MISSION
else
cat >> "$PROMPT_FILE" << MISSION

---

## 미션

위 컨텍스트를 기반으로 **${CH_NUM}장을 신규 작성**해줘.

**핵심 규칙:**
1. 톤 규칙의 12가지 원칙을 정확히 따를 것
2. 목차의 모든 항목을 빠짐없이 다룰 것
3. 레퍼런스의 구체적 예시(폴더 구조, 코드 블록, 실행 결과, 설정값)를 본문에 녹일 것
   - 비유만으로 때우지 말 것. 독자가 따라할 수 있는 구체적 행동이 있어야 함
   - 코드/설정 예시는 코드블록으로 보여줄 것
   - 실행 결과 예시가 있으면 반드시 포함할 것
4. "여기서 막혔나요?" 섹션은 독립 ## 헤딩으로, Q&A 2~3개 (실제 에러/증상 기반)
5. "한 줄 정리"는 **한 문장** + 마무리 여운 문장
6. 이전 장과의 연결: 이전 장 마지막 부분을 자연스럽게 이어받을 것
7. 다음 장 예고: 챕터 마무리에서 다음 장의 내용을 자연스럽게 예고할 것
8. 이미지: \`<!-- IMG: 설명 -->\` 형식
9. 한 문장 2줄(약 80자) 이내, 한 문단 3~5문장
10. 금지: 반말, 평어체, "따라서/그러므로", AI 냄새 표현 ("살펴보겠습니다", "알아보도록 하겠습니다")
11. 분량: 약 10000~14000자 (출판 기준 약 20~25페이지). 짧게 끝내지 말고 목차의 모든 하위 항목을 충분히 풀어쓸 것
12. 마크다운으로 출력, 코드펜스(\`\`\`markdown)로 감싸지 마
MISSION
fi

PROMPT_LINES=$(wc -l < "$PROMPT_FILE" | tr -d ' ')
PROMPT_BYTES=$(wc -c < "$PROMPT_FILE" | tr -d ' ')
echo "[gwrite] Prompt ready: ${PROMPT_LINES} lines, ${PROMPT_BYTES} bytes (${REF_COUNT} refs)" >&2

# ============================================================
# Phase 2: Call Gemini
# ============================================================
echo "[gwrite] Calling Gemini..." >&2

if gemini -p "$(cat "$PROMPT_FILE")" -o text > "${OUTPUT_FILE}.tmp" 2>/tmp/gwrite_gemini_err.log; then
  # Strip wrapping ```markdown fences
  sed -E '/^```(markdown)?$/d' "${OUTPUT_FILE}.tmp" > "$OUTPUT_FILE"
  rm -f "${OUTPUT_FILE}.tmp"

  # Fix unclosed code fences: scan for opened ``` without matching close
  python3 -c "
import re, sys
lines = open(sys.argv[1]).readlines()
out, inside = [], False
for i, line in enumerate(lines):
    out.append(line)
    stripped = line.strip()
    if not inside and stripped.startswith('\`\`\`') and stripped != '\`\`\`':
        inside = True
    elif not inside and stripped == '\`\`\`':
        inside = True
    elif inside and stripped == '\`\`\`':
        inside = False
    # If inside a fence and next non-empty line starts with a heading or
    # horizontal rule, auto-close the fence
    if inside and i + 1 < len(lines):
        nxt = lines[i + 1].strip()
        if nxt.startswith('#') or nxt == '---' or (nxt.startswith('**') and not nxt.startswith('\`\`\`')):
            out.append('\`\`\`\n')
            inside = False
if inside:
    out.append('\`\`\`\n')
open(sys.argv[1], 'w').writelines(out)
" "$OUTPUT_FILE"
else
  GEMINI_ERR=$(cat /tmp/gwrite_gemini_err.log 2>/dev/null || echo "unknown error")
  echo "[gwrite] ERROR: Gemini failed — ${GEMINI_ERR}" >&2
  rm -f "${OUTPUT_FILE}.tmp"
  exit 1
fi

# ============================================================
# Phase 3: Report status
# ============================================================
OUTPUT_LINES=$(wc -l < "$OUTPUT_FILE" | tr -d ' ')
OUTPUT_BYTES=$(wc -c < "$OUTPUT_FILE" | tr -d ' ')
TITLE=$(head -5 "$OUTPUT_FILE" | grep -m1 '^#' | sed 's/^#\+\s*//' || echo "(no title)")

cat << STATUS
{
  "status": "success",
  "mode": "${MODE}",
  "chapter": "${CH_NUM}",
  "section": "${SECTION_ID}",
  "part": "${PART}",
  "output_file": "${OUTPUT_FILE}",
  "output_lines": ${OUTPUT_LINES},
  "output_bytes": ${OUTPUT_BYTES},
  "title": "${TITLE}",
  "prompt_file": "${PROMPT_FILE}",
  "prompt_lines": ${PROMPT_LINES},
  "ref_count": ${REF_COUNT}
}
STATUS
