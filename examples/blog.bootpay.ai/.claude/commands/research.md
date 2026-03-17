# 블로그 가이드 리서치

사용자 요청: $ARGUMENTS

## 개요

`/research`는 researcher 에이전트만 독립 실행합니다.
`/write` 전에 리서치만 먼저 하고 방향을 잡고 싶을 때 사용합니다.

```
/research 구독 기획
/research "인앱결제 수수료"
```

---

## 실행

```
┌──────────────────────────────────────────────┐
│ researcher 에이전트 호출                        │
│                                               │
│ 에이전트: .claude/agents/researcher.md          │
│ 입력:                                          │
│   - 사용자 요청 ($ARGUMENTS)                    │
│   - docs/blog-strategy.md                      │
│   - docs/competitor-analysis.md                │
│ 출력:                                          │
│   → docs/research/{slug}-research.md           │
└──────────────────────────────────────────────┘
```

---

## 완료 후 출력

```
리서치 완료!

**파일:** docs/research/{slug}-research.md

**경쟁사 분석:** 포트원 N편, 토스 N편 확인
**커뮤니티 질문:** N건 수집
**삽질 포인트 후보:** N건

**다음 단계:**
1. 리서치 노트 확인 후 방향 조정
2. `/write {주제}` 로 가이드 작성
```
