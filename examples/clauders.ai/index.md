---
slug: index
title: AI 캐릭터 채팅 서비스 만들기 — 3회차 바이브코딩 코스
status: published
tags: [바이브코딩, 강의3회, 숙제3회, AI채팅, OpenRouter, Next.js, Vercel, Supabase]
---

# AI 캐릭터 채팅 서비스 만들기

> 코드 한 줄 몰라도, 6번의 수업 후엔 내가 만든 AI 서비스가 인터넷에 살고 있어요.

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 3px; margin: 2em 0;">
<div style="background: #1a1a2e; border-radius: 14px; padding: 28px 32px; color: #e0e0e0; line-height: 1.7;">
  <h3 style="margin: 0 0 24px 0; color: #fff; font-size: 1.25em; text-align: center; border-bottom: 1px solid #444; padding-bottom: 18px;">🎯 과정 수료 후 여러분은</h3>
  <ul style="margin: 0; padding-left: 8px; list-style: none;">
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>나만의 AI 캐릭터가 있는 채팅 서비스를 직접 만들어요</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>인터넷 공개 URL이 생겨요 — 친구에게 바로 공유 가능</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>대화 기록이 DB에 저장돼요 (새로고침해도 남아있어요)</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>에러가 나도 AI에게 시켜서 고칠 수 있어요</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>"나도 서비스 만들 수 있다"는 확신이 생겨요</li>
  </ul>
</div>
</div>

**대상**: 코드를 본 적 없는 완전 비개발자
**구성**: 강의 2시간 × 3회 + 숙제 2시간 × 3회 = 총 12시간
**도구**: Claude Code, VS Code, Node.js, OpenRouter, GitHub, Vercel, Supabase
**비용**: 전부 무료

---

## 커리큘럼 구조: 3×2 나선형 학습

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 3px; margin: 1.5em 0;">
<div style="background: #1a1a2e; border-radius: 14px; padding: 20px 24px; color: #e0e0e0; line-height: 1.7;">
  <p style="margin: 0 0 12px 0; color: #94a3b8; font-size: 0.95em;">같은 서비스를 3번 만들어요. 매번 더 고도화된 버전으로.</p>
  <table style="width:100%; border-collapse:collapse; color:#e0e0e0;">
    <tr>
      <th style="padding:8px 12px; text-align:left; border-bottom:1px solid #444; color:#a78bfa; width:100px;">단계</th>
      <th style="padding:8px 12px; text-align:left; border-bottom:1px solid #444; color:#a78bfa;">결과물</th>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#4ade80; font-weight:bold;">강의 1</td>
      <td style="padding:8px 12px;">AI 캐릭터 채팅 V1 — localhost에서 동작</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#fbbf24; font-weight:bold;">숙제 1</td>
      <td style="padding:8px 12px;">내 캐릭터로 교체 + UI 커스터마이즈</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#4ade80; font-weight:bold;">강의 2</td>
      <td style="padding:8px 12px;">V2 배포 — Vercel URL + UX 개선</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#fbbf24; font-weight:bold;">숙제 2</td>
      <td style="padding:8px 12px;">나만의 기능 1개 직접 추가</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#4ade80; font-weight:bold;">강의 3</td>
      <td style="padding:8px 12px;">V3 완성 — DB 저장 + 서비스 완성도</td>
    </tr>
    <tr>
      <td style="padding:8px 12px; color:#fbbf24; font-weight:bold;">숙제 3</td>
      <td style="padding:8px 12px;">마무리 + 공유 + 다음 프로젝트 기획</td>
    </tr>
  </table>
</div>
</div>

---

## 전체 시간표

<table style="width:100%; border-collapse:collapse; margin:1.5em 0;">
  <thead>
    <tr>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold; text-align:center; width:14%;">단계</th>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold;">주제</th>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold; text-align:center; width:14%;">시간</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;"><strong><a href="./강의-1회차.md">강의 1</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fdf4;">환경세팅 + 첫 AI 채팅 서비스 만들기 (localhost)</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;"><strong><a href="./숙제-1회차.md">숙제 1</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#fefce8;">내 캐릭터로 교체 + UI 커스터마이즈</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;"><strong><a href="./강의-2회차.md">강의 2</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fdf4;">GitHub + Vercel 배포 + UX 고도화</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;"><strong><a href="./숙제-2회차.md">숙제 2</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#fefce8;">나만의 기능 1개 직접 기획 + 구현 + 재배포</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;"><strong><a href="./강의-3회차.md">강의 3</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fdf4;">Supabase 대화 기록 저장 + 완성도 높이기</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fdf4;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;"><strong><a href="./숙제-3회차.md">숙제 3</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#fefce8;">마무리 + 세상에 공유하기 + 다음 프로젝트 기획</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fefce8;">2시간</td>
    </tr>
  </tbody>
