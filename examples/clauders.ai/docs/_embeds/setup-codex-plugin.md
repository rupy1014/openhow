---
hidden: true
---

# Codex 플러그인 — Claude 기획 + Codex 실행 자동 위임

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

OpenAI Codex 플러그인을 설치하고, Claude가 오케스트레이터(기획/분석/판단), Codex가 실행자(코딩/리뷰)를 담당하는 환경을 만들어줘.

공식 레포: https://github.com/openai/codex-plugin-cc

## 1. Codex CLI 설치

`codex --version`으로 설치 여부 확인해줘. 없으면:

```bash
npm install -g @openai/codex
```

설치 후 `codex --version`으로 확인.

## 2. 플러그인 설치

`/plugin` 명령은 사용자가 직접 입력해야 해. 아래 3줄을 **순서대로 입력하라고 안내**해줘:

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
```

3개 다 입력했으면 `/codex:setup`으로 확인하라고 알려줘. 로그인이 안 돼 있으면 터미널에서 `codex login`을 실행하라고 안내해줘.

## 3. 글로벌 CLAUDE.md에 역할 분담 추가

`~/.claude/CLAUDE.md` 파일에 아래 내용을 추가해줘. 기존 내용은 유지하고 맨 아래에 붙여.

````markdown
## 역할 분담 — Claude + Codex

- **Claude**: 전략, 분석, 작업 분해, 아키텍처 설계, 최종 판단. **코드 직접 수정 금지.**
- **Codex**: 구현, 리팩토링, 테스트 작성, 버그 수정. `/codex:rescue`로 실행.

### 위임 프로토콜

Codex에 작업을 넘길 때 반드시 4가지를 포함한다:

1. **TASK** — 원자적 목표 (한 문장)
2. **EXPECTED** — 성공 기준 (테스트 통과, 린터 통과 등 기계적으로 검증 가능한 것)
3. **MUST NOT** — 금지 행동 (레이어 위반, 의존성 역전 등 아키텍처 제약)
4. **CONTEXT** — 파일 경로, 패턴, 이전 결과

### 작업 흐름

1. 사용자 요청 → 작업 분석 → 계획 수립
2. 각 작업을 `/codex:rescue`로 위임
3. 결과 확인 → `/codex:review`로 리뷰
4. 이슈 있으면 수정 위임 → 재리뷰
5. 3번 연속 실패 시 Codex 중단, Claude가 직접 처리

### Fallback 정책

Codex가 사용 불가할 때 (토큰 소진, 네트워크 오류, 인증 만료 등):
- `/codex:rescue` 실패 시 Claude가 직접 코드를 작성한다.
- "코드 직접 수정 금지" 규칙은 Codex 정상 작동 시에만 적용.
- Codex 복구되면 다시 위임 모드로 전환.
- Codex 리뷰가 불가하면 Claude가 직접 코드 리뷰한다.

### 리뷰 정책

- 구현 완료 후 반드시 `/codex:review` 실행
- 아키텍처 변경이 큰 경우 `/codex:adversarial-review` 추가
- ⚠️ 리뷰 게이트(Stop hook)를 켜면 Claude↔Codex 루프가 길어질 수 있어. 사용량 주의.

### 병렬 실행

독립적인 작업이 2개 이상이면 `--background`로 병렬:

```
/codex:rescue --background [작업 A]
/codex:rescue --background [작업 B]
/codex:status
```

완료된 작업은 `/codex:result`로 확인, 취소는 `/codex:cancel`.
````

## 완료 확인

모든 단계가 끝나면 아래를 알려줘:
1. `codex --version` 결과
2. `/codex:setup` 결과
3. `~/.claude/CLAUDE.md`에 추가한 내용 요약

=== 여기까지 복사 ===

---

## 세팅 후 사용법

평소처럼 요청하면 Claude가 분석 후 자동으로 Codex에 위임해.

```
"결제 취소 API 만들어줘"
→ Claude: 작업 분해 → /codex:rescue로 위임 → 리뷰 → 완료 보고
```

Codex가 안 되면 Claude가 직접 해. 따로 명령 안 해도 돼.
