# Claude Code 환경 부트스트랩 프롬프트

> 이 파일 전체를 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.
> 아래 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사.

---

=== 여기서부터 복사 ===

아래 파일들을 생성해줘. 내 Claude Code 작업 환경 설정 파일들이야. 각 파일의 내용을 그대로 만들어줘. 경로는 현재 프로젝트 루트 기준이야.

---

## 파일 1: `.claude/settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/format-python.sh",
            "timeout": 30
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/verify-gate.py",
            "timeout": 60,
            "statusMessage": "검증 게이트 실행 중..."
          }
        ]
      }
    ]
  }
}
```

---

## 파일 2: `.claude/hooks/format-python.sh`

```bash
#!/bin/bash

# PostToolUse hook: Auto-format Python files after Edit/Write
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$FILE_PATH" == *.py ]]; then
  ruff format "$FILE_PATH" 2>/dev/null || true
fi

exit 0
```

이 파일은 실행 권한도 부여해줘: `chmod +x .claude/hooks/format-python.sh`

---

## 파일 3: `.claude/hooks/verify-gate.py`

```python
#!/usr/bin/env python3
"""
Verify Gate - Stop Hook for Claude Code
Claude가 작업 완료를 선언할 때 자동으로 실행.
실패 시 exit 2로 Claude 중단 방지.
"""

import ast
import json
import subprocess
import sys
from datetime import datetime, timedelta
from pathlib import Path


def get_project_dir() -> Path:
    """stdin JSON에서 프로젝트 경로를 추출하거나 인자/CWD 사용."""
    if len(sys.argv) > 1:
        return Path(sys.argv[1])

    try:
        input_data = json.loads(sys.stdin.read())

        if input_data.get("stop_hook_active") is True:
            sys.exit(0)

        return Path(input_data.get("cwd", "."))
    except (json.JSONDecodeError, EOFError):
        return Path.cwd()


def find_recent_files(project_dir: Path, suffix: str, hours: int = 1) -> list[Path]:
    """최근 N시간 내 수정된 파일 목록."""
    cutoff = datetime.now() - timedelta(hours=hours)
    results = []
    for f in project_dir.rglob(f"*{suffix}"):
        skip_dirs = {".venv", "__pycache__", "node_modules", ".git", ".claude"}
        if any(d in f.parts for d in skip_dirs):
            continue
        try:
            if f.stat().st_mtime > cutoff.timestamp():
                results.append(f)
        except OSError:
            continue
    return results


def check_python_syntax(project_dir: Path) -> list[str]:
    """최근 수정된 Python 파일 구문 검사."""
    issues = []
    for py_file in find_recent_files(project_dir, ".py"):
        try:
            source = py_file.read_text(encoding="utf-8")
            ast.parse(source)
        except SyntaxError as e:
            issues.append(
                f"SYNTAX_ERROR: {py_file.relative_to(project_dir)}: line {e.lineno}: {e.msg}"
            )
        except (UnicodeDecodeError, PermissionError):
            continue
    return issues


def check_json_validity(project_dir: Path) -> list[str]:
    """최근 수정된 JSON 파일 유효성 검사."""
    issues = []
    for json_file in find_recent_files(project_dir, ".json"):
        try:
            content = json_file.read_text(encoding="utf-8")
            json.loads(content)
        except json.JSONDecodeError as e:
            issues.append(f"JSON_ERROR: {json_file.relative_to(project_dir)}: {e.msg}")
        except (UnicodeDecodeError, PermissionError):
            continue
    return issues


def main():
    project_dir = get_project_dir()

    all_issues = []
    checks_run = []

    checks_run.append("python_syntax")
    all_issues.extend(check_python_syntax(project_dir))

    checks_run.append("json_validity")
    all_issues.extend(check_json_validity(project_dir))

    passed = len(all_issues) == 0

    report = {
        "timestamp": datetime.now().isoformat(),
        "gate": "verify-gate",
        "pass": passed,
        "checks_run": checks_run,
        "issue_count": len(all_issues),
        "issues": all_issues,
    }

    if not passed:
        feedback = f"검증 실패 ({len(all_issues)}건):\n" + "\n".join(
            f"  - {i}" for i in all_issues
        )
        print(feedback, file=sys.stderr)
        sys.exit(2)

    print(json.dumps(report, indent=2, ensure_ascii=False))
    sys.exit(0)


if __name__ == "__main__":
    main()
