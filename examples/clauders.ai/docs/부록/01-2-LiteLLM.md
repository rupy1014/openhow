---
slug: 부록-LiteLLM
title: "LiteLLM"
nav: LiteLLM
order: 3
---

**100개 모델을 코드 한 줄로 바꾸고 싶으면 이거야.**

Claude 쓰다가 GPT로 바꾸고 싶어?
LiteLLM이면 모델 이름만 바꾸면 돼. 나머지 코드는 그대로.

---

## 어떻게 써?

:::steps

### 설치

```bash:터미널
pip install litellm
```

### 코드에서 모델 이름만 바꿔

```python:Python
from litellm import completion

# Claude 쓸 때
response = completion(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": "안녕"}]
)

# GPT로 바꾸고 싶으면 model만 변경
response = completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "안녕"}]
)
```

같은 코드야. `model`만 달라.

:::

---

## API 키는 필요해?

**필요해.**

llm-mux랑 다른 점이 이거야. 각 서비스의 API 키를 환경변수에 넣어야 해.

```bash:터미널
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
```

키가 있어야 하지만, 코드를 서비스마다 따로 짤 필요가 없는 거야.

---

## 팀이랑 같이 쓸 수 있어?

**프록시 모드**를 켜면 돼.

```bash:터미널
litellm --model claude-sonnet-4-20250514 --port 4000
```

이러면 `localhost:4000`에서 OpenAI 호환 API가 열려.
팀원들이 이 주소로 요청하면, 키 관리는 서버 한 곳에서만 하면 돼.

---

## 한 줄 정리

LiteLLM은 여러 AI 모델을 같은 코드로 쓰게 해주는 도구야. API 키가 있으면 이게 제일 유연해.
