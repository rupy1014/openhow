# Codex Starter

이 폴더는 책 초반부에서 바로 열어볼 수 있는 Codex 연습용 워크스페이스입니다.

처음 버전은 "설정 파일 + skill + 작은 앱" 정도만 보여줬습니다.

이번 버전은 OpenAI 공식 Codex 문서 기준에 더 가깝게 손봤습니다.

핵심은 세 가지입니다.

- 일반 작업은 Codex 번들 built-in skill에 맡긴다
- repo 안에는 이 프로젝트에만 필요한 skill만 넣는다
- root skill과 folder-local skill을 나눠서 범위 차이도 보여준다

## 왜 이 구성이 더 낫나요?

OpenAI 공식 문서는 skills를 "재사용 가능한 workflow의 authoring format"으로 설명합니다.

그리고 다음을 같이 권합니다.

- repo 공용 규칙은 `AGENTS.md`
- repo 공용 skill은 `.agents/skills`
- 더 특정한 폴더 작업은 그 폴더 아래 `.agents/skills`
- 일반 planning 같은 건 번들 system skill 사용

즉, 예제도 그 철학을 따라가는 편이 좋습니다.

## 폴더 구성

```text
codex-starter/
├─ AGENTS.md
├─ OFFICIAL-CODEX-SKILLS.md
├─ .codex/
│  └─ config.toml
├─ .agents/
│  └─ skills/
│     ├─ landing-copy-tune/
│     │  ├─ SKILL.md
│     │  └─ agents/openai.yaml
│     └─ review-landing-page/
│        └─ SKILL.md
└─ site/
   ├─ index.html
   ├─ styles.css
   ├─ app.js
   └─ .agents/
      └─ skills/
         └─ mobile-polish/
            ├─ SKILL.md
            └─ agents/openai.yaml
```

## 이 예제에서 보여주는 구조

### 1. `AGENTS.md`

프로젝트 전체 규칙입니다.

Codex가 이 저장소에서 어떻게 일해야 하는지 정합니다.

### 2. `.codex/config.toml`

기본 모델, 승인 정책, 샌드박스를 정합니다.

이 예제는 **승인 없이 알아서 진행**하는 취향에 맞춰 기본값을 이렇게 둡니다.

- `approval_policy = "never"`
- `sandbox_mode = "workspace-write"`
- `network_access = false`

즉, 프롬프트 없이 진행하되, 작업 공간 바깥과 네트워크는 막아둔 형태입니다.

조금 더 보수적으로 쓰고 싶으면 이렇게 실행하면 됩니다.

```bash
codex --profile cautious
```

### 3. repo skill

루트 `.agents/skills`에는 이 예제 전체에서 재사용할 수 있는 skill만 둡니다.

- `$landing-copy-tune`
- `$review-landing-page`

### 4. folder-local skill

`site/.agents/skills`는 `site/` 안에서 작업할 때만 더 가까운 범위로 잡히는 skill 예시입니다.

즉, "이 skill은 랜딩 페이지 UI를 손볼 때만 보이면 된다"는 구조를 보여줍니다.

## 무엇을 연습하면 좋을까요?

### 1. 구조 읽기

```text
이 프로젝트에서 AGENTS.md, config.toml, root skill, site-local skill이
각각 어떤 역할인지 먼저 설명해줘.
```

### 2. 번들 built-in과 repo skill 나누기

```text
이 요청은 일반 계획으로 처리할지, repo skill을 써야 할지 먼저 구분해줘.
그 이유도 짧게 설명해줘.
```

### 3. copy만 다듬기

```text
$landing-copy-tune
hero의 제목과 소개 문장을 더 명확하게 다듬어줘.
과장된 문구는 빼고, 기존 분위기는 유지해줘.
```

### 4. 랜딩 페이지 리뷰

```text
$review-landing-page
현재 랜딩 페이지를 UX, 문장 톤, 모바일 가독성 관점에서 검토해줘.
```

### 5. `site/` 폴더에서 모바일 폴리시 사용

```text
$mobile-polish
모바일에서 버튼 간격과 본문 줄 길이를 더 읽기 좋게 다듬어줘.
```

## 승인 정책은 왜 `never`인가요?

공식 문서 기준으로 가장 보수적인 출발점은 더 엄격한 승인 정책입니다.

다만 이 예제는 책 독자가 "Codex가 실제로 알아서 일하는 감각"을 빨리 보는 데 초점을 둡니다.

그래서 여기서는 다음 조합을 택했습니다.

- 승인 없음
- workspace sandbox 유지
- network off

이건 **공식 문서 위에 얹은 실전용 선택**입니다.

즉, 제 판단으로는 책 예제에는 이 조합이 더 낫습니다.

반면 회사 코드베이스나 낯선 저장소라면 `cautious` 프로필이 더 안전합니다.

## 공식 Codex skill 메모

공식 문서에 따르면 Codex에는 OpenAI가 번들로 넣어둔 system skill이 있습니다.

- `skill-creator`
- plan skills

그리고 curated skill 설치용으로 다음도 공식 문서에 나옵니다.

- `skill-installer`

정리는 [OFFICIAL-CODEX-SKILLS.md](./OFFICIAL-CODEX-SKILLS.md)에 붙여뒀습니다.
