---
slug: 레시피-codex-plugin
title: "Codex 플러그인"
nav: Codex 플러그인
order: 1
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

핵심은 **Codex한테 넘길 때 5요소 프롬프트**를 쓰는 거야:

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

**VERIFY**가 핵심이야. Codex가 돌려주기 전에 스스로 테스트를 돌려. 이걸로 Claude의 퇴고 루프가 확 줄어.

그리고 코드 끝나면 **문서도 백그라운드로 정리**해. 관련 md를 찾아서 반영하고, 1,000줄 넘으면 분할하고, 비슷한 주제가 3개 이상이면 폴더로 묶어.

**`/codex:rescue`와 뭐가 다르냐:**

| | `/codex:rescue` | `/cowork` |
|--|----------------|---------------|
| Claude 역할 | 없음 (포워더) | 기획 + 검증 + 퇴고 |
| 위임 | 메시지 그대로 | 5요소 (VERIFY 포함) |
| 퇴고 | 없음 | 이슈 → 재위임 (최대 3회) |
| 문서 | 없음 | 백그라운드 자동 정리 |

`/cowork`에 인자를 안 넣으면 대화 문맥에서 "다음에 할 일"을 추론해서 물어봐. 논의하다가 그냥 `/cowork` 치면 돼.

---

## 어떻게 세팅해?

아래 세팅 파일을 복사해서 Claude Code에 붙여넣어.

:::copy-embed _embeds/setup-codex-plugin Codex 플러그인 + 오케스트레이션 세팅 파일
:::

Codex CLI 설치, 플러그인 설치, `/cowork` 커맨드 생성까지 Claude가 알아서 해.

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

플러그인 깔면 Codex 호출은 되는데, 진짜 "Claude 기획 + Codex 코딩"을 원하면 `/cowork`을 써. VERIFY로 Codex가 알아서 검증하고, 스니펫으로 토큰 아끼고, 코드 끝나면 문서까지 백그라운드로 정리해. 추가로 뭘 깔 필요 없어.
