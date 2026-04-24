---
name: workspace-content-themes
status: building
iteration: 1
domain: platform
stage: mvp
created: 2026-04-22
updated: 2026-04-22
---

# workspace-content-themes — 워크스페이스별 콘텐츠 테마 시스템

## Why

`openhow serve/publish` 로 렌더링되는 본문에서 heading(특히 `###`) 위계가 시각적으로 약해, 문서 스캔성이 떨어진다. 구체 시그널: clauders-book (type=blog) 의 `/getting-started/00-welcome` 페이지에서 `###` 이 본문과 잘 구분되지 않아, 사용자가 "h3 에 background color 를 적용할까" 고민 중.

여기서 한 층 올려 생각하면 질문은 **"워크스페이스마다 톤이 다르므로(clauders-book=강의형, bootpay=테크 레퍼런스 등), 타입(blog)은 같아도 테마를 워크스페이스 단위로 고를 수 있게 축을 하나 더 만들 것인가"**.

`blog-workspace-style-polish` (building) 는 bootpay 레퍼런스 기반 **단일 blog 타입 스타일**을 bootpay 수준으로 끌어올리는 중이고, 그 Not 섹션에 "design-system-foundation 의도 범위"로 이 확장 축을 **명시적으로 배제**해 두었음 → 본 의도가 그 배제된 축을 담당한다.

## What

### (v1 iter 1) — 이번 빌드 (core 전체 적용)

- [hypothesis] **`###` heading 시각 업그레이드 (core, SPA+SSG 동시)** — h3 한 조합을 정해 `markdown.css` + `ssgStyles.ts` 양쪽에 전역 적용. 조합 후보: **soft bg + left accent bar (3px primary) + 적정 여백**. 다른 variant 는 테마 프리셋으로 확장 시 재검토 → **metric: clauders-book 00-welcome 뿐 아니라 모든 blog/docs 타입 워크스페이스에서 h3 가 본문 대비 즉시 구분됨**
- 적용 지점:
  - `core/packages/viewer/src/styles/markdown.css` (SPA serve 경로)
  - `core/packages/cli/src/ssg/ssgStyles.ts` (publish 경로)
- **스코프**: h3 만. h2/h4 는 기존 규칙 유지 (h3 가 가장 약하다는 시그널)
- **전체 적용 판단 근거**: 사용자 결정 — 한 페이지 variant 실험은 과한 인위적 세팅. core 수정이 곧 배포이고, 워크스페이스 테마 인프라는 별도 이터레이션으로 미룸

### (backlog — 이번 빌드에서 다루지 않음)

- [hypothesis] **테마 프리셋 스펙 초안** — `openhow.json` 에 `theme: "classic" | "editorial" | "pastel" | ...` 키 + 프리셋 토큰 번들 (primary, heading-bg, heading-accent, border-radius, spacing). variant 고른 뒤 "이 조합이 한 프리셋" 으로 올림
- [hypothesis] **SPA/SSG 동시 적용 경로** — variant 확정 이후 `markdown.css` ↔ `ssgStyles.ts` 규칙 동기화

## Not

(탐색하면서 채운다)

## Context

### 관련 의도

- `blog-workspace-style-polish` (building) — bootpay 레퍼런스 기반 단일 blog 스타일 완성. Not 에 "design-system-foundation 의도 범위"로 본 축 배제. **본 의도는 그 위에 선택 축을 얹는 성격**
- `docs-semantic-containers` (done, iter 3) — 의미적 블록(`:::endpoint`, `:::parameters`, `:::response`) 확장. heading 자체는 다루지 않았음
- `workspace-ux-improvement` (building) — 관리 UX. 무관

### 시그널 소스

- 렌더 경로: `http://localhost:3804/getting-started/00-welcome`
- 소스 문서: `/Users/taesupyoon/sideProjects/youtube/channels/jobdori/clauders-book/docs/getting-started/00-welcome.md`
- 워크스페이스 설정: clauders-book `openhow.json` — `type: "blog"`, `workspace: "jobdori-clauders-book"`

### 기술 footprint 후보 (확정 전)

