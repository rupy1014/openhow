# write-workflow — 챕터 집필 파이프라인

단일 챕터를 아웃라인+백로그 소스 기반으로 집필하는 전체 파이프라인.
`/write`, `/gwrite`, `/batch` 에서 호출된다.

---

## 챕터-Part 매핑

| Part | 챕터 | 디렉토리 |
|------|------|---------|
| part-01 | 01-04 | `docs/part-01/` |
| part-02 | 05-08 | `docs/part-02/` |
| part-03 | 09-12 | `docs/part-03/` |
| part-04 | 13-17 | `docs/part-04/` |

## 챕터 유형 판별

outline 파일의 title에 `[실전]`이 포함되면 **practice**, 아니면 **concept**.

| 유형 | 조건부 에이전트 | 예시 챕터 |
|------|---------------|----------|
| practice | @troubleshoot-writer | 01, 02, 04, 05, 06, 07, 09, 13, 14, 15, 16 |
| concept | @story-injector (inline) | 03, 08, 10, 11, 12, 17 |

---

## Step 0: 컨텍스트 조립 (오케스트레이터 직접)

에이전트를 스폰하지 않는다. 오케스트레이터가 직접 수행.

1. `.progress` 읽기
   - 해당 챕터가 `status: pass`이면 "이미 완료된 챕터입니다. 재작성하려면 `--force`를 붙이세요" 출력 후 종료
   - `status: writing` 또는 `status: reviewing`이면 resume-workflow로 위임

2. 챕터 번호 → Part/디렉토리 매핑
   - 01-04 → `docs/part-01/`
   - 05-08 → `docs/part-02/`
   - 09-12 → `docs/part-03/`
   - 13-17 → `docs/part-04/`

3. outline 파일 읽기: `docs/part-{NN}/{XX}-outline.md`
   - 없으면 에러: "아웃라인이 없습니다. 먼저 outline을 작성하세요."

4. `docs/source-map.md` 읽기 → 해당 챕터의 백로그 소스 경로 추출

5. 챕터 유형 판별: outline title에서 `[실전]` 확인

6. `.progress` 갱신:
   ```yaml
   chapters:
     {XX}:
       type: {concept|practice}
       status: writing
       outline: docs/part-{NN}/{XX}-outline.md
       output: docs/part-{NN}/{XX}-chapter.md
   ```

---

## Step 1: @rewriter 스폰 (항상)

**Sub-agent로 스폰한다** (Agent tool, isolation 권장).

### 입력 (반드시 읽는 것)

| 파일 | 용도 |
|------|------|
| `doc/index.md` | **골든 샘플** — 톤의 기준점 (반드시 먼저 읽기) |
| `docs/part-{NN}/{XX}-outline.md` | 챕터 구조 + 핵심 메시지 |
| `backlog/{path1}`, `backlog/{path2}` ... | source-map.md에서 추출한 원본 초안 |
| `brain/gap-analysis.md` | 레퍼런스 대비 7가지 gap |
| `brain/chapter-template.md` | 개념/실습 표준 구조 |
| `brain/tone-guide.md` | 구어적 경어체 규칙 + 구간별 톤 구분 |

### 읽지 않는 것

- 다른 챕터의 chapter.md
- reviews/ 디렉토리의 리뷰 리포트
- .progress

### 지시

```
{XX}-outline.md 기준으로 리라이팅해줘.

챕터 유형: {concept|practice}
아래 백로그 소스를 참고해:
  - backlog/{path1}
  - backlog/{path2}

먼저 doc/index.md(골든 샘플)를 읽고 이 톤을 기준으로 삼아.
brain/ 가이드 3개를 반드시 읽고 적용해.
출력 파일: docs/part-{NN}/{XX}-chapter.md
```

### 출력

- `docs/part-{NN}/{XX}-chapter.md` — 리라이팅된 원고

### .progress 갱신

```yaml
chapters.{XX}.rewriter: done
```

---