```

---

## 파일 4: `.claude/rules/verification.md`

```markdown
---
paths:
  - "**"
---

# 검증 보고 (Verification Report)

모든 작업 완료 시 아래 형식 필수. "문제 없음"만 출력 금지.

| 항목 | 내용 |
|------|------|
| 변경 파일 | 수정/생성/삭제된 파일 경로 목록 |
| 검증 명령 | 실행한 명령어 + 실제 출력 (발췌 가능) |
| 수치 증거 | 건수, 성공/실패, 행 수, 바이트 등 |
| 미해결 사항 | 없으면 "없음", 있으면 구체적 설명 |
| 신뢰도 | HIGH/MEDIUM/LOW + 근거 한 줄 |

## 금지 표현
- "잘 작동합니다" (증거 없음)
- "문제 없습니다" (무엇을 확인했는지 없음)
- "완료했습니다" (무엇을 완료했는지 없음)

## 서브에이전트 규칙
Task tool로 에이전트 생성 시 프롬프트에 반드시 포함:
> "작업 완료 시: 수정 파일 목록, 실행한 검증 명령+출력, 수치 결과, 미해결 사항을 보고하세요."
```

---

## 파일 5: `.claude/rules/context-management.md`

```markdown
---
paths:
  - "**"
---

# 컨텍스트 관리 규칙

## 출력 절약
- 터미널 출력 최소화 — 컨텍스트 윈도우 보호 최우선
- 코드/로그/구현 과정 → 프린트 금지. 필요시 파일 저장
- 서브에이전트 결과 → 1-2줄 요약만
- 표는 5행 이내. 초과 시 파일 저장

## 컨텍스트 가득 찰 때
1. **70% 도달**: `/compact focus on 현재작업` 으로 압축
2. **90%+ 도달**: 핸드오프 파일 저장 → 새 세션에서 이어가기
   - `docs/handoff/handoff_YYYYMMDD_주제.md`에 현재 상태 기록
   - 포함: 작업 목표, 완료된 것, 미완료, 변경 파일, 다음 단계
3. **중요 발견**: `remember ~`으로 Auto Memory에 영구 저장

## 컴팩션 보존 대상
When compacting, always preserve:
- 변경 파일 목록
- 미해결 사항
- 현재 작업 브랜치
- 사용자의 최근 지시사항
```

---

## 파일 6: `.claude/rules/execution-bias.md`

```markdown
---
paths:
  - "**"
---

# 실행 편향 규칙 (Execution Bias Rules)

## 태스크 분해 규칙

"N편 잔여", "N건 분류" 형태의 태스크가 3일 이상 이월되면 → 무조건 5개 단위로 쪼갠다.
"전체 완료"를 목표로 잡는 것 자체가 시작을 막는 주된 원인이다.
쪼갠 뒤 첫 번째 묶음을 오늘의 첫 작업으로 배치한다.

## CLAUDE.md 수정 빈도 제한

주간 3회를 초과하면 시스템 개선보다 실행이 더 중요하다는 신호다.
규칙을 추가하기 전에 "이게 실행을 위한 것인가, 시스템 정제를 위한 것인가"를 먼저 물어볼 것.

## Fix 루프 감지 규칙

같은 파일에 fix 커밋이 2회 이상 발생하면 → /devils-advocate로 근본 원인 분석을 먼저 한다.
임시 fix를 쌓지 말고, 아키텍처 레벨 해결책을 수립한 뒤 진행한다.
```

---

## 파일 7: `.claude/skills/po/SKILL.md`

```markdown
---
name: po
description: PO 에이전트. Daily Note + BACKLOG + git + Discovery 기반으로 오늘 할 일 우선순위화·할당·상태 관리. "/po", "/po add", "/po done", "/po vision", "/po hypothesis", "/po score", "/po rerank", "/po market"로 호출.
user-invocable: true
allowed-tools: "Read, Write, Edit, Glob, Bash(git log *), Bash(git diff *), Bash(date *), Bash(ls *), AskUserQuestion, WebSearch"
---

# PO Agent (/po)

이 프로젝트의 Product Owner AI. Daily Note, BACKLOG, git 히스토리, Discovery 로그를 종합해 오늘 할 일을 우선순위화하고 장비별로 할당한다.

---

## SSOT (Single Source of Truth)

