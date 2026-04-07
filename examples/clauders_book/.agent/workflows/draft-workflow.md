# draft-workflow — 단순 직필 워크플로우

> `/write`의 4단계 파이프라인(rewriter → 조건부 에이전트 → quality-reviewer → 품질 루프) 없이,
> 아웃라인 + 백로그 + brain 가이드를 읽고 **바로 원고를 작성**하는 워크플로우.

---

## 사용법

```
/draft 05              ← 05장 한 개 작성
/draft 05-08           ← 05~08장 순차 작성
/draft part-02         ← Part 2 전체 (05-08)
/draft all             ← 미완성 챕터 전부
/draft 01 --force      ← 이미 완성된 챕터 덮어쓰기
```

---

## Part-챕터 매핑

| Part | 챕터 | 디렉터리 |
|------|-------|---------|
| part-01 | 01-04 | `docs/part-01/` |
| part-02 | 05-08 | `docs/part-02/` |
| part-03 | 09-12 | `docs/part-03/` |
| part-04 | 13-17 | `docs/part-04/` |

---

## 챕터 유형 판별

아웃라인 제목에 `[실전]`이 포함되면 **practice**, 아니면 **concept**.

| 유형 | 챕터 | 템플릿 |
|------|-------|--------|
| practice | 01, 02, 04, 05, 06, 07, 09, 13, 14, 15, 16 | `brain/chapter-template.md` Practice 템플릿 |
| concept  | 03, 08, 10, 11, 12, 17 | `brain/chapter-template.md` Concept 템플릿 |

---

## 워크플로우 (챕터 1개 기준)

### Step 0: 대상 결정

1. 인자 파싱 → 챕터 번호 리스트 생성
   - `05` → `[05]`
   - `05-08` → `[05, 06, 07, 08]`
   - `part-02` → `[05, 06, 07, 08]`
   - `all` → 아웃라인은 있지만 chapter.md가 없는 모든 챕터
2. 각 챕터에 대해 Step 1~2 순차 실행
3. `--force` 없으면 이미 `{XX}-chapter.md`가 존재하는 챕터는 스킵

### Step 1: 컨텍스트 수집

**반드시 읽을 파일:**

| 파일 | 용도 |
|------|------|
| `docs/part-{NN}/{XX}-outline.md` | 챕터 구조 + 핵심 메시지 |
| `docs/source-map.md` | 해당 챕터의 백로그 소스 경로 |
| 백로그 소스 파일들 (source-map에 나열된 것) | 소재 + 톤 참고 |
| `brain/chapter-template.md` | 구조 템플릿 (concept/practice) |
| `brain/tone-guide.md` | 문체 규칙 |
| `brain/gap-analysis.md` | 레퍼런스 대비 gap |
| `docs/writing-guide.md` | 집필 원칙 + 감정선 |

**읽지 않을 파일:**
- 다른 챕터의 chapter.md (독립 작성)
- reviews/ 디렉터리
- .progress 파일

### Step 2: 원고 작성

**Agent를 1개 생성**하여 아래 지시를 내린다:

```
{XX}장 원고를 작성해줘.

## 입력
- 아웃라인: docs/part-{NN}/{XX}-outline.md
- 백로그 소스: {source-map에서 해당 챕터 소스 목록}
- brain 가이드: brain/chapter-template.md, brain/tone-guide.md, brain/gap-analysis.md
- 집필 가이드: docs/writing-guide.md

## 챕터 유형: {concept|practice}

## 작성 규칙
1. 아웃라인의 소단원 구조를 그대로 따른다
2. brain/chapter-template.md의 해당 유형 템플릿을 적용한다
3. brain/tone-guide.md의 문체 규칙을 엄격히 지킨다:
   - 구어체 존댓말 (~합니다, ~죠, ~거든요)
   - 반말/평서체 금지 (~야, ~다, ~이다)
   - 강연하듯 자연스러운 흐름
4. 백로그 소스의 구체적 사례·코드·화면 묘사를 최대한 활용한다
5. 아웃라인의 "꼭 넣을 장면/사례/실습"을 빠짐없이 포함한다
6. writing-guide.md의 감정선 웨이포인트를 의식한다
7. gap-analysis.md의 7가지 gap 중 해당 챕터에 관련된 것을 반영한다
8. practice 챕터는 "여기서 막혔나요?" Q&A 섹션을 포함한다
9. concept 챕터는 인물·사례 에피소드를 인라인으로 녹인다
10. IMG 마커: 이미지가 필요한 위치에 `<!-- IMG: 설명 -->` 마커를 남긴다

## 출력
- 파일: docs/part-{NN}/{XX}-chapter.md
- 분량: 소단원당 800~1500자, 전체 4000~8000자 (한글 기준)
```

### Step 3: 완료 보고

각 챕터 완료 시 한 줄로 보고:
```
✓ {XX}장 "{제목}" 작성 완료 → docs/part-{NN}/{XX}-chapter.md
```

전체 배치 완료 시 요약 테이블 출력.

---

## 병렬 실행 (선택)

- 같은 Part 내 챕터는 **병렬 Agent로 동시 작성** 가능
- 다른 Part 챕터도 의존성 없으므로 병렬 가능
- 단, 동시 에이전트 수는 최대 4개로 제한 (컨텍스트 부하 관리)

---

## /write와의 차이

| 항목 | /write | /draft |
|------|--------|--------|
| 에이전트 체인 | rewriter → 조건부 → reviewer | 단일 에이전트 |
| 품질 루프 | 최대 3회 | 없음 |
| .progress 추적 | 있음 | 없음 |
| 소요 시간 (1챕터) | 긴 편 | 빠름 |
| 배치 모드 | /batch 별도 | 내장 (all, part-XX, 범위) |
| 용도 | 최종 원고 | 초안 빠르게 뽑기 |