## Step 2: 조건부 에이전트 (챕터 유형에 따라)

### concept 챕터 → @story-injector 스폰

**Sub-agent로 스폰한다.**

입력:
| 파일 | 용도 |
|------|------|
| `docs/part-{NN}/{XX}-chapter.md` | rewriter 결과물 |
| `brain/tone-guide.md` | 톤 일관성 |

읽지 않는 것:
- outline, backlog, 다른 챕터, reviews

지시:
```
docs/part-{NN}/{XX}-chapter.md 에 인물 사례를 삽입해줘.
모드: inline
```

.progress 갱신:
```yaml
chapters.{XX}.story-injector: done
chapters.{XX}.troubleshoot-writer: skip
```

### practice 챕터 → @troubleshoot-writer 스폰

**Sub-agent로 스폰한다.**

입력:
| 파일 | 용도 |
|------|------|
| `docs/part-{NN}/{XX}-chapter.md` | rewriter 결과물 |

읽지 않는 것:
- brain/, outline, backlog, 다른 챕터

지시:
```
docs/part-{NN}/{XX}-chapter.md 에 트러블슈팅 Q&A를 추가해줘.
```

.progress 갱신:
```yaml
chapters.{XX}.troubleshoot-writer: done
chapters.{XX}.story-injector: skip
```

---

## Step 3: @quality-reviewer 스폰 (항상)

**Sub-agent로 스폰한다.**

### 입력 (반드시 읽는 것)

| 파일 | 용도 |
|------|------|
| `docs/part-{NN}/{XX}-chapter.md` | 검토 대상 |
| `brain/gap-analysis.md` | gap 기준 |
| `brain/chapter-template.md` | 구조 체크리스트 |

### 읽지 않는 것

- backlog, outline, 다른 챕터, 다른 에이전트 리포트

### 출력

- `reviews/{XX}-quality-review.md` — 점수 + PASS/FAIL 항목 + 총평

### .progress 갱신

```yaml
chapters.{XX}.quality-reviewer: {score}     # 1~10
chapters.{XX}.quality-reviewer-verdict: {PASS|FAIL}
chapters.{XX}.status: reviewing
```

---

## Step 4: 품질 게이트 (오케스트레이터 직접)

`reviews/{XX}-quality-review.md`를 읽고 점수를 확인한다.

### 8+/10 → PASS

```yaml
chapters.{XX}.quality_loop: { round: 1, result: pass }
chapters.{XX}.status: pass
```

사용자에게 결과 보고:
```
## ✓ {XX}장 완료
점수: {score}/10
총평: {summary}
```

### 6-7/10 → CONDITIONAL (품질 루프)

```yaml
chapters.{XX}.quality_loop.round: {N+1}    # 최대 3
chapters.{XX}.quality_loop.result: retry
```

1. FAIL 항목만 추출
2. @rewriter를 **fix 모드**로 재스폰:

```
docs/part-{NN}/{XX}-chapter.md 에서 아래 항목만 수정해줘:

FAIL 항목:
- {fail_item_1} — {수정 제안}
- {fail_item_2} — {수정 제안}

전체 리라이팅이 아니라 해당 항목만 targeted fix.
```

3. 수정 후 Step 3(@quality-reviewer)로 복귀
4. **최대 3라운드** — 3라운드 후에도 8+ 미달이면 FAIL로 전환

### 5이하/10 → FAIL

```yaml
chapters.{XX}.quality_loop: { round: {N}, result: fail }
chapters.{XX}.status: fail
```

사용자에게 보고:
```
## ✗ {XX}장 품질 미달
점수: {score}/10
FAIL 항목: {items}
수동 검토가 필요합니다.
```

---

## /gwrite 호환

`/gwrite`에서 이 워크플로우를 호출할 때:
- Step 1의 `@rewriter` → Gemini가 대체 (`content-writer` 역할)
- Step 2, 3의 에이전트는 그대로 Claude가 실행
- 나머지 로직 동일
