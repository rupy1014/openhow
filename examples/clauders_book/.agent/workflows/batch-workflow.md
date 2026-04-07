# batch-workflow — 배치 순차 집필

여러 챕터를 순차적으로 write-workflow에 위임하여 처리한다.

---

## Step 0: 범위 해석

인자를 파싱하여 챕터 목록을 결정한다.

| 인자 | 해석 |
|------|------|
| `part-01` | [01, 02, 03, 04] |
| `part-02` | [05, 06, 07, 08] |
| `part-03` | [09, 10, 11, 12] |
| `part-04` | [13, 14, 15, 16, 17] |
| `05-06` | [05, 06] |
| `next` | writing-guide.md 집필 순서 + .progress 기반으로 다음 미완료 배치 |

### `next` 해석 로직

1. `docs/writing-guide.md` 집필 순서 읽기:
   - 1순위: [01, 02, 03, 04]
   - 2순위: [05, 06]
   - 3순위: [07, 08, 09, 10, 11, 12]
   - 4순위: [13, 14, 15, 16, 17]

2. `.progress` 읽기

3. 첫 번째 미완료(pass 아닌) 챕터가 있는 배치 선택

### `--skip-passed` 플래그

배치 내에서 `status: pass`인 챕터를 건너뛴다.

---

## Step 1: 배치 시작 기록

```yaml
# .progress
batch:
  current: {range_label}
  started: {timestamp}
```

---

## Step 2: 순차 루프

```
for chapter in resolved_chapters:

  if --skip-passed AND .progress[chapter].status == pass:
    로그: "Chapter {XX} — 이미 완료, 건너뜀"
    continue

  # write-workflow 전체 실행 (Step 0~4)
  write-workflow 실행(chapter)

  if status == fail (3라운드 후):
    사용자에게 질문:
      "Chapter {XX}가 품질 미달입니다. 계속 다음 챕터로 진행할까요?"
      - 계속 → 다음 챕터로
      - 중단 → 배치 종료, 상태 저장

  # 챕터 간 잠깐의 컨텍스트 정리
  완료된 챕터 정보를 간단히 기록
```

---

## Step 3: 배치 완료 리포트

```markdown
## 배치 결과: {range_label}

| Ch | 제목 | 유형 | 점수 | 라운드 | 상태 |
|----|------|------|------|--------|------|
| 01 | 한 줄 설치, 바로 실행 | practice | 8/10 | 1 | PASS |
| 02 | 자동화, 감 잡기 | practice | 7/10 | 2 | PASS |
| 03 | 여기서 잠깐, 초보자 설명 | concept | 9/10 | 1 | PASS |
| 04 | 웹소설 자동화 | practice | 5/10 | 3 | FAIL |

완료: 3/4 (75%)
소요 시간: ~{N}분
다음 권장: /batch 05-06
```

### .progress 갱신

```yaml
batch:
  current: {range_label}
  completed: {timestamp}
  result: { passed: 3, failed: 1, skipped: 0 }
```
