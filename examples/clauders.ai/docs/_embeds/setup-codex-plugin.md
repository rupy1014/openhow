---
hidden: true
---

# Codex 플러그인 — Claude 기획 + Codex 실행 자동 위임

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣으면 됩니다.

---

=== 여기서부터 복사 ===

아래 순서대로 실행해줘. Codex 플러그인을 설치하고, Claude가 기획/하네스 역할을 하면서 코딩과 리뷰는 Codex에 자동 위임하는 환경을 세팅하는 거야.

---

## 1단계: Codex CLI 설치 확인

터미널에서 확인해줘:

```bash
codex --version
```

설치 안 돼 있으면:

```bash
npm install -g @openai/codex
```

---

## 2단계: 플러그인 설치

Claude Code 프롬프트에서 아래 3개를 순서대로 실행해줘:

```
/plugin marketplace add openai/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
```

설치 확인:

```
/codex:setup
```

---

## 3단계: 글로벌 CLAUDE.md에 역할 분담 추가

`~/.claude/CLAUDE.md`에 아래 내용을 **추가**해줘 (기존 내용 유지). 모든 프로젝트에 적용돼.

특정 프로젝트에만 적용하려면 프로젝트 루트 `CLAUDE.md`에 넣어도 돼.

````markdown
## 역할 분담 — Claude + Codex

- **Claude**: 전략, 분석, 작업 분해, 아키텍처 설계, 최종 판단. **코드 직접 수정 금지.**
- **Codex**: 구현, 리팩토링, 테스트 작성, 버그 수정. `/codex:rescue`로 실행.

### 위임 프로토콜

Codex에 작업을 넘길 때 반드시 4가지를 포함한다:

1. **TASK** — 원자적 목표 (한 문장)
2. **EXPECTED** — 성공 기준
3. **MUST NOT** — 금지 행동
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

### 병렬 실행

독립적인 작업이 2개 이상이면 `--background`로 병렬:

```
/codex:rescue --background [작업 A]
/codex:rescue --background [작업 B]
/codex:status
```

### 리뷰 정책

- 구현 완료 후 반드시 `/codex:review` 실행
- 아키텍처 변경이 큰 경우 `/codex:adversarial-review` 추가
````

---

## 4단계: 모델 설정 (선택)

Codex가 사용할 기본 모델을 설정하려면 `~/.codex/config.toml`:

```toml
model = "o4-mini"
model_reasoning_effort = "high"
```

---

## 5단계: 동작 확인

아래 명령으로 테스트:

```
/codex:rescue 현재 프로젝트의 README.md를 읽고, 프로젝트 구조를 한 줄로 요약해줘
```

결과가 나오면 세팅 완료.

---

## 완료 후 알려줘야 할 것

1. 어떤 파일을 수정했는지 목록
2. `/codex:setup` 결과 스크린샷 또는 텍스트
3. 테스트 결과

=== 여기까지 복사 ===

---

## 세팅 후 사용법

### 기본: 코딩 요청

평소처럼 요청하면 Claude가 분석 후 자동으로 Codex에 위임해.

```
"결제 취소 API 만들어줘"
→ Claude: 작업 분해 → /codex:rescue로 위임 → 리뷰 → 완료 보고
```

### 리뷰만

```
/codex:review
/codex:adversarial-review
```

### 백그라운드 작업

```
/codex:rescue --background 백엔드 구현
/codex:status
/codex:result
```

### 리뷰 게이트 (자동 리뷰)

Claude 응답마다 Codex가 자동 리뷰:

```
/codex:setup --enable-review-gate
```

토큰 소모 주의. 끄려면:

```
/codex:setup --disable-review-gate
```