| 파일 | 역할 |
|------|------|
| `docs/po/BACKLOG.md` | 전체 태스크 목록 (유일한 진실의 원천) |
| `docs/po/VISION.md` | 프로젝트 비전 + 활성 가설 |
| `docs/po/DISCOVERY_LOG.md` | 가설 → 실험 → 학습 기록 |
| `Daily/YYYY-MM-DD.md` | 오늘의 컨텍스트, 목표, 완료 기록 |
| git log | 실제 완료된 작업 증거 |

---

## 명령어

### `/po` 또는 `/po morning` — 아침 브리핑

1. `date +%Y-%m-%d` 로 오늘 날짜 확인
2. `Daily/YYYY-MM-DD.md` 읽기 (없으면 가장 최근 Daily Note 읽기)
3. `docs/po/BACKLOG.md` 읽기
4. `docs/po/VISION.md` 읽기 (있으면 활성 가설 확인)
5. `git log --oneline --since="3 days ago"` 로 최근 작업 파악
6. 종합 분석 후 아래 형식으로 출력:

```
📋 PO 브리핑 YYYY-MM-DD
════════════════════════

🔴 오늘 반드시 (P0-P1, 3개 이하)
  1. [태스크]
  2. [태스크]

🟡 여유 되면 (P2)
  - [태스크]

🧪 검증 중인 가설
  - H1: [가설 내용]

🚧 블로커
  - [있으면 명시, 없으면 "없음"]

⚠️ 장기 이월 경고 (3일+)
  - [태스크] — N일째 이월

📊 BACKLOG 현황: 전체 N개 | In Progress N개 | Done(이번 주) N개
```

### `/po add [태스크 설명]` — 백로그 추가

1. `docs/po/BACKLOG.md` 읽기
2. 우선순위 추론: 긴급/오늘 → P1, 중요 → P2, 언젠가 → P3
3. BACKLOG.md의 `## Backlog` 섹션에 항목 추가:
   ```
   - [ ] [카테고리] 설명 | priority: PX | added: YYYY-MM-DD
   ```

### `/po done [태스크 키워드]` — 완료 처리

1. BACKLOG.md에서 키워드로 태스크 검색
2. `- [ ]` → `- [x]` 변경, `| done: YYYY-MM-DD` 추가
3. 해당 항목을 `## Done` 섹션으로 이동

### `/po vision` — 현재 비전과 가설 출력

1. `docs/po/VISION.md` 읽기
2. 비전 요약 + 활성 가설 목록 출력

### `/po hypothesis add [가설 내용]` — 가설 등록

1. VISION.md 활성 가설 테이블에 새 가설 추가:
   ```
   | HN | [가설 내용] | 🔵 검증 중 | YYYY-MM-DD |
   ```

### `/po score [태스크 키워드]` — ICE 스코어 계산

ICE 스코어 = (Impact × Confidence) / Effort

- Impact (1-10): 프로젝트 목표 달성 기여도
- Confidence (1-10): 구현 완료/효과 예측 확신도
- Effort (스토리포인트: 1/2/3/5/8)

### `/po rerank` — ICE 기준 백로그 재정렬 검토

ICE 점수 내림차순 정렬 후 현재 P등급과 불일치 태스크 표시.

### `/po market` — 시장/경쟁 모니터링

WebSearch로 관련 업계 동향 조회 후 5줄 이내 요약.

---

## 태스크 형식 (BACKLOG.md)

```markdown
- [ ] [카테고리] 설명 | priority: P0|P1|P2|P3 | rice: N.N | added: YYYY-MM-DD
- [x] [카테고리] 설명 | priority: P1 | added: MM-DD | done: MM-DD
```

**우선순위**: P0=오늘 반드시, P1=이번 주, P2=여유 있을 때, P3=언젠가

---

## PO 행동 원칙

### 선제 의견 제시 (Opinionated by Default)
- 선택지 나열 금지. "A 또는 B 중 어떻게 할까요?" 형식 사용 안 함
- 의견 먼저, 확인 나중. "이렇게 할게요, 맞죠?" 형식으로 제안
- 이유 한 줄 포함.

### 전략 공백 선제 발견
아침 브리핑 마지막에 공백 스캔 결과 추가:
```
💡 PO 건의
─────────
[발견한 공백]: [한 줄 설명] → 제안: [구체적 행동]
```

---

## 출력 원칙

