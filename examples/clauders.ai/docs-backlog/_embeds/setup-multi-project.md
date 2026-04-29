---
hidden: true
---

# 멀티프로젝트 오케스트레이션 설정 프롬프트

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣어.

---

=== 여기서부터 복사 ===

이 모노레포에 멀티프로젝트 오케스트레이션을 세팅해줘.

## 1. 프로젝트 레지스트리 생성

프로젝트 구조를 분석해서 `projects.json`을 만들어줘. 이 형식을 따라:

```json
{
  "projects": {
    "프로젝트명": {
      "path": "상대 경로",
      "type": "프레임워크",
      "shared": ["공유하는 모듈"]
    }
  },
  "aliases": {
    "단축명": "프로젝트명"
  },
  "shared_modules": {
    "모듈명": {
      "path": "상대 경로",
      "consumers": ["사용하는 프로젝트들"]
    }
  }
}
```

## 2. 래퍼 스크립트 생성

`scripts/run-codex.sh`를 만들어줘. 핵심 기능:

- **프로젝트 해석**: 단축명, 정식명, 전체 경로 모두 지원
- **공유 모듈 경고**: `_shared` 수정 시 영향받는 프로젝트 목록을 프롬프트에 주입
- **JSON 응답**: Codex 결과를 `{"status":"done","summary":"...","files_modified":[],"next_steps":[],"blocked_reason":""}` 형식으로 반환

## 3. CLAUDE.md에 오케스트레이션 규칙 추가

```markdown
## Codex 오케스트레이션 (멀티프로젝트)

### 역할 분담
- **Claude**: 전략, 작업 분해, 크로스 프로젝트 조율
- **Codex**: 단일 프로젝트 내 구현

### 위임 프로토콜
TASK / EXPECTED / MUST NOT / CONTEXT 4가지 포함.

### 래퍼 스크립트
bash scripts/run-codex.sh <project> <task>

### 안전 규칙
- 같은 프로젝트 내 작업은 병렬 금지
- _shared/ 수정은 순차 실행 후 소비자 업데이트
- 3번 연속 실패 시 Codex 위임 중단
```

## 4. 각 프로젝트에 AGENTS.md 생성

각 서브프로젝트 디렉토리에 `AGENTS.md`를 만들어줘. 내용:
- 프레임워크/스택 정보
- 핵심 규칙 (코딩 컨벤션)
- 테스트/빌드 명령어
- JSON 응답 형식

결과를 알려줘:
1. `projects.json` 구조
2. 래퍼 스크립트 위치
3. CLAUDE.md 업데이트 내용
4. AGENTS.md 생성된 프로젝트 목록

=== 여기까지 복사 ===
