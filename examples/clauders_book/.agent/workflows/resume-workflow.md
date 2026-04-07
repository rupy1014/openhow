# resume-workflow — 중단 세션 복구

`.progress` 파일을 읽어 중단 지점을 감지하고, 해당 워크플로우의 적절한 Step부터 재개한다.

---

## Step 1: .progress 읽기

`.progress` 파일이 없으면:
```
진행 기록이 없습니다. /book 또는 /batch part-01 로 시작하세요.
```

---

## Step 2: 중단 지점 감지

각 챕터의 상태를 순서대로 확인하여 첫 번째 미완료 챕터를 찾는다.

### 상태별 복구 지점

| .progress 상태 | 복구 액션 |
|----------------|----------|
| `status: writing`, `rewriter: pending` | write-workflow Step 1부터 |
| `status: writing`, `rewriter: done`, `story-injector/troubleshoot-writer: pending` | write-workflow Step 2부터 |
| `status: reviewing`, `quality-reviewer: pending` | write-workflow Step 3부터 |
| `status: reviewing`, `quality-reviewer-verdict: FAIL`, `quality_loop.round < 3` | write-workflow Step 4 품질 루프 |
| `status: fail` | 사용자에게 선택지 제공 (재작성 or skip) |
| `status: pass` (모든 챕터) | "전체 완료. 추가 작업 없음." |

### 배치 컨텍스트 확인

`batch.current`가 설정되어 있으면:
1. 해당 배치의 챕터 목록 확인
2. 첫 번째 미완료 챕터부터 batch-workflow 재개

---

## Step 3: 사용자 확인

감지된 복구 지점을 보고하고 확인을 받는다.

```markdown
## 복구 지점 감지

마지막 완료: 03장 (PASS, 9/10)
현재 중단: 04장
  - rewriter: done
  - troubleshoot-writer: 대기 중
  - quality-reviewer: 미실행

다음 단계: @troubleshoot-writer 실행 → @quality-reviewer → 품질 게이트

배치 컨텍스트: part-01 (04장이 마지막)

이어서 진행할까요?
```

---

## Step 4: 복구 실행

사용자 확인 후:

1. **단일 챕터 복구**: write-workflow의 해당 Step부터 실행
2. **배치 복구**: 해당 챕터의 나머지 Step 실행 후, 배치의 다음 챕터로 이어서 batch-workflow 계속

### 안전 규칙

- 이미 완료된 Step을 재실행하지 않는다
- 기존 chapter.md를 덮어쓰지 않는다 (rewriter가 이미 done이면 skip)
- context-brief가 필요하지만 없는 경우 → 오케스트레이터가 직접 생성
- `--force` 플래그가 있으면 해당 챕터를 처음부터 재실행