- 터미널: 브리핑 요약만 (10줄 이내)
- 상세 분석이 필요하면 `docs/po/PO_ANALYSIS_YYYYMMDD.md`에 저장 후 경로 안내
```

---

## 파일 8: `.claude/skills/day/SKILL.md`

```markdown
---
name: day
description: 오늘의 Daily Note 생성 또는 업데이트. 아침에 목표 세팅, 중간/저녁에 git 기반 진행 기록. "/day"로 호출.
user-invocable: true
allowed-tools: "Read, Write, Edit, Bash(git log *), Bash(date *), Bash(ls *), Glob, AskUserQuestion"
---

# Daily Note (/day)

오늘의 Daily Note를 생성하거나 업데이트한다.

---

## 경로

- Daily Note 폴더: `Daily/`
- 파일명: `YYYY-MM-DD.md` (오늘 날짜)

---

## 핵심 원칙: 데일리 노트 = 컨텍스트 브리핑

**데일리 노트 하나만 읽으면 오늘의 모든 맥락을 파악할 수 있어야 한다.**

---

## 워크플로우

### Step 1: 오늘 날짜 확인
```bash
date +%Y-%m-%d
```

### Step 2: 파일 존재 여부 확인

`Daily/YYYY-MM-DD.md` 파일이 있는지 확인.

### Step 3-A: 파일 없음 → 새로 생성 (아침 모드)

1. 어제 노트 읽기 (필수): `Daily/` 폴더에서 가장 최근 파일을 찾아 읽는다
2. 어제의 미진행/이슈와 내일 항목을 이월 목록으로 추출
3. 아래 구조로 생성:

```markdown
---
date: YYYY-MM-DD
tags: [daily]
goals_completed: 0
goals_total: N
---

# YYYY-MM-DD

## 📌 현재 상황 요약
> 이 섹션을 읽으면 오늘의 맥락을 즉시 파악할 수 있습니다.

**어제(M/D) 성과**: N개 목표 중 N개 완료
- 성과 요약 1~3

**진행 중 프로젝트 현황**:
- **프로젝트명** — 현재 상태 → 다음 액션

---

## 🎯 오늘의 목표
- [ ] 이월 항목
- [ ] 새 목표

### 이월 내역 (M/D → M/D)
- 항목명 — 출처(미진행/내일)

---

## ✅ 완료한 작업
-

## 🤖 Claude Code 작업
<!-- Claude Code가 자동으로 추가합니다 -->

## 📝 메모 & 인사이트
-

## 🚧 블로커 / 이슈
-

## 미진행 / 이슈
-

## 🔜 내일 할 일
- [ ]
```

### Step 3-B: 파일 있음 → 업데이트 (저장 모드)

1. 기존 파일 읽기
2. git log로 오늘 커밋 가져오기:
   ```bash
   git log --format="%ai %s" --after="YYYY-MM-DDT00:00:00" --before="YYYY-MM-DDT23:59:59" --reverse
   ```
3. 커밋을 "완료한 작업" 섹션에 업데이트
4. 완료된 목표는 체크박스 체크 (`- [x]`)

---

## 출력

터미널에 간단히:
```
Daily Note YYYY-MM-DD [생성됨/업데이트됨]
- 오늘 커밋: N건
- 주요 성과: N건
- 미진행: N건
```
```

---

## 파일 9: `.claude/skills/retro/SKILL.md`

```markdown
---
name: retro
description: 주간/월간 회고 에이전트. git log + Daily Note 분석으로 반복 패턴, 병목, 이월 태스크를 탐지. 학습 포인트를 .claude/rules/에 자동 제안하여 자기개선 사이클을 완성. "회고 해보자", "이번 주 돌아보자", "retro 해줘" 등으로 호출.
user-invocable: true
allowed-tools: "Bash(git log *), Bash(git diff *), Bash(git shortlog *), Read, Glob, Grep"
---

# Retro (회고/학습 에이전트)

같은 실수를 반복하지 않기 위한 주간/월간 회고. 데이터 기반으로 패턴을 탐지하고, 발견된 패턴을 `.claude/rules/`에 규칙으로 제안하여 프로젝트 자기개선 루프를 실행.

---

## 사용법

```
/retro              # 이번 주 회고 (기본 7일)
/retro --week       # 지난 7일
/retro --month      # 지난 30일
/retro --days 14    # 지난 14일
```

---

## 회고 프로토콜

### Step 1: 커밋 히스토리 수집
```bash
git log --oneline --since="7 days ago" --all
git shortlog --since="7 days ago" --all -s -n
git log --since="7 days ago" --all --name-only --format="" | sort | uniq -c | sort -rn | head -20
git log --oneline --since="7 days ago" --all | grep -i "fix\|hotfix\|revert"
```

