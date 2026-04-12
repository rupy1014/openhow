# toss-tech example

이 예제는 `type: "blog"`를 유지한 채, **팀 블로그(team blog)** 성격을 어떻게 표현할지 검증하기 위한 샘플입니다.

## 왜 새 type을 추가하지 않았나

`toss.tech`는 새로운 도메인이라기보다 기존 `blog`의 한 변형에 가깝습니다.

- 시간순 아티클 발행
- 카테고리 중심 탐색
- 저자/팀 관점 메타데이터
- 에디토리얼 홈 구성

즉 `docs`처럼 레퍼런스 문서 중심도 아니고, `course`처럼 진도 모델이 필요한 것도 아닙니다.
그래서 이번 예제는 **새 workspace type 대신 기존 `blog` + 스타일/콘텐츠 규칙**으로 풀었습니다.

## 이 예제에서 검증하는 것

1. `preset: "team-blog"` 기반의 상단 카테고리 네비게이션
2. frontmatter의 `author`, `authorBio`, `date`, `thumbnail` 활용
3. featured + latest rail + series + category row 조합의 홈 레이아웃
4. blog 타입이 docs/archive형뿐 아니라 editorial/team blog형도 수용 가능한지 확인
5. toss.tech RSS / 홈 메타데이터를 예제 데이터로 동기화

## 나중에 일반화한다면

새 type보다는 아래처럼 가는 편이 맞습니다.

```json
{
  "type": "blog",
  "preset": "team-blog"
}
```

즉:

- `type` = 도메인 동작
- `preset` = 홈 구조 / scaffold / 카피 / 기본 메타 필드
- `theme` = 컬러 / spacing / 장식

## 예제 실행

```bash
# RSS / 홈 메타데이터 동기화
cd examples/toss-tech
node scripts/sync-rss.mjs

# viewer/ssg 검증
cd ../../core/packages/cli
pnpm build
node dist/cli.mjs export ../../../examples/toss-tech -o ../../../temp/toss-tech-export --clean
```
