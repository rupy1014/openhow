---
hidden: true
---

# Antigravity (Gemini) MCP 설정 프롬프트

> 이 파일의 "=== 여기서부터 복사 ===" 부터 "=== 여기까지 복사 ===" 까지 복사해서 새 Claude Code 세션에 붙여넣어.

---

=== 여기서부터 복사 ===

이 프로젝트에 Antigravity (Gemini) 에이전트 설정을 해줘. `.agents/` 정본 구조를 기반으로 Antigravity가 인식하도록 연결해줘.

## 전제 조건

- `.agents/workflows/`와 `.agents/roles/`에 파일이 이미 있어야 해
- 없으면 먼저 만들고 진행해

## 1. `.gemini/settings.json` 생성

```json
{
  "context": {
    "fileName": ["GEMINI.md", "CLAUDE.md"]
  },
  "experimental": {
    "enableAgents": true
  }
}
```

`enableAgents: true`가 없으면 에이전트/워크플로우 기능이 아예 꺼져.

## 2. `GEMINI.md` 생성

프로젝트 루트에 만들어줘. `@./` 구문으로 기존 파일을 임포트하면 내용 복붙이 필요 없어.

```markdown
# GEMINI.md

## 규칙 (자동 임포트)

@./CLAUDE.md
@./AGENTS.md

## 파이프라인

(이 프로젝트의 파이프라인 요약 — 프로젝트를 분석해서 적절하게 채워줘)

## 에이전트 역할

(에이전트별 한 줄 설명 — .agents/roles/ 파일을 읽고 채워줘)
```

## 3. 에이전트를 `.gemini/agents/`에 연결

```bash
mkdir -p .gemini/agents
ln -s ../.agents/roles .gemini/agents
```

## 4. 워크플로우 frontmatter 확인

`.agents/workflows/` 안의 모든 .md 파일에 `description:` frontmatter가 있는지 확인해. 없으면 추가해.

```markdown
---
description: (워크플로우 한 줄 설명)
---
```

이게 없으면 Antigravity Customizations 패널에 안 나타나.

## 5. `.agent/skills/` 스킬 등록

```bash
for agent in $(ls .agents/roles/*.md | xargs -n1 basename | sed 's/.md//'); do
  mkdir -p .agent/skills/$agent
  ln -sf ../../../.agents/roles/$agent.md .agent/skills/$agent/SKILL.md
done
```

## 확인

설정 후 이걸 체크해줘:
- [ ] `.gemini/settings.json` — `enableAgents: true`
- [ ] `GEMINI.md` — 프로젝트 루트에 존재
- [ ] 워크플로우 `.md` — `description:` frontmatter 있음
- [ ] `.agent/skills/{이름}/SKILL.md` — 존재
- [ ] Antigravity 재시작 필요 안내

=== 여기까지 복사 ===
