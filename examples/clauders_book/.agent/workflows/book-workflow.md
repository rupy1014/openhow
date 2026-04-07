# book-workflow — 마스터 오케스트레이터

전체 프로젝트 상태를 감지하고 적절한 커맨드/워크플로우로 라우팅한다.
에이전트를 직접 스폰하지 않는다.

---

## Step 0: 상태 수집

1. `.progress` 파일 읽기 (없으면 빈 상태로 시작)
2. `docs/toc-final.md` 읽기 — 17장 제목 목록
3. 각 챕터별 상태 파악:
   - `docs/part-{NN}/{XX}-chapter.md` 존재 여부
   - `.progress`의 status 값

## Step 1: 배치 우선순위 확인

`docs/writing-guide.md`의 집필 순서:

| 우선순위 | 배치 | 챕터 |
|---------|------|------|
| 1순위 | Part 1 입문 | 01, 02, 03, 04 |
| 2순위 | Part 2 첫 실습 | 05, 06 |
| 3순위 | Part 2 나머지 + Part 3 | 07, 08, 09, 10, 11, 12 |
| 4순위 | Part 4 유즈케이스 | 13, 14, 15, 16, 17 |

## Step 2: 라우팅 판단

### 인자 없음 (`/book`)

전체 상태 테이블 출력 (status-workflow와 동일) + 권장 다음 액션:

- 모든 챕터 pending → "시작하세요: `/batch part-01`"
- 일부 진행 중 → "이어하세요: `/resume`"
- 현재 배치 완료, 다음 배치 미시작 → "다음 배치: `/batch {next}`"
- 전체 완료 → "전체 집필 완료! 최종 검토: `/review all`"

### `--chapter XX` 인자

해당 챕터 상세 상태 + 권장 액션:
- pending → "/write {XX}"
- writing/reviewing → "/resume --chapter {XX}"
- pass → "완료됨. 재작성: /write {XX} --force"
- fail → "실패. 수동 검토 후 /write {XX} --force"

### `--part N` 인자

해당 Part 상태 요약 + 권장 액션:
- 전부 pending → "/batch part-{NN}"
- 일부 완료 → "/batch part-{NN} --skip-passed"
- 전부 완료 → "Part {N} 완료!"
