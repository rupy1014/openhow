# review-workflow — 품질 검토 전용

기존 챕터를 @quality-reviewer로 검토만 한다. 품질 루프(재작성)는 실행하지 않는다.
결과를 리포트하고, 사용자가 `/write`로 재작성 여부를 결정한다.

---

## Step 0: 범위 해석

| 인자 | 해석 |
|------|------|
| `05` | [05] 단일 챕터 |
| `01-04` | [01, 02, 03, 04] 범위 |
| `all` | [01, 02, ..., 17] 전체 |

각 챕터에 대해 `docs/part-{NN}/{XX}-chapter.md` 존재 여부 확인.
없으면 해당 챕터 skip 처리 ("원고 없음").

---

## Step 1: @quality-reviewer 순차 실행

각 챕터에 대해:

1. @quality-reviewer sub-agent 스폰:
   ```
   docs/part-{NN}/{XX}-chapter.md 를 체크리스트 기반으로 검토해줘.
   ```

2. 입력:
   - `docs/part-{NN}/{XX}-chapter.md`
   - `brain/gap-analysis.md`
   - `brain/chapter-template.md`

3. 출력: `reviews/{XX}-quality-review.md`

4. `.progress` 갱신:
   ```yaml
   chapters.{XX}.quality-reviewer: {score}
   chapters.{XX}.quality-reviewer-verdict: {PASS|FAIL}
   ```

---

## Step 2: 종합 리포트

```markdown
## 리뷰 결과

| Ch | 제목 | 유형 | 점수 | 판정 | 주요 FAIL |
|----|------|------|------|------|----------|
| 01 | 한 줄 설치 | practice | 8/10 | PASS | — |
| 02 | 자동화 감 잡기 | practice | 6/10 | FAIL | h2 부족, IMG 마커 없음 |
| 03 | 초보자 설명 | concept | 9/10 | PASS | — |

통과: 2/3
재작성 권장: /write 02
```

**주의**: review-workflow는 재작성을 실행하지 않는다.
사용자가 결과를 보고 `/write {XX}`를 직접 호출해야 한다.