### Step 2: Daily Note 분석

`Daily/YYYY-MM-DD.md` 파일에서:
- 체크 안 된 항목 (`- [ ]`) → 이월 태스크
- 이월 횟수 카운트

### Step 3: 7가지 패턴 탐지

- **패턴 A** — 반복 수정: 같은 파일 3회+ 수정, fix 커밋 30%+
- **패턴 B** — 이월 태스크: 3일+ 미완성
- **패턴 C** — 집중/분산: 특정 파일 커밋 몰림 또는 작업 분산
- **패턴 D** — 예상 vs 실제 소요 시간
- **패턴 E** — 계획:실행 비율 (BACKLOG P0/P1 완료율)
- **패턴 F** — 고객 접촉 여부
- **패턴 G** — 인프라 과잉 투자 (도구/자동화 구축이 50%+)

### Step 4~5: 학습 포인트 → rules/ 추가 제안

---

## 출력 형식

리스트보다 자연스러운 문장 서술. 발견된 패턴을 마치 옆에서 보고 있던 사람이 솔직하게 말해주는 것처럼.

```markdown
## Retro Report — YYYY-MM-DD ~ YYYY-MM-DD (N일)

총 N개 커밋.

---

### 이번 주 뭘 했나
[2-4문장 서술]

### 날카로운 관찰
[패턴을 문장으로 서술]

### 잘 된 것
[1-3가지, 구체적으로]

### 다음 주에 달라져야 할 것
[행동 가능한 제안 1-3가지]

### rules/ 추가 제안
(있을 때만)
```

자동 저장: `docs/retro/RETRO_YYYYMMDD.md`
```

---

## 파일 10: `.claude/skills/devils-advocate/SKILL.md`

```markdown
---
name: devils-advocate
description: 설계/기획/코드에 대한 비판적 리뷰 에이전트. "잘 됐습니다" 확증편향 방지. "반박해봐", "비판해줘", "문제 없어?", "약점 찾아줘", "리스크 뭐야" 등으로 호출.
user-invocable: true
allowed-tools: "Read, Glob, Grep, Bash(git diff *), Bash(git log *)"
---

# Devils Advocate (비판적 설계 리뷰)

기획/설계/코드를 독립적 비판 관점으로 검토. "이것이 올바른 접근인가"를 묻는다.

---

## 사용법

```
/devils-advocate                     # 최근 변경사항 비판 리뷰
/devils-advocate [파일경로]           # 특정 파일
/devils-advocate [기획 내용 직접 입력] # 텍스트 설계안 비판
```

---

## 비판 프로토콜

### 3가지 관점에서 반드시 비판

**관점 A — 보안/안정성 위험**
- 인증 우회, 하드코딩 시크릿, 예외 처리 누락
- 데이터 손실 가능성, 멀티디바이스 충돌

**관점 B — 과소/과대 추정**
- 실제 소요 시간이 추정보다 2배+ 걸릴 이유
- 엣지 케이스 과소평가, 오버엔지니어링

**관점 C — 더 나은 대안**
- 더 적은 코드/복잡도로 달성하는 방법
- 6개월 후 유지보수 가능한가?

### 심각도

| 심각도 | 기준 |
|--------|------|
| CRITICAL | 데이터 손실, 보안 취약점, 시스템 중단 |
| HIGH | 기능 실패, 상당한 기술부채 |
| MEDIUM | 유지보수 어려움, 성능 문제 |
| LOW | 코드 스타일, 소수 개선점 |

반드시 1개 이상 구체적 대안 제시.

리포트 마지막에 반드시: "이 비판 중 반박할 지점이 있으면 말씀해주세요."
```

---

## 파일 11: `.claude/skills/maker-checker/SKILL.md`

```markdown
---
name: maker-checker
description: 독립 검증 에이전트. 작업 결과물만 보고 독립적으로 검증. 컨텍스트 격리로 확증편향 방지.
user-invocable: true
allowed-tools: "Read, Glob, Grep, Bash(python3 *), Bash(git diff *), Bash(git log *), Bash(wc *)"
---

# Maker-Checker (독립 검증)

작업물에 대한 독립적 검증. 작업자의 의도나 추론은 보지 않음.

---

## 사용법

