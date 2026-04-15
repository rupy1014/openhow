---
slug: 레시피-intent-engineering
title: "Intent Engineering — 의도 중심 개발 세팅"
nav: Intent Engineering
order: 6
thumbnail: "./images/img-RC06.png"
---

**바이브 코딩 시대에 린스타트업을 실행하기 위한 엔지니어링 패턴이야.**

AI에게 "만들어줘"만 반복하면 코드는 쌓이는데 방향이 없어져.
의도(Intent)를 먼저 구조화하고, 그걸 AI에게 넘기는 패턴이야.

커맨드 두 개로 전체 사이클이 돌아가:

```
/intent — 의도를 발견하고 수렴시키는 도구
/cowork — 수렴된 의도를 AI에게 위임해서 구현하는 도구
```

---

## 왜 이렇게 해?

> 리포에서 AI가 재생성할 수 없는 것이 무엇인가?

코드? 다시 쓸 수 있어. 테스트? 파생물이야.

**남는 건 의도뿐이야.** 왜 만드는지, 무엇을 만드는지, 무엇을 하지 않을지.

| 문제 | 증상 |
|------|------|
| 의도가 처음부터 완전하지 않다 | "이건 아닌데" → 다시 만들기 |
| 코드는 쌓이는데 의도가 없다 | "이 파일 왜 있지?" |
| 방향이 바뀌면 코드가 부채가 된다 | 피벗할 때 뭘 살릴지 판단 불가 |

---

## 전체 워크플로우

```
/intent new → explore → clarify → /cowork → done
  (발견)      (실험·학습)  (확정)    (실행)    ↓
                                          사람이 Measure
                                              ↓
                                    /intent "유저가 이렇게 말했어"
                                              ↓
                                    재개 or 새 intent → 반복
```

Build-Measure-Learn 루프가 이 두 커맨드 안에서 돌아가.
Build와 Learn은 AI가 하고, Measure는 사람이 해.

---

## 어떻게 쓰냐

### /intent — 자연어로 의도 관리

서브커맨드 안 외워도 돼. 자연어로 말하면 알아서 추론해:

```
"결제 느려서 고치고 싶어"     → 새 의도 생성 (new)
"Redis 방식 한번 해볼까"      → 탐색 (explore)
"이대로 가자"                → 확정 (clarify)
"방향 바꿔야 할 것 같아"      → 피벗 (pivot)
"이거 안 해"                 → 폐기 (kill)
```

| 기능 | 설명 |
|------|------|
| 인터뷰어 모드 | Why → What → Not 순서로 한 질문씩 |
| 자동 크기 체크 | What 7항목 이상이면 쪼개기 제안 |
| 시그널 착지 | 유저 피드백을 `[signal]` 태그로 기록 |
| 정체 감지 | exploring 14일+ → 경고 |

### /cowork — 의도 기반 오케스트레이션

Claude가 기획/분석하고, Codex가 구현하는 패턴이야:

```
Phase 0   — 자연어로 작업 파악
Phase 0.5 — intents/에서 의도 자동 로드 ← 핵심
Phase 1   — 분석 & 계획 (최대 5스텝)
Phase 2   — Codex 위임 실행 (격리)
Phase 3   — 퇴고 & 최종 리뷰
```

Phase 0.5에서 의도 파일을 자동으로 로드해서, Why/What/Not/Learnings가 모든 Phase에 반영돼.

:::tip
Codex 없이도 돼. Codex가 없으면 Claude가 직접 코딩으로 전환해.
:::

---

## 의도 문서 (INTENT.md)

`/intent new`를 실행하면 이런 파일이 생겨:

| 섹션 | 역할 |
|------|------|
| **Why** | 근본 동기. 피벗해도 안 바뀜 |
| **What** | 해결책. 탐색하면서 진화 |
| **Not** | 금지. 실험에서 자라남 |
| **Learnings** | 실험 기록. 실패의 자산화 |
| **Footprint** | 코드 발자국. /cowork가 자동 기록 |
| **Backlog** | 보류. 다음 이터레이션의 씨앗 |

AI에게 "결제 기능 만들어줘"라고 하는 것과,
"결제가 느려서 이탈하는 문제를 해결하려고 한다. 쿼리 최적화 방향이고, Redis는 이미 검토했는데 효과 없었다."라고 하는 것은 다르잖아.
후자가 INTENT.md가 자동으로 주입해주는 문맥이야.

---

## 어떻게 깔아?

아래 복사 버튼으로 커맨드 파일 설치부터 테스트까지 한 번에 할 수 있어.

:::copy-embed _embeds/setup-intent-cowork Intent + Cowork 설정 프롬프트
:::

---

## 상태 전이

```
seed → exploring → clarified → building → done
  │        │           │
  └────────┴───────────┴──────→ killed
```

| 상태 | 의미 | 다음 행동 |
|------|------|----------|
| seed | Why만 있음 | `/intent explore` |
| exploring | 가설 실험 중 | 계속 탐색 or `/intent clarify` |
| clarified | What/Not 수렴 완료 | `/cowork`로 구현 |
| done | 완료 | Measure → 재개 or 새 intent |
| killed | 폐기. 학습은 보존 | `_killed/`로 이동 |

**핵심: clarified가 /cowork의 입력이야.** seed에서 바로 코드 만들면 삽질이고, exploring을 거쳐야 수렴해.

---

## 더 알아보기

- **설계 철학**: [intent.roboco.io](https://intent.roboco.io)
- **GitHub**: [roboco-io/intent-engineering](https://github.com/roboco-io/intent-engineering)
- **Codex 오케스트레이션 기초**: [Claude + Codex 오케스트레이션](./03-codex-orchestration.md)

---

## 한 줄 정리

의도를 설계하고, AI에게 위임하고, 시그널을 받아서 반복해. 이게 바이브 코딩 시대의 린스타트업이야.
