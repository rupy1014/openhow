---
slug: index
title: AI 캐릭터 채팅 서비스 만들기 — 8시간 완성 코스
status: published
tags: [바이브코딩, 8시간, 자기주도, AI채팅, OpenRouter, Next.js, Vercel]
---

# AI 캐릭터 채팅 서비스 만들기

> 코드 한 줄 몰라도, 8시간 후엔 내가 만든 AI와 대화하는 서비스가 인터넷에 올라가 있어요.

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 3px; margin: 2em 0;">
<div style="background: #1a1a2e; border-radius: 14px; padding: 28px 32px; color: #e0e0e0; line-height: 1.7;">
  <h3 style="margin: 0 0 24px 0; color: #fff; font-size: 1.25em; text-align: center; border-bottom: 1px solid #444; padding-bottom: 18px;">🎯 8시간 후 여러분은</h3>
  <ul style="margin: 0; padding-left: 8px; list-style: none;">
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>나만의 AI 캐릭터를 설계하고, 그 캐릭터와 대화하는 서비스를 만들어요</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>인터넷에 공개 URL이 생겨요 — 지금 바로 친구에게 보낼 수 있는 링크</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>에러가 나도 당황하지 않고 AI에게 시켜서 고칠 수 있어요</li>
    <li style="margin: 12px 0; padding-left: 28px; position: relative;"><span style="position: absolute; left: 0; color: #4ade80;">✅</span>"나도 서비스 만들 수 있다"는 확신이 생겨요</li>
  </ul>
</div>
</div>

**대상**: 코드를 본 적 없는 완전 비개발자
**시간**: 총 8시간 (순수 학습 + 실습)
**도구**: Claude Code, VS Code, Node.js, OpenRouter, GitHub, Vercel
**비용**: 전부 무료 (OpenRouter 무료 크레딧 + Vercel 무료 플랜)

---

## 오늘 만드는 것

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
  </tbody>
</table>

---

## 전체 시간표

<table style="width:100%; border-collapse:collapse; margin:1.5em 0;">
  <thead>
    <tr>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold; text-align:center; width:14%;">파트</th>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold;">주제</th>
      <th style="border:1px solid #ddd; padding:12px; background:#e8e8e8; font-weight:bold; text-align:center; width:14%;">시간</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;"><strong><a href="./00-오리엔테이션.md">PART 0</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f8f4ff;">오리엔테이션: 오늘 뭘 만드나, 바이브코딩이란</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;">30분</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;"><strong><a href="./01-환경세팅.md">PART 1</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px;">환경 세팅: Claude Code, VS Code, Node.js, OpenRouter</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;">1시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"><strong>🎯 체크 1</strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fff4; font-style:italic;">환경 세팅 완료 확인</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;"><strong><a href="./02-기획.md">PART 2</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f8f4ff;">기획: AI 캐릭터 설계 + 화면 스케치</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;">30분</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;"><strong><a href="./03-프론트엔드.md">PART 3</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px;">프론트엔드: 채팅 화면 만들기</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;">2시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"><strong>🎯 체크 2</strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fff4; font-style:italic;">채팅 UI 완성 확인</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;"><strong><a href="./04-백엔드-AI연결.md">PART 4</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f8f4ff;">백엔드: OpenRouter AI 연결하기</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;">1시간 30분</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"><strong>🎯 체크 3</strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f0fff4; font-style:italic;">AI 대화 작동 확인</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f0fff4;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;"><strong><a href="./05-배포.md">PART 5</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px;">배포: 세상에 공개하기</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center;">1시간</td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fff3e0;"><strong>🏆 완성!</strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#fff3e0; font-style:italic;">공개 URL 획득</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#fff3e0;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;"><strong><a href="./06-마무리.md">PART 6</a></strong></td>
      <td style="border:1px solid #ddd; padding:12px; background:#f8f4ff;">마무리: 커스터마이즈 + 다음 스텝</td>
      <td style="border:1px solid #ddd; padding:12px; text-align:center; background:#f8f4ff;">30분</td>
    </tr>
  </tbody>
</table>

---

## 시작 전에 알아두세요

<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 16px; padding: 3px; margin: 2em 0;">
<div style="background: #1a1a2e; border-radius: 14px; padding: 24px 28px; color: #e0e0e0; line-height: 1.7;">
  <h3 style="margin: 0 0 20px 0; color: #fff; font-size: 1.1em;">오늘의 3가지 규칙</h3>
  <p style="margin: 0 0 14px 0;"><strong style="color: #fbbf24;">1. 코드를 이해하려 하지 마세요</strong><br>
  → 지금은 몰라도 됩니다. AI가 다 써줘요. "이게 뭔지 몰라도" 일단 따라오면 됩니다.</p>
  <p style="margin: 0 0 14px 0;"><strong style="color: #fbbf24;">2. AI에게 구체적으로 시키세요</strong><br>
  → ❌ "좋게 해줘" 보다 ✅ "배경을 어두운 남색으로, 글자는 흰색으로 해줘"</p>
  <p style="margin: 0 0 0 0;"><strong style="color: #fbbf24;">3. 에러 나면 AI에게 붙여넣으세요</strong><br>
  → 빨간 에러 메시지 → 복사 → Claude Code에 붙여넣기 + "이 에러 고쳐줘"</p>
</div>
</div>

**→ [PART 0 오리엔테이션으로 시작하기](./00-오리엔테이션.md)**