```
/maker-checker                    # 최근 변경사항 검증
/maker-checker [파일경로]          # 특정 파일 검증
/maker-checker --since HEAD~3     # 최근 3커밋 검증
```

---

## 검증 프로토콜

1. `git diff --name-only HEAD~1` 로 아티팩트 수집
2. 카테고리별 검증:
   - **Python**: `ast.parse()` 구문 검사, import 존재 여부
   - **데이터**: 입출력 건수 일치, SQLite integrity_check
   - **문서(MD)**: frontmatter 존재, 깨진 wikilink
3. 리포트 작성: PASS / PASS_WITH_WARNINGS / FAIL

---

## 컨텍스트 격리 (핵심 원칙)

Checker에게 전달: 변경 파일 목록, git diff, CLAUDE.md
전달 금지: 작업 에이전트의 대화 내역, "잘 됐습니다" 보고
```

---

## 파일 12: `.claude/skills/commit-flow/SKILL.md`

```markdown
---
name: commit-flow
description: One-command git workflow for quick commits. Detects device, stages files, commits with proper format, and optionally pushes.
allowed-tools: "Bash(git *), Read, AskUserQuestion"
---

# Commit Flow

staging → commit → push 원스톱 워크플로우.

---

## Flow

1. **디바이스 감지**: `hostname` → 브랜치 접두사 결정
2. **상태 확인**: `git status`, `git branch --show-current`
3. **main 브랜치 체크**: main이면 → 피처 브랜치 생성 제안
4. **파일 스테이징**: 사용자에게 범위 확인
5. **커밋**: 타입 자동 감지 + HEREDOC + Co-Authored-By
6. **푸시**: 사용자에게 확인 후 push

---

## Commit Message

타입 자동 감지:
- add/new/create → `feat:` | fix/bug → `fix:` | doc → `docs:` | refactor → `refactor:`

항상 포함:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## Pre-Flight Checks

- 10개+ 파일: 사용자 확인 필요
- 시크릿 스캔: api_key/password/secret/token 감지 시 경고
```

---

## 파일 13: `.claude/skills/dev-cycle/SKILL.md`

```markdown
---
name: dev-cycle
description: 개발 표준 사이클 오케스트레이터. 조사→기획→반박→구현→검증→회고 6단계를 순서대로 진행. "/dev-cycle", "개발 사이클 돌려줘", "end-to-end로 해줘" 등으로 호출.
user-invocable: true
allowed-tools: "Read, Glob, Grep, Write, Edit, Bash(git *), Bash(python3 *)"
---

# Dev Cycle (개발 표준 사이클)

리서치부터 회고까지 6단계를 순서대로 진행하는 오케스트레이터.

```
[RESEARCH PHASE]          [BUILD PHASE]
  1. 리서치                  4. 구현
  2. 기획        → GATE →    5. 검증
  3. 반박                    6. 회고
```

---

## 사용법

```
/dev-cycle research [주제]   # 1~3단계만
/dev-cycle build [대상]      # 4~6단계만
/dev-cycle [주제]            # 전체 6단계
```

---

## 단계별 역할

- **STEP 1 리서치**: 코드베이스 탐색 + 외부 레퍼런스 수집
- **STEP 2 기획**: 구현 범위, 파일 구조, 작업 순서 정의
- **STEP 3 반박**: `/devils-advocate` 적용 — CRITICAL/HIGH 이슈 발견
- **⛔ GATE**: 사용자 승인 후 구현 진입
- **STEP 4 구현**: STEP 3 반박 반영한 코드 작성
- **STEP 5 검증**: `/maker-checker` 적용
- **STEP 6 회고**: 예측 정확도, 소요 시간, rules/ 추가 제안

---

## 저장 규칙

| 단계 | 저장 위치 |
|------|---------|
| STEP 1~2 결과 | `docs/plans/PLAN_[주제]_YYYYMMDD.md` |
| STEP 5 검증 | `docs/verification/checker_report_YYYYMMDD.md` |
| STEP 6 회고 | `docs/retro/RETRO_[주제]_YYYYMMDD.md` |
```

---

## 파일 14: `.claude/skills/git-workflow/SKILL.md`

```markdown
---
name: git-workflow
description: Handles all git operations (branch, commit, push, merge, conflict resolution). Use whenever git commands are needed or user mentions git, commit, push, branch, merge.
allowed-tools: "Bash(git *), Read, Grep"
---

# Git Workflow

---

## Branch Rules

