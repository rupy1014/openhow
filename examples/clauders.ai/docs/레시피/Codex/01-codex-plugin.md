---
slug: Codex-plugin
title: "Codex 플러그인"
nav: Codex 플러그인
order: 1
thumbnail: "./images/img-CX01.png"
---

**OpenAI가 경쟁사 도구에 공식 플러그인을 만들었어.**

[openai/codex-plugin-cc](https://github.com/openai/codex-plugin-cc) — OpenAI가 직접 만든 Claude Code용 Codex 플러그인이야. 2026년 3월 30일에 공개됐고, 하루 만에 깃허브 스타 1,000개를 넘었어.

---

## 왜 OpenAI가 이걸 만들었냐

Claude Code가 코딩 에이전트 시장을 먹고 있거든.

하루 GitHub 커밋 13만 5천 개. 전체 퍼블릭 커밋의 4%. 연간 매출 25억 달러 규모.

ZDNet 기자 David Gewirtz가 이렇게 말했어: *"내가 아는 프로그래머 전원이 Claude Code를 써. Codex 쓴다는 사람은 아직 한 명도 못 봤어."*

그래서 OpenAI가 택한 전략이 **"이길 수 없으면 들어가라"**야.

개발자가 Codex로 안 오니까, Codex를 Claude Code 안으로 넣은 거야. Slack, Figma, Linear, Notion 플러그인이랑 같은 날 20개 넘게 동시 출시했어.

| Claude Code | Codex |
|-------------|-------|
| 전략, 설계, 분석 | 코드 실행, 구현 |
| 개발자 점유율 압도 | 엔터프라이즈 타겟 |
| $20~200/월 (Pro~Max) | $20~200/월 (Plus~Pro) |

---

## 플러그인이 뭘 해주냐

플러그인을 설치하면 이 커맨드들이 생겨:

| 커맨드 | 역할 |
|--------|------|
| `/codex:rescue` | Codex에 작업 포워딩 (코딩, 버그 수정) |
| `/codex:review` | 변경사항 코드 리뷰 |
| `/codex:adversarial-review` | 설계 결정까지 까는 심층 리뷰 |
| `/codex:status` | 백그라운드 작업 상태 확인 |
| `/codex:result` | 완료된 작업 결과 보기 |
| `/codex:cancel` | 실행 중인 작업 중단 |
| `/codex:setup` | 설치 및 설정 확인 |

:::warning 솔직한 얘기
`/codex:rescue`는 **단순 포워더**야. 사용자 요청을 Codex에 그대로 넘기고 결과를 돌려줄 뿐이야. "Claude가 기획하고 Codex가 짠다" — 이건 플러그인만으로는 안 돼.
:::

---

## 그럼 진짜 오케스트레이션은?

플러그인 위에 **`/cowork`** 커맨드를 깔아야 해.

```
/cowork 결제 취소 API 만들어줘
```

이러면 이렇게 돌아가:

```
Claude 분석 → 계획 확인 → Codex 코딩 → Claude 검증/퇴고 → 완료 보고
                                                          ↓ (백그라운드)
                                                    문서 자동 정리
```

### 핵심: sub-agent 격리

여기서 제일 중요한 게 **컨텍스트 오염 방지**야.

Codex를 Bash 인라인으로 호출하면 프롬프트(코드 스니펫 포함)가 Claude 컨텍스트에 그대로 펼쳐지고, Codex 응답 전체도 올라와. 스텝 5개만 돌리면 컨텍스트가 터져.

```
❌ 인라인 호출 (컨텍스트 오염)
node codex-companion.mjs task --write "TASK: ... CONTEXT: [20줄 코드] ..."
→ 프롬프트 전체가 Claude에 노출
→ Codex 응답 전체가 Claude에 노출

✅ 격리 호출 (sub-agent 패턴)
Claude → Write(/tmp/cowork_step1.md)    ← 프롬프트 파일 작성
      → bash cowork-run.sh task /tmp/cowork_step1.md
      ← JSON 상태 5줄만 반환           ← 결과는 파일에 저장
      → Read(result_file)              ← 필요할 때만 확인
```

래퍼 스크립트(`cowork-run.sh`)가 프롬프트 파일을 받아서 Codex를 호출하고, 결과를 파일에 저장하고, Claude에는 JSON 상태만 돌려줘:

```json
{
  "status": "success",
  "result_file": "/tmp/cowork/result_20260406_143022.txt",
  "result_lines": 80,
  "summary": "Modified 3 files..."
}
```

Claude는 `git diff --stat`으로 변경 확인하고, 필요하면 `result_file`을 Read로 읽어. 전체를 자동으로 받지 않아.

### 5요소 프롬프트는 파일로

프롬프트는 `/tmp/cowork_step1.md`에 Write로 작성해:

```
TASK: 결제 취소 API 추가
EXPECTED: cancel() 호출 시 status → cancelled
MUST NOT: 다른 모델 파일 수정 금지
CONTEXT:
  # models/order.ts lines 12-18:
  export type OrderStatus = 'pending' | 'paid' | 'cancelled'
  async cancel() {
    // TODO: implement
  }
VERIFY: npm test -- --grep "order cancel" 실행, pass/fail 포함해서 돌려줘
```

**CONTEXT**에 파일 경로만 넘기면 Codex가 읽느라 토큰을 낭비해. 핵심 코드 10~20줄을 직접 넣어.

### 뭘 넣어야 하냐
타입/인터페이스 → 호출부 → 파일:라인 순서로 넣어. 타입으로 shape 보여주고, 호출부로 흐름 보여주고, 마지막에 위치만 찍어.

**VERIFY**가 핵심이야. Codex가 돌려주기 전에 스스로 테스트를 돌려. 이걸로 Claude의 퇴고 루프가 확 줄어.

### 상황별 VERIFY 패턴
| 상황 | VERIFY |
|------|--------|
| 로직 변경 | `npm test -- --grep "order cancel"` |
| 타입 변경 | `npx tsc --noEmit` |
| 리팩토링 | `npm run lint && npm test` |
| API 추가 | `curl -s localhost:3000/api/cancel` |

---

## 검증은 누가 하냐

Codex가 코드를 짜면 누군가 검증해야 해. 두 가지 방법이 있어:

### 방법 1: Codex 리뷰 (같은 모델)

```bash
bash cowork-run.sh review
```

Codex가 자기 코드를 리뷰해. 빠르고 간단한데, 자기가 짠 코드의 맹점을 못 잡을 수 있어.

### 방법 2: Claude 리뷰 에이전트 (교차 검증)

Claude Code의 `Agent` 도구로 리뷰 전용 sub-agent를 스폰해:

```
Agent(subagent_type="Explore", prompt="변경된 파일을 읽고 아래 기준으로 검증해줘:
1. EXPECTED 충족 여부
2. MUST NOT 위반 여부
3. 프로젝트 컨벤션 준수
4. 중복 코드/과도한 변경")
```

이러면 Claude와 Codex가 **교차 검증**하는 구조가 돼. Codex가 짜고, Claude가 까고.

### 추천 조합

| 상황 | 검증 방법 |
|------|----------|
| 단순 스텝 (파일 1~2개 변경) | `git diff --stat` 확인만 |
| 일반 스텝 | Codex 리뷰 (`cowork-run.sh review`) |
| 최종 리뷰 / 복잡한 변경 | Claude 리뷰 에이전트 (교차 검증) |
| 아키텍처 변경 | 둘 다 — Codex adversarial-review + Claude 에이전트 |

코드 끝나면 **문서도 백그라운드로 정리**해. 관련 md를 찾아서 반영하고, 1,000줄 넘으면 분할하고, 비슷한 주제가 3개 이상이면 폴더로 묶어.

---

## `/codex:rescue`와 뭐가 다르냐

| | `/codex:rescue` | `/cowork` |
|--|----------------|---------------|
| Claude 역할 | 없음 (포워더) | 기획 + 검증 + 퇴고 |
| 위임 방식 | 메시지 그대로 | 파일 기반 5요소 프롬프트 |
| 컨텍스트 | 오염됨 (인라인) | **격리** (JSON 상태만) |
| 퇴고 | 없음 | 이슈 → 재위임 (최대 3회) |
| 검증 | 없음 | Codex 리뷰 + Claude 에이전트 |
| 문서 | 없음 | 백그라운드 자동 정리 |

`/cowork`에 인자를 안 넣으면 대화 문맥에서 "다음에 할 일"을 추론해서 물어봐. 논의하다가 그냥 `/cowork` 치면 돼.

---

## 어떻게 세팅해?

아래 세팅 파일을 복사해서 Claude Code에 붙여넣어.

:::copy-embed _embeds/setup-codex-plugin Codex 플러그인 + 오케스트레이션 세팅 파일
:::

Codex CLI 설치, 플러그인 설치, `/cowork` 커맨드와 래퍼 스크립트 생성까지 Claude가 알아서 해.

:::warning
Codex는 ChatGPT **유료 구독** 또는 **OpenAI API 키**가 필요해. Free 계정만으로는 쓸 수 없어.
:::

---

## 모델은 뭘 쓰냐

Codex CLI 기본 모델은 `gpt-5.4`야. 별도 설정 안 하면 이걸 써.

바꾸고 싶으면 `~/.codex/config.toml`:

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
```

| 모델 | 언제 쓰냐 |
|------|----------|
| `gpt-5.4` | 기본값. 코딩 + 추론 + 에이전트 통합 |
| `gpt-5.3-codex` | 복잡한 소프트웨어 엔지니어링 전문 |
| `spark` (`gpt-5.3-codex-spark`) | 실시간급 속도. ChatGPT Pro 전용 |

---

## 한 줄 정리

플러그인 깔면 Codex 호출은 되는데, 진짜 "Claude 기획 + Codex 코딩"을 원하면 `/cowork`을 써. 래퍼 스크립트로 컨텍스트 오염 없이 격리 호출하고, VERIFY로 Codex가 알아서 검증하고, Claude 에이전트로 교차 리뷰까지. 추가로 뭘 깔 필요 없어.