- `core/packages/types/src/config.ts` — `openhow.json` 스키마에 `theme` 필드 추가
- `core/packages/viewer/src/styles/markdown.css` — h3 규칙 + 테마 스코프 CSS 변수
- `core/packages/cli/src/ssg/ssgStyles.ts` — publish 경로 동일 규칙 동기화
- `core/packages/viewer/src/layouts/BlogLayout.tsx` — 루트 className 에 `theme-*` 주입

## Footprint

### core

- core/packages/viewer/src/styles/markdown.css — code — v1-hyp-1 — 공통 `.markdown-content h3` 에 soft primary bg + 3px accent bar + padding + 우측 rounded 추가, `.md-steps h3` 에 reset 4개 (2026-04-22)
- core/packages/cli/src/ssg/ssgStyles.ts — code — v1-hyp-1 — SSG 공통 h3 + blog 타입 override 양쪽 동일 적용, `.md-steps h3` 에 reset 4개 (SPA/SSG px 일치) (2026-04-22)

## Learnings

### 2026-04-22: seed (iteration 1)

- **Background**: 사용자가 clauders-book 00-welcome 페이지의 `###` 에 bg color 적용을 고민하다가, 한 층 더 올려 "워크스페이스별 테마 시스템" 을 제기
- **Key observation**: 이 발화에는 스코프 두 층이 섞여 있음
  - (a) **당장의 구체 시각 수정** — clauders-book h3 한 곳을 뚜렷하게
  - (b) **테마 인프라 도입** — openhow.json 스키마 + 토큰 세트 + 적용 메커니즘
  - (a) 만 하면 분 단위 작업, (b) 까지 하면 blog-polish 의 Not 를 정식 스코프로 끌어오는 중간 규모 작업
- **Related-intent check**: blog-polish Not 에 "design-system-foundation 의도 범위" 가 사전 배제되어 있어, 본 의도로 분리해 들어오는 것이 저자 판단과 일치 (Why 겹치지만 angle 다름)
- **Open question** (다음 인터뷰): (a) 먼저 할지 (b) 먼저 할지, 또는 (a) 를 "테마 = classic 의 일부" 로 흡수하는 설계로 갈지
- **Decision (2026-04-22, 초기)**: 사용자 선택 — "한 곳에서 시각화 먼저". 스코프 (a) 로 좁혀 실험 variant 3~4개 를 clauders-book `/getting-started/00-welcome` 에 동시 적용해 비교. 테마 시스템 인프라 (b) 는 variant 확정 후 별도 이터레이션으로 미룸
- **Decision revision (2026-04-22, build 진입 직후)**: 사용자 pivot — "한 곳 실험 말고 core 전체 적용". 이유: 한 페이지 variant 나열은 인위적 세팅 (markdown extension 또는 HTML wrapper 필요) 이 실제 사용 맥락과 거리가 있음. core 수정이 곧 배포이므로 조합 하나를 정해 바로 적용. variant 고민은 추후 테마 프리셋 도입 시 재검토

### 2026-04-22: (iteration 1) /omj:build execution feedback

- **Applied**: 공통 `.markdown-content h3` + blog override + `.md-steps h3` reset — 총 5 블록, 2 파일, +20 insertions
- **Deviation from plan**: 초기 플랜엔 md-steps reset 이 없었음. 1차 Codex 리뷰에서 `:::steps` 컨테이너의 step 제목도 h3 이므로 새 bg/accent 가 누수된다는 회귀를 발견해 reset 4개 (`padding: 0 / background: transparent / border-left: 0 / border-radius: 0`) 를 추가
- **Codex misbehavior**: 수정 위임을 `--resume-last` 로 돌렸을 때 이전 세션 맥락이 섞여 md-code-group/dark mode 블록까지 대대적으로 재구성하는 scope creep 발생 → 롤백 후 신규 세션에 통합 프롬프트로 재위임해 해결. **Learned**: fix 라도 이전 작업과 맥락이 다르면 `--resume-last` 금지, 신규 세션에 명시적 MUST NOT (특히 "관련 없는 블록 리포맷 금지") 을 적으로 두고 위임
- **Scope**: core
- **Metric status**: visually unverified — 사용자 확인 대기 중 (페이지 새로고침 후 h3 가 본문 대비 뚜렷한지 육안 체크)