- Format: `{device-prefix}/{descriptive-name}`
- main 브랜치: merge only, 직접 커밋 금지
- 새 브랜치 전 반드시 `git pull origin main`

---

## Commit Rules

- 커밋 메시지: `{type}: {설명}` (feat/fix/docs/refactor/test/chore)
- 항상 `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` 포함
- HEREDOC으로 멀티라인 메시지 작성
- `git add`는 파일 지정 (git add -A 지양)
- 커밋 후 사용자에게 푸시 여부 확인

---

## Merge Conflict

1. `git status`로 충돌 파일 확인
2. 양쪽 변경 의도 파악 후 지능적으로 병합
3. 확신 없으면 사용자에게 확인
4. 해결 후 `git add` → `git commit`
```

---

---

## 파일 15: `CLAUDE.md` (프로젝트 루트)

> ⚠️ 아래에서 `## 프로젝트 개요` 섹션은 새 프로젝트에 맞게 수정할 것.
> 나머지 섹션(출력 규칙~참조 문서)은 그대로 사용 가능.

```markdown
# Claude Code 프로젝트 규칙

## 프로젝트 개요

[프로젝트 설명을 여기에 작성]

## 출력 규칙 (컨텍스트 절약 최우선)

- 터미널 출력은 최소화 — 컨텍스트 윈도우 보호가 최우선
- 답변은 3-5줄 요약. 상세 내용은 MD 파일 저장 후 경로만 안내
- 코드/로그/구현 과정 → 터미널 프린트 금지. 필요시 파일로 저장
- 서브에이전트 결과 → 핵심 1-2줄만 터미널에 출력
- 파일 내용 인용/복사 금지 → 요약하거나 경로만 안내
- 표(table)는 5행 이내. 그 이상은 파일 저장
- When compacting, always preserve: 변경 파일 목록, 미해결 사항, 현재 작업 브랜치

## 자율 실행

| 레벨 | 범위 | 예시 |
|------|------|------|
| 자율 가능 | 코드 스타일, 에러 핸들링, 테스트 | 버그 수정, 리팩토링 |
| 계획 필요 | 새 파일, API 변경, 설정 변경 | Plan Mode 사용 |
| 확인 필수 | 파일 삭제, DB 변경, 10개+ 파일 수정 | 반드시 사용자 승인 |

## 작업 방식

- 멀티파일 변경, 아키텍처 결정 → Plan Mode 먼저
- 단순 수정 (오타, 로그 추가) → 바로 구현
- 구현 후 테스트/검증까지 한 흐름으로
- 코드 리뷰 시 실행 검증 필수 — 정적 분석만으로 종료 금지
  - 스크립트: 실제 실행하고 출력/결과 확인
  - 외부 연동(SSH, API, DB): dry-run 또는 실제 호출로 확인
- 같은 접근 2회 실패 → 다른 방법 시도
- 3회 이상 막히면 → 사용자에게 상황 설명
- 탐색/조사가 길어지면 서브에이전트로 위임
- 결과가 길면 파일로 저장하고 경로만 보고

## 자기개선 (Self-Improving)

- 실수 발생 시 → 일반 패턴으로 추상화 → rules/에 규칙 추가
- 규칙 추가 시 루트 CLAUDE.md보다 `.claude/rules/` 우선 — 루트는 70줄 이내 유지
- 같은 유형의 실수 반복 방지가 목적
- 규칙이 비대해지면 주기적으로 정리 (Claude가 이미 올바르게 수행하는 항목은 삭제)

## 성능 모드

품질 우선. 토큰 절약보다 정확성과 완성도. 추정 금지, 사실 확인 철저히.
```

---

## 파일 16: `~/.claude/CLAUDE.md` (전역 설정)

> ⚠️ 이 파일은 **홈 디렉토리** 기준 경로 (`~/.claude/CLAUDE.md`).
> 프로젝트 폴더가 아닌 `~/.claude/` 안에 만들어야 함.
> 이미 `~/.claude/CLAUDE.md`가 있다면 아래 내용을 **추가**할 것.

