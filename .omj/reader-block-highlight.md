---
name: reader-block-highlight
status: seed
iteration: 1
domain: platform
stage: mvp
created: 2026-04-22
updated: 2026-04-22
---

# reader-block-highlight — 독자가 본문 블록을 클릭해 하이라이트/체크하는 읽기 인터랙션

## Why

아티클/문서를 읽는 독자가 **한 줄(또는 블록) 단위로 클릭해 강조**하며 읽을 수 있다면, 읽기 몰입도와 "어디까지 읽었는지 / 무엇이 중요했는지" 자기 추적이 올라간다. 사용자 표현: "노션처럼 클릭해서 하이라이트, 읽는 사람이 그냥 그렇게 체크하면서 볼 수 있게. 굳이 체크 보다는 그냥 해당 블록/한 줄을 클릭".

핵심 발상은 **체크박스가 아니라 클릭 하이라이트** — 편집 권한 없이도 독자가 본문과 상호작용하며 '자기 주석' 레이어를 갖는다. `article-reading-ux.md` 의 Backlog "하이라이트/북마크 기능" 이 이 intent 의 선행 seed.

## What (hypothesis)

- [hypothesis] **블록 단위 클릭 하이라이트** — 본문 p/li/blockquote/code 블록을 클릭하면 해당 블록에 강조 스타일(배경 tint 또는 left accent) 토글. 재클릭 해제 → **metric: 독자가 본문 어느 줄이든 눌러 강조/해제 가능**
- [hypothesis] **로컬 저장** — 익명 독자도 다음 방문 시 강조 상태 유지. localStorage 키 전략: `{workspaceSlug}/{docPath}/highlights` 에 블록 hash 저장 → **metric: 페이지 재방문 시 강조 복원**
- [hypothesis] **블록 식별 전략** — DOM path 가 아닌 **본문 텍스트 hash** 로 블록 식별 (본문 편집 시에도 보존 가능성 최대화). 충돌 시 "블록 이동됨" 상태로 표시하거나 조용히 drop → **metric: 본문 일부 수정 후에도 기존 하이라이트 80% 이상 복원**
- [hypothesis] **도메인 범위** — blog/docs 타입의 공개 read view 에서만 활성. 에디터/어드민에서는 비활성 → **metric: DocPage 읽기 모드에서만 클릭 토글**

## Not

(탐색하면서 채운다)

## Context

### 관련 의도

- `article-reading-ux.md` — Backlog "하이라이트/북마크 기능" 이 본 intent 의 기원. 해당 항목은 본 intent 로 승격됨 (article-reading-ux 는 피드백/공유 잔여 스코프에 집중)
- 레퍼런스: Notion의 블록 레벨 선택/강조, Medium 의 하이라이트-인용, MDN 의 heading-anchor 인터랙션

### 기술 footprint 후보 (확정 전)

- `core/packages/viewer/src/pages/DocPage.tsx` — 읽기 모드 마운트 지점
- `core/packages/viewer/src/components/` — `ReaderHighlight.tsx` 신설 (이벤트 위임 + 상태)
- `core/packages/viewer/src/hooks/` — `useReaderHighlights.ts` (localStorage 훅)
- `core/packages/viewer/src/styles/markdown.css` — 강조 상태 CSS
- SSG publish 에서도 동일 동작 할지 여부 미결정 (hydrate 필요)

### 미해결 질문

- 로그인 사용자는 서버 저장까지 갈 것인가? (첫 iteration 은 localStorage 만)
- 하이라이트는 "한 블록 = 하나의 색" 인가 vs. 다색 팔레트?
- 공유 링크 (`?hl=블록id,블록id`) 로 타인에게 강조 상태 전달 기능 필요한가?
- 하이라이트 목록 패널 (사이드바에 "내가 강조한 줄" 모아보기) 필요한가?

## Footprint

(아직 없음)

## Learnings

### 2026-04-22: seed (iteration 1)

- **Background**: workspace-content-themes build 진입 직후 사용자가 함께 제기한 별개 축. "테마 시스템과 상관없이 한 줄 한 줄 노션처럼 클릭 하이라이트" — 콘텐츠 스타일(테마) 과 읽기 인터랙션(하이라이트)은 직교 축이라 분리
- **Why article-reading-ux 와 분리했는가**: article-reading-ux 는 이미 피드백 위젯/공유 버튼/TOC 잔여 스코프로 좁혀져 있음. 하이라이트는 별도 UX 축 + localStorage/hash 전략 등 자체 설계 필요량이 커서 의도로 승격하는 편이 깔끔
- **Open question** (다음 인터뷰): 우선순위 — 지금 당장 만들 만한가, 아니면 피드백 위젯/공유 버튼 먼저가 맞는가
