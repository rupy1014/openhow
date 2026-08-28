---
slug: embeds/install-codex-auth
title: codex-auth 설치와 검증 맡기기
---

=== 여기서부터 복사 ===

내 Downloads 폴더에 있는 `codex-auth.zip`을 설치해줘.

1. ZIP 안에 `codex-auth/SKILL.md`, `codex-auth/HISTORY.md`, `codex-auth/WINDOWS.md`, `codex-auth/scripts/codex-auth.mjs`, `codex-auth/scripts/dscodex.sh`, `codex-auth/scripts/selftest.sh`만 있는지 먼저 확인해줘.
2. 내가 지금 쓰는 에이전트가 Codex면 `~/.codex/skills/`, Claude Code면 `~/.claude/skills/`에 설치해줘.
3. 같은 이름의 스킬이 이미 있으면 날짜가 붙은 백업을 만든 뒤 교체해줘.
4. `codex-auth.mjs`, `dscodex.sh`, `selftest.sh`에 실행 권한을 줘.
5. `~/.codex/config.toml`에 `cli_auth_credentials_store = "file"`이 정확히 한 번만 있도록 확인해줘. 다른 설정은 바꾸지 마.
6. `selftest.sh`를 실행하고 통과 여부를 알려줘. 이 테스트는 실제 로그인 정보가 아니라 임시 샌드박스만 써야 해.
7. 실제 계정 추가나 계정 전환은 하지 마. 설치와 테스트까지만 해줘.

=== 여기까지 복사 ===