```markdown
# 문제 해결 원칙 (최우선 적용)

## "못합니다" 금지 규칙
- **절대로 첫 시도에 "못합니다"라고 하지 않는다.**
- 직접 방법이 막히면 반드시 대안을 탐색하고 시도한 뒤에 보고한다.
- 솔루션/기획/문제해결 제안 시, 항상 MCP·우회·자동화 방법을 포함하여 다각도로 제시한다.

## 막혔을 때 시도 순서
1. **직접 API/CLI** — 공식 API, REST, GraphQL 등 가장 먼저 시도
2. **Playwright MCP** — 웹 UI 접근이 필요하면 브라우저 자동화로 우회
3. **다른 MCP 서버** — 설치된 MCP 중 적합한 것 활용
4. **Bash/curl/python** — curl, wget, requests 등으로 직접 요청
5. **스크립트 즉석 작성** — 필요한 도구를 그 자리에서 Python/Node로 만들어 실행
6. **위 모두 실패 시만** — "시도한 방법 [목록]이 모두 막혔습니다. [구체적 조치]가 필요합니다."

## 솔루션·기획 제안 시 필수 포함 항목
사용자가 해결책, 기획, 방법을 물어볼 때 반드시 다음을 함께 제시:
- **정공법** — 공식 API, 공식 문서 기반 접근
- **MCP 활용법** — 설치된 MCP로 처리하는 방법
- **우회법** — API 없을 때 브라우저 자동화 / 스크래핑 등
- **자동화법** — cron, webhook, 이벤트 트리거 기반 자동 실행 방법
- **비용·난이도 평가** — 각 방법의 구현 난이도와 유지보수 부담 한 줄 요약

# 세션 시작 규칙
- /clear 후 새 대화 시작 시, 자동으로 다음을 수행하여 맥락을 파악한다:
  1. `git log --oneline -10` — 최근 커밋 히스토리 확인
  2. `git diff --stat HEAD~3` — 최근 3커밋의 변경 파일 확인
  3. 현재 작업 디렉토리의 프로젝트 구조 간략 파악
- 파악한 맥락을 간결하게 요약하여 보여준 뒤, "이어서 무엇을 하면 될까요?" 로 시작한다
- 사용자가 별도 지시 없이 대화를 시작하면 이 규칙을 적용한다

# 작업 스타일
- 병렬 서브에이전트를 적극 활용하여 여러 주제를 동시에 조사
- 중간 결과물도 구조화하여 제시 (완전한 결과를 기다리지 말 것)
- 조사 범위가 넓을 때는 먼저 개요(outline)를 제시하고 사용자 확인 후 심층 조사
- WebFetch가 접근 불가한 사이트가 있으면 대안 경로 탐색 (캐시, 아카이브 등)

# 검증 기준
- 주장별 신뢰도: ✅ 검증됨 / ⚠️ 부분확인 / ❓ 미검증 / ❌ 반박됨
- 데이터의 시점(날짜)을 반드시 명시
- 마케팅 자료와 객관적 분석을 구분
```

---

이제 위 파일들을 모두 생성해줘. 생성 후:
1. `.claude/hooks/format-python.sh`에 실행 권한 부여: `chmod +x .claude/hooks/format-python.sh`
2. `docs/po/` 폴더 생성 (BACKLOG.md, VISION.md, DISCOVERY_LOG.md 빈 파일로)
3. `Daily/` 폴더 생성

완료 후 어떤 파일을 만들었는지 목록만 간단히 알려줘.

=== 여기까지 복사 ===

---

## 사용 후 추가로 할 것

### 1. BACKLOG.md 초기화

`docs/po/BACKLOG.md`에 최소 구조:
```markdown
---
created: YYYY-MM-DD
tags: [backlog]
status: active
type: reference
---

# BACKLOG

## In Progress
(없음)

## Backlog
- [ ] [인프라] 환경 설정 완료 확인 | priority: P1 | added: YYYY-MM-DD

## Done
```

### 2. VISION.md 초기화

`docs/po/VISION.md`에 프로젝트 비전 작성.

### 3. 전역 CLAUDE.md 수동 복사

`~/.claude/CLAUDE.md`는 붙여넣기 프롬프트로 만들 수 없음 (글로벌 파일).
새 장비의 `~/.claude/CLAUDE.md`에 기존 내용을 직접 복사해야 함.

### 4. ruff 설치 확인 (Python 포매팅 훅용)

```bash
pip install ruff
# 또는
brew install ruff
```

### 5. 프로젝트별 커스터마이징

- `git-workflow/SKILL.md` 안의 디바이스 경로를 새 프로젝트에 맞게 수정
- `commit-flow/SKILL.md` 안의 호스트명 감지 로직 확인
- `verify-gate.py` 안의 프로젝트별 검증 로직 수정 (carnegie 관련 부분 제거 또는 교체)
