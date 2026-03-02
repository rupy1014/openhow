---
slug: 부록-OpenRouter
title: "OpenRouter"
nav: OpenRouter
order: 3
---

**설치 없이 바로 쓰고 싶으면 이거야.**

컴퓨터에 아무것도 설치 안 해도 돼.
회원가입하고 API 키 하나 받으면 끝이야.

---

## 어떻게 시작해?

**Step 1.** openrouter.ai에 가서 회원가입해.

**Step 2.** 대시보드에서 API 키를 만들어.

**Step 3.** 이 키 하나로 모든 모델을 써.

```bash
curl https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer sk-or-..." \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-sonnet-4-20250514",
    "messages": [{"role": "user", "content": "안녕"}]
  }'
```

OpenAI 형식이야. 엔드포인트만 OpenRouter로 바꾸면 돼.

---

## 뭐가 좋아?

**결제가 하나로 통합돼.**

Claude API 따로 결제, OpenAI API 따로 결제 — 이런 거 없어.
OpenRouter에 충전하면 그 안에서 어떤 모델이든 써.

모델별 가격이 다르니까 대시보드에서 확인해.
같은 모델이라도 OpenRouter를 거치면 약간 더 비쌀 수 있어. 중간 수수료가 있거든.

---

## 언제 쓰면 좋아?

설치가 귀찮거나, 여러 모델을 빠르게 비교하고 싶을 때.

로컬에 아무것도 안 깔아도 되니까 시작이 제일 빨라.
근데 매번 클라우드를 거치니까, 속도나 비용이 민감하면 다른 방법도 고려해.

---

## 한 줄 정리

OpenRouter는 설치 없이 모든 AI 모델을 하나의 API 키로 쓰게 해주는 서비스야. 빠르게 시작하고 싶으면 이걸 써.
