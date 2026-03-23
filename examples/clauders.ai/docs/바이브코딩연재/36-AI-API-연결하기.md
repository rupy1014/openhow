---
slug: 바이브코딩연재-36
title: "AI API 연결하기"
nav: AI API 연결하기
order: 36
---


> "환율 API는 해봤어. 근데 AI한테 뭔가 물어보고 답 받는 건 어떻게 해?"

31편에서 환율 API를 배웠잖아.
남의 서버에 데이터를 요청하고, 응답을 받는 구조.

**AI API도 똑같아.** 다만 돌아오는 게 숫자가 아니라 "문장"이야.

쇼케이스 22개 중 12개가 AI 기능을 쓰고 있어. 캐릭터 채팅, 요약, 번역, 추천... 전부 이 하나의 패턴이야.

---

## AI API가 뭐야?

31편의 환율 API를 떠올려봐.

| | 환율 API | AI API |
|--|---------|--------|
| 보내는 것 | "달러 → 원 환율 알려줘" | "이 글을 한 줄로 요약해줘" |
| 돌아오는 것 | `1350` (숫자) | `"이 글은 AI API 연결 방법을 설명합니다"` (문장) |
| 주소 | exchangerate-api.com | openrouter.ai |

구조가 같아. `fetch`로 요청 보내고, `await`로 기다리고, 응답을 받아.

**차이는 딱 하나.** AI API는 "뭘 해줘"라고 말을 걸면, 말로 답해.
자판기에 동전(요청) 넣으면 음료(응답)가 나오는 거랑 같은데, AI 자판기는 질문을 넣으면 답변이 나와.

---

## OpenRouter 가입 + API 키 받기

AI 모델은 종류가 많아. Claude, GPT, Llama...
각각 따로 결제하면 귀찮잖아.

**OpenRouter는 이걸 하나로 묶어줘.** 카드 한 장으로 모든 편의점을 다 가는 거야.

:::steps

### openrouter.ai에서 가입

Google 계정으로 바로 돼.

### API 키 만들기

대시보드 → **Keys** → **Create Key** → 이름 적고 생성.

`sk-or-v1-...`으로 시작하는 긴 문자열이 나와. **이게 너의 인터넷 여권이야.**

31편에서 배웠지? 이건 절대 코드에 직접 적으면 안 돼.

### .env 파일에 저장

프로젝트 루트에 `.env` 파일을 만들고 여기에 넣어.

```
OPENROUTER_API_KEY=sk-or-v1-여기에_너의_키
```

그리고 `.gitignore`에 `.env`를 추가해. GitHub에 올라가면 남이 너 돈으로 AI를 쓸 수 있어.

:::

---

## 첫 AI API 호출

이제 코드로 AI한테 말을 걸어보자.

```typescript
// app/actions/askAI.ts

export async function askAI(userMessage: string) {
  const apiKey = process.env.OPENROUTER_API_KEY; // 🔒 금고에서 꺼냄

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",  // 무료 모델
        messages: [
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;  // AI의 답변

  } catch (error) {
    console.error("AI 응답 실패:", error);
    return null;  // 앱은 안 죽음
  }
}
```

31편의 환율 코드랑 비교해봐. `fetch` → `await` → `try-catch`. 구조가 똑같아.

다른 건 **보내는 데이터**뿐이야. 환율은 URL만 보냈는데, AI는 `messages` 배열을 보내.

---

## system prompt vs user prompt — 뭐가 달라?

위 코드에서 `messages` 배열에 `role: "user"`만 넣었어.
근데 실제로는 역할이 두 개야.

| role | 역할 | 비유 |
|------|------|------|
| `system` | AI의 성격, 규칙을 정해줌 | 신입사원 첫날 주는 업무 매뉴얼 |
| `user` | 지금 당장 하고 싶은 요청 | 그날그날 주는 업무 지시 |

```typescript
messages: [
  {
    role: "system",
    content: "너는 한국어 요약 전문가야. 3줄 이내로 요약해."
  },
  {
    role: "user",
    content: "여기 긴 글이 있어: ..."
  }
]
```

`system`은 한 번 정해두면 매번 안 바꿔도 돼. "넌 요약 전문가야"라고 정해놓으면, 사용자가 뭘 넣든 요약해서 답해.

**이게 AI 서비스의 핵심이야.** system prompt를 어떻게 쓰느냐에 따라 같은 모델이 번역가도 되고, 상담사도 되고, 코딩 도우미도 돼.

---

## 실습: 텍스트 요약 기능 만들기

AI한테 이렇게 시켜봐.

┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  나: "텍스트를 입력하면 AI가 요약해주는 기능을 만들어줘.        │
│                                                               │
│  **요구사항:**                                                │
│  1. textarea에 긴 글을 붙여넣으면                             │
│  2. '요약하기' 버튼을 누르면                                  │
│  3. AI가 3줄로 요약해서 보여줘                                │
│                                                               │
│  **기술 조건:**                                               │
│  - OpenRouter API 사용 (모델: meta-llama/llama-4-maverick:free) │
│  - API 키는 환경변수 OPENROUTER_API_KEY에서 가져와            │
│  - system prompt: '한국어 요약 전문가. 3줄 이내로 요약'        │
│  - 로딩 중이면 '요약 중...' 표시                              │
│  - 실패하면 '요약할 수 없어요' 에러 메시지"                   │
│                                                               │
└───────────────────────────────────────────────────────────────┘

AI가 만들어주는 코드의 핵심 구조야.

```typescript
// app/actions/summarize.ts

export async function summarize(text: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: [
          {
            role: "system",
            content: "너는 한국어 요약 전문가야. 어떤 글이든 핵심만 뽑아서 3줄 이내로 요약해."
          },
          {
            role: "user",
            content: `다음 글을 요약해줘:\n\n${text}`
          }
        ]
      })
    });

    const data = await res.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("요약 실패:", error);
    return null;
  }
}
```

이 함수 하나면 끝이야. 버튼 누르면 이 함수 호출하고, 결과를 화면에 뿌려주면 돼.

---

## API 키는 왜 서버에서만 써야 해?

```
❌ 브라우저(프론트엔드)에서 직접 fetch
✅ 서버(백엔드)에서 fetch → 결과만 브라우저에 전달
```

브라우저 코드는 누구나 볼 수 있어. 개발자 도구(F12) 열면 다 보여.
거기에 API 키가 있으면? 누군가 복사해서 너 돈으로 AI를 쓸 수 있어.

그래서 AI API 호출은 반드시 **서버 액션(Server Action)** 안에서 해.
Next.js라면 `"use server"`, Remix라면 `action` 함수 안에서.

Claude한테 처음부터 이렇게 말해.

```
API 호출은 서버 액션에서만 해.
API 키가 브라우저에 노출되면 안 돼.
```

---

## 한 줄 정리

AI API는 환율 API랑 구조가 같아. `fetch`로 메시지를 보내고 답변을 받는 것뿐이야. system prompt만 잘 쓰면 요약, 번역, 채팅 뭐든 돼.