</table>

---

## 만들 서비스 미리보기

<table style="width:100%; border-collapse:collapse; margin:1.5em 0;">
  <thead>
    <tr>
      <th style="border:1px solid #ddd; padding:14px; background:#e8e8e8; font-weight:bold;">기능</th>
      <th style="border:1px solid #ddd; padding:14px; background:#e8e8e8; font-weight:bold;">설명</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #ddd; padding:14px;"><strong>🎭 나만의 AI 캐릭터</strong></td>
      <td style="border:1px solid #ddd; padding:14px;">이름, 성격, 말투를 직접 설계. 도비, 세종대왕, 냥냥이 — 뭐든 가능</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:14px;"><strong>💬 실시간 채팅 UI</strong></td>
      <td style="border:1px solid #ddd; padding:14px;">카카오톡처럼 말풍선으로 대화. 내 메시지는 오른쪽, AI는 왼쪽</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:14px;"><strong>🤖 OpenRouter AI 연결</strong></td>
      <td style="border:1px solid #ddd; padding:14px;">GPT-4o, Claude, Gemini 등 세계 최고 AI 모델들을 한 곳에서</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:14px;"><strong>🌐 공개 URL 배포</strong></td>
      <td style="border:1px solid #ddd; padding:14px;">https://내이름.vercel.app — 핸드폰으로도 접속 가능</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:14px;"><strong>🗄️ 대화 기록 저장</strong></td>
      <td style="border:1px solid #ddd; padding:14px;">새로고침해도, 다음에 접속해도 이전 대화가 남아있음 (Supabase)</td>
    </tr>
  </tbody>
</table>

---

## 시작 전에 알아두세요

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px; padding: 3px; margin: 2em 0;">
<div style="background: #1a1a2e; border-radius: 14px; padding: 24px 28px; color: #e0e0e0; line-height: 1.7;">
  <h3 style="margin: 0 0 20px 0; color: #fff; font-size: 1.1em;">바이브코딩 3가지 규칙</h3>
  <p style="margin: 0 0 14px 0;"><strong style="color: #fbbf24;">1. 코드를 이해하려 하지 마세요</strong><br>
  → 지금은 몰라도 됩니다. AI가 다 써줘요. "이게 뭔지 몰라도" 일단 따라오면 됩니다.</p>
  <p style="margin: 0 0 14px 0;"><strong style="color: #fbbf24;">2. AI에게 구체적으로 시키세요</strong><br>
  → ❌ "좋게 해줘" 보다 ✅ "배경을 어두운 남색으로, 글자는 흰색으로 해줘"</p>
  <p style="margin: 0 0 0 0;"><strong style="color: #fbbf24;">3. 에러 나면 AI에게 붙여넣으세요</strong><br>
  → 빨간 에러 메시지 → 복사 → Claude Code에 붙여넣기 + "이 에러 고쳐줘"</p>
</div>
</div>

**→ [강의 1회차 시작하기](./강의-1회차.md)**

---

## 참고 자료 (파트별 상세 가이드)

이전 버전의 파트별 가이드입니다. 필요할 때 참고하세요.

| 파일 | 내용 |
|------|------|
| [PART 0 — 오리엔테이션](./00-오리엔테이션.md) | 바이브코딩 개념, 3가지 규칙 |
| [PART 1 — 환경세팅](./01-환경세팅.md) | Node.js, Claude Code, VS Code 설치 |
| [PART 2 — 기획](./02-기획.md) | AI 캐릭터 설계 시트 |
| [PART 3 — 프론트엔드](./03-프론트엔드.md) | 채팅 UI 만들기 (Next.js) |
| [PART 4 — 백엔드·AI연결](./04-백엔드-AI연결.md) | OpenRouter API 연결 |
| [PART 5 — 배포](./05-배포.md) | GitHub + Vercel 배포 |
| [PART 6 — 마무리](./06-마무리.md) | 커스터마이즈 옵션 + 다음 스텝 |
