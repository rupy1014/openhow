---
name: gwrite
description: 'Gemini로 챕터 집필 — source-map 레퍼런스 자동 주입 + 톤가이드 + 품질 루프'
---

# /gwrite — Gemini Sub-Agent 챕터 집필

Claude가 오케스트레이션(컨텍스트 조립, 품질 검수)을 하고,
**Gemini CLI가 실제 원고를 작성**하는 워크플로우.

사용자 요청: $ARGUMENTS

## 사용법

```
/gwrite <chapter_number>        ← 단일 챕터
/gwrite part-02                 ← 파트 단위 배치
/gwrite next                    ← 미완성 챕터 중 다음
```

- `chapter_number`: 01~17 (2자리 zero-pad)
- `part-NN`: 해당 파트의 모든 챕터를 순차 실행
- `next`: .progress 또는 docs/ 상태를 보고 다음 미완성 챕터 선택

## 인자 해석

| 인자 | 의미 | 예시 |
|------|------|------|
| `06` | 06장 단일 집필 | `/gwrite 06` |
| `part-02` | Part 2 (06~08장) 순차 | `/gwrite part-02` |
| `next` | 다음 미완성 장 | `/gwrite next` |
| `06 07 08` | 복수 챕터 순차 | `/gwrite 06 07 08` |

## 프로젝트 구조

이 프로젝트는 채널 기반이 아닌 **책 챕터 기반**이다.

```
docs/
├── toc-final.md          ← 17장 최종 목차
├── source-map.md         ← 챕터별 참고 소스 매핑 (핵심!)
├── part-01/              ← 01~05장
├── part-02/              ← 06~08장
├── part-03/              ← 09~13장
└── part-04/              ← 14~17장

brain/
├── tone-guide.md         ← 문체 규칙 (12가지 원칙)
├── chapter-template.md   ← 개념/실습 챕터 표준 구조

examples/clauders.ai/     ← 레퍼런스 원본 (source-map에서 참조)
```

## 실행 스크립트

`./scripts/gwrite-run.sh` — 프로젝트 로컬 스크립트.
글로벌 `~/.local/bin/gwrite-run.sh`와 다르게 **챕터 번호만 받는다**.

```bash
./scripts/gwrite-run.sh <chapter_number> [feedback_path]
```

스크립트가 자동으로 수행하는 것:
1. `docs/toc-final.md`에서 해당 챕터 목차 섹션 추출
2. `docs/source-map.md`에서 레퍼런스 경로 파싱
3. 레퍼런스 파일 실제 내용을 프롬프트에 주입 (핵심 300줄, 보조 150줄)
4. `brain/tone-guide.md`, `brain/chapter-template.md` 포함
5. 이전 장 마지막 40줄 + 다음 장 목차 5줄 (연결 컨텍스트)
6. 완성된 Part 1 원고에서 톤 샘플 120줄
7. Gemini 호출 → `docs/part-NN/XX-chapter.md` 저장

## 프로세스

### Step 1. 인자 파싱

- `part-NN` → 해당 파트의 챕터 번호 목록으로 확장
- `next` → docs/part-*/ 에서 *-chapter.md가 없는 가장 작은 번호
- 단일 번호 → 그대로 사용

### Step 2. 챕터별 루프

각 챕터에 대해:

#### 2-1. gwrite-run.sh 호출

```bash
./scripts/gwrite-run.sh {chapter_number}
```

JSON 상태를 받는다:
```json
{
  "status": "success",
  "chapter": "06",
  "part": "02",
  "output_file": "docs/part-02/06-chapter.md",
  "ref_count": 6
}
```

#### 2-2. 품질 검수 (Claude 직접)

원고를 Read로 읽고 아래 체크리스트로 검수:

1. **제목 형식**: `# XX장 — 제목` 형식인가
2. **장 첫 인용**: `> "한 줄 명언"` 있는가
3. **섹션 번호**: XX.1, XX.2 등 목차와 일치하는가
4. **톤 체크**: 구어적 경어체 (~거든요, ~죠) 유지, 금지 표현 없는가
5. **구체성 체크**: 코드블록/설정 예시/실행 결과가 포함되었는가 (비유만으로 때우지 않았는가)
6. **레퍼런스 활용**: source-map의 핵심 레퍼런스 내용이 본문에 반영되었는가
7. **Q&A 섹션**: `## 여기서 막혔나요?` 독립 섹션, 2~3개 Q&A, 실제 에러/증상 기반
8. **한 줄 정리**: `## 한 줄 정리` — 한 문장 + 마무리 여운 문장 (불릿 리스트 금지)
9. **이전 장 연결**: 자연스러운 도입
10. **다음 장 예고**: 마무리에서 다음 장 내용 예고
11. **팩트 체크**: 오픈클로는 로컬(맥미니/미니PC), 클라우드가 아님

#### 2-3. 품질 루프

```
80점 이상 → PASS → 다음 챕터
60~79점  → 피드백 작성 → gwrite-run.sh 재호출 (최대 3라운드)
60점 미만 → 사용자에게 보고, 중단
```

피드백 재호출:
```bash
# 피드백을 /tmp에 저장
echo "{피드백 내용}" > /tmp/feedback_ch{NN}.md
./scripts/gwrite-run.sh {chapter_number} /tmp/feedback_ch{NN}.md
```

#### 2-4. 후처리

- 검수 통과 후 Claude가 직접 미세 수정 (Edit 도구):
  - 제목/헤딩 형식 교정
  - Q&A 섹션 형식 교정
  - 한 줄 정리 형식 교정
  - 팩트 오류 수정

### Step 3. 완료 보고

모든 챕터 완료 후 결과 테이블 출력:

| 챕터 | 제목 | 라운드 | 점수 | 레퍼런스 |
|------|------|--------|------|----------|
| 06장 | ... | 1 | 85 | 6개 |

## 핵심 차이: 글로벌 /gwrite vs 이 프로젝트

| | 글로벌 /gwrite | clauders_book /gwrite |
|---|---|---|
| 인자 | channel_id, episode, format | chapter_number |
| 스크립트 | ~/.local/bin/gwrite-run.sh | ./scripts/gwrite-run.sh |
| 레퍼런스 | channel.yaml, rules/ | source-map.md → clauders.ai/ |
| 구조 | 블로그/유튜브 템플릿 | 책 챕터 템플릿 (개념/실습) |
| 톤 | 하다체 | 구어적 경어체 |
