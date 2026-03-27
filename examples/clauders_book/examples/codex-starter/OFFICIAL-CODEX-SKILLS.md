# Official Codex Skills

이 파일은 OpenAI 공식 Codex 문서를 바탕으로 정리한 메모입니다.

## 공식 문서에 나온 built-in / official skill

OpenAI 공식 문서는 Codex에 OpenAI 번들 system skill이 있다고 설명합니다.

- `skill-creator`
- plan skills

또 curated skill을 더 넣고 싶을 때는 다음을 쓰라고 안내합니다.

- `skill-installer`

예시:

```text
$skill-installer linear
```

## 이 예제에서 어떻게 해석했나요?

- 일반 planning은 built-in 쪽에 맡깁니다
- repo 안에는 이 프로젝트에만 필요한 skill만 둡니다
- 그래서 `plan-small-change` 같은 범용 skill은 빼고, 랜딩 페이지 copy/mobile polish처럼 도메인에 가까운 skill만 남겼습니다

## 공식 문서가 말하는 skill 구조

- skill 디렉터리에는 `SKILL.md`가 반드시 있어야 합니다
- `name`, `description`이 필요합니다
- `scripts/`, `references/`, `assets/`, `agents/openai.yaml`은 선택입니다
- Codex는 먼저 metadata만 읽고, 필요할 때만 `SKILL.md` 전체를 읽습니다

## 공식 문서가 말하는 저장 위치

- repo 공용: `.agents/skills`
- 현재 작업 폴더 한정: `$CWD/.agents/skills`
- 사용자 전역: `$HOME/.agents/skills`

즉, 이 예제처럼 루트와 `site/` 아래에 skill을 나눠두는 구성이 공식 문서와 맞습니다.

## 참고 링크

- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/learn/best-practices
