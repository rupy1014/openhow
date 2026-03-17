# 블로그 가이드 작성 파이프라인

사용자 요청: $ARGUMENTS

## 개요

`/write`는 리서치 → 초안 → 검수까지 한 번에 실행합니다.

```
/write 결제 도입           # 가이드 1
/write 구독 기획           # 가이드 2
/write 마켓플레이스 정산    # 가이드 3
/write 결제 운영           # 가이드 4
```

---

## 파이프라인

```
┌──────────────────────────────────────────────┐
│ 0. 준비                                       │
│   - docs/blog-strategy.md 읽기                │
│   - docs/competitor-analysis.md 읽기          │
│   - 해당 가이드의 목차/차별점 확인               │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 1. researcher 에이전트 호출                     │
│                                               │
│   에이전트: .claude/agents/researcher.md        │
│   입력:                                        │
│     - 사용자 요청 ($ARGUMENTS)                  │
│     - docs/blog-strategy.md                    │
│     - docs/competitor-analysis.md              │
│   출력:                                        │
│     → docs/research/{slug}-research.md         │
│                                               │
│   ⚠️ 리서치 노트 완성 후 사용자에게 요약 보고     │
│   ⚠️ 방향 조정 필요하면 여기서 피드백 받기         │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 2. guide-writer 에이전트 호출                   │
│                                               │
│   에이전트: .claude/agents/guide-writer.md      │
│   입력:                                        │
│     - docs/research/{slug}-research.md         │
│     - docs/blog-strategy.md                    │
│   출력:                                        │
│     → docs/guides/{slug}.md                    │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 3. reviewer 에이전트 호출                       │
│                                               │
│   에이전트: .claude/agents/reviewer.md          │
│   입력:                                        │
│     - docs/guides/{slug}.md                    │
│     - docs/research/{slug}-research.md         │
│     - docs/blog-strategy.md                    │
│   출력:                                        │
│     - 검수 리포트 (콘솔 출력)                    │
│     - 수정된 docs/guides/{slug}.md              │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│ 4. 완료 보고                                    │
│   - 최종 파일 경로                               │
│   - 리서치 소스 요약                              │
│   - 검수 결과 요약                               │
│   - 경쟁사 대비 차별화 포인트                     │
│   - 분량                                        │
│   - 다음 단계 안내 (/publish)                    │
└──────────────────────────────────────────────┘
```

---

## slug 매핑

| 주제 | slug |
|------|------|
| 결제 도입 | payment-getting-started |
| 구독 기획 | subscription-planning |
| 마켓플레이스 정산 | marketplace-settlement |
| 결제 운영 | payment-operations |

---

## 완료 후 출력

```
가이드가 완성되었습니다!

**파일:** docs/guides/{slug}.md
**리서치:** docs/research/{slug}-research.md

---

**리서치 소스:** N건
**검수 결과:** [판정]
**분량:** N,NNN자
**경쟁사 대비 차별점:** ...

---

**다음 단계:**
1. 내용 확인 후 피드백
2. `/publish` 로 openhow 발행
```
