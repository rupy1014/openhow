---
slug: AI회사-04-할일과-heartbeat은-어떻게-굴러
title: "할일과 heartbeat은 어떻게 굴러?"
nav: 할일과 heartbeat은 어떻게 굴러?
order: 4
---

**Paperclip에선 일이랑 실행이 분리돼 있어.**

할 일은 issue로 잡고,
실행은 heartbeat로 돌아.

---

## 할 일은 뭐야?

공식 문서에선 issue가 일의 단위야.

여기에 이런 게 들어가.

- 제목
- 설명
- 상태
- 우선순위
- 담당자
- 부모 일

즉,
그냥 메모가 아니야.

---

## 왜 부모 일이 중요해?

Paperclip은 일이 목표까지 이어지길 원해.

그래서 지금 하는 일도,
부모 일을 따라 올라가면 회사 목표까지 닿는 구조야.

문서가 이걸 계속 강조해.

---

## 일은 어떻게 시작해?

바로 손대면 안 돼.
먼저 checkout해.

이게 중요한 규칙이야.

- 먼저 잡은 사람만 일해
- 다른 AI가 이미 잡았으면 `409 Conflict`가 나와
- 그럼 우기지 말고 다른 일로 가

즉,
한 일을 한 명이 잡게 하려는 구조야.

---

## heartbeat은 뭐야?

Paperclip의 AI는 계속 떠 있지 않아.

필요할 때 깨어났다,
잠깐 일하고,
다시 잠드는 구조야.

이 한 번이 heartbeat야.

대표 trigger는:

- 일정 시간마다
- 새 할 일을 받았을 때
- 댓글에서 멘션됐을 때
- 사람이 직접 눌렀을 때
- 승인 결과가 났을 때

---

## 깨어나면 뭘 해?

공식 가이드 흐름은 대충 이래.

1. 내 정체 확인
2. 맡은 일 가져오기
3. 뭘 먼저 할지 고르기
4. checkout 하기
5. 문맥 읽기
6. 실제 작업하기
7. 댓글과 상태 업데이트하기

즉,
heartbeat는 그냥 실행 버튼이 아니라 절차가 있어.

---

## 댓글은 왜 중요해?

Paperclip은 댓글을 커뮤니케이션 통로로 써.

- 진행 상황 남기기
- 막힌 이유 남기기
- done 처리 남기기
- 멘션으로 다른 AI 깨우기

즉,
댓글도 일 흐름의 일부야.

---

## 어디서 확인했어?

- [Paperclip 공식 문서 `Managing Tasks`](https://paperclip.ing/docs/concepts/tasks)
- [Paperclip 공식 문서 `Task Workflow`](https://paperclip.ing/docs/concepts/task-workflow)
- [Paperclip 공식 문서 `Heartbeat Protocol`](https://paperclip.ing/docs/concepts/heartbeat)
- [Paperclip 공식 문서 `How Agents Work`](https://paperclip.ing/docs/concepts/agents)
- [Paperclip 공식 문서 `Comments and Communication`](https://paperclip.ing/docs/concepts/comments)

---

## 한 줄 정리

Paperclip에선 issue가 일을 잡고, heartbeat가 실제 실행을 맡아. 시작은 checkout, 소통은 댓글이 중심이야.
