# article-image-sidecar — iter3 Learnings (frozen 2026-04-29)

iter3 = readers-pull (event-driven trigger) 모드. `:::figure-side id=...` / `data-figure-show="<id>"` 트리거로 우측 sidecar 를 의도적으로 reveal/dismiss. anchor-range 기반 자동 닫기 + ESC + 동일 id 다중 트리거 동기화.

iter4 freeze 시점 기준 — iter4 는 모바일 grid collapse 수정 (cascade specificity)을 메인 축으로 진입.

---

### 2026-04-24: [signal] 모바일 브라우저에서 본문 width 가 50% 처럼 보이고 우측이 빈다
- **Source**: 대화 중 사용자 발화 (2026-04-24 session)
- **Signal**: "모바일 브라우저로 보면 본문 width 가 50% 인것처럼 우측 공간이 비어있거든. 이거 아마 toc 나 이미지 영역일 수 있는데, 모바일에서는 이거 안보이게 해줘도 될거같네. 아니면 어떻게 하는게 좋을가? 본문에 버튼식으로 이미지 띄우는게 있는데."
- **Intent change**: iter4 에서 (a) 후보 채택 — 우측 aside 컬럼 자체를 모바일에서 grid 에서 제거 (column reservation 자체 제거). cascade specificity 수정 방식.
- **관련 기존 정책**: iter3 에서 이미 `≤1679px` → inline fallback + 트리거 scrollIntoView 를 설계했으나 실제 ≤767px 렌더링 차트 / grid column 점유 여부 재확인 필요
- **Root cause (2026-04-24 Playwright 확인, 375×667 viewport, `/subscription/subscription-basics`)**: body class = `pub-preset-body--has-right-aside pub-preset-body--two-panel`. 실측 grid-template-columns = **`200px 200px 0px`** (main-nav 200 + publication-nav 200 + 1fr=0). main-nav-panel / sub-sidebar 는 `display:none` 이지만 grid 트랙은 그대로 남아, `.pub-preset-main` 이 첫 빈 트랙(200px)에 배치 → 본문이 200/375 ≈ 53% 로 찌그러지고 우측 175px 가 "빈 공간" 으로 보임. PublicationPreset.css 의 `@media (max-width: 1679px)` `.pub-preset-body--two-panel.has-right-aside { grid-template-columns: main-nav publication-nav 1fr }` (specificity 0,2,0) 이 `@media (max-width: 1279px)` `.pub-preset-body--two-panel { grid-template-columns: minmax(0,1fr) }` (specificity 0,1,0) 을 cascade 에서 이긴다. `--three-panel.has-right-aside` / `--main-nav-only.has-right-aside` 도 동일 패턴. 수정 = 1279 / 767 단계의 grid-collapse 규칙을 `*.has-right-aside` combo 셀렉터까지 매치하도록 specificity 올리기 (이전 iter1 Step 5 에서 1679 공통 셀렉터 버그를 cascade 상 이기지 못해 combo 셀렉터 명시한 것과 정확히 같은 패턴 — 반복 실수).
- **SSG 미러 확인 필요**: `cli/src/ssg/ssgStyles.ts` 의 `.ssg-main:has(.ssg-figure-sidecar)` grid 분기도 동일한 cascade 구조라 동일 수정 필요 (iter2 Step 5 와 같은 리듬).

### Anchor-range math trap — 대칭 generous pad + 일관된 comparator
iter3 초기 스펙은 `[trigger_top - vh*0.3, trigger_bottom + vh*1.0]` 비대칭 pad. Playwright 가 click 전에 버튼을 `scrollIntoView({block:'center'})` 하고, click 후 브라우저가 layout/font 로 수백 px 정착하면 settled `scrollY` 가 tight 위쪽 anchor(`trigger_top - vh*0.3`) 를 **거꾸로** 넘어버린다 → raf 다음 frame 에 manual 즉시 해제. 실제 독자도 클릭 직후 손가락 scroll 로 위로 조금만 움직이면 같은 상황. **해결 = 두 방향 모두 `vh*1.0` 이상 generous pad** + manual/scroll-sync 모두 `activationDocY = scrollY + vh*0.3` 기준으로 비교 (원시 `scrollY` 쓰지 말 것 — scroll-sync 와 comparator drift 생기면 경계에서 flicker). 같은 실수 재발 방지용: anchor range 수정 시 항상 (1) pad 대칭 확인 (2) comparator 가 전역 `activationDocY` 와 일치 확인.

### Event-driven trigger decoupling — `data-figure-id` + document-level delegation
figure 블록과 버튼을 1:1 바인딩하지 않고 id 문자열로 간접 참조하니 `<button>` / 테이블 셀 / raw HTML 어디든 `data-figure-show="<id>"` 만 달면 트리거가 된다. DOMPurify allowlist 에 `data-figure-show` / `data-figure-id` / `data-figure-trigger` 3개만 추가하면 저자가 마크다운에 `<button data-figure-show="...">` raw HTML 삽입해도 그대로 통과. 런타임은 document 에 click 위임 한 번만 — trigger 수가 늘어도 O(1) 리스너. React useEffect 의 clean-up 과 SSG `initFigureSidecar()` 의 sentinel flag 패턴을 맞추면 hot-reload / 재진입에도 중복 바인딩 없음.

### 같은 id 여러 트리거 — `syncAriaPressed(activeId)` 로 순회 동기화
본문에 `data-figure-show="widget"` 버튼이 여러 곳(표 안 / 단락 안 / 섹션 끝)에 중복되는 게 UX 관점에서 자연스럽다. manual 상태가 바뀔 때마다 `document.querySelectorAll('[data-figure-show]')` 전체 순회로 `aria-pressed` 를 재계산하지 않으면 일부 버튼만 "active" 로 남는 고립 상태 발생. 개수가 폭발하지 않는 한(문서당 수십 개) 전체 순회가 분기 로직보다 안전.

### `openhow serve` (port 3600) vs `viewer dev:prod` — 로컬 마크다운 smoke 는 serve 만
`viewer pnpm dev:prod` 는 `/api` 를 production openhow.io 로 프록시 → 로컬 파일시스템 변경 사항이 렌더되지 않는다. SPA runtime + 로컬 마크다운 + Playwright 조합으로 UX smoke 돌릴 때는 `openhow serve` 가 유일한 경로. 다음 iter 에서 마크다운 편집 → smoke 루프 돌릴 때 반드시 port 3600 확인.

### Codex 쓰기 범위는 writable root 에 한정
iter3 smoke sample 이 `youtube/channels/bootpay-contents/` 에 있어서 Codex 가 직접 Edit 실패. 해결 = Codex 는 core/ 안만 수정하게 하고, 외부 콘텐츠 파일(.md sample) 은 Claude 가 직접 Edit. delegation 프롬프트 작성 시 "write scope" 를 명시해서 Codex 가 경계 벗어나는 시도로 시간 낭비 안 하도록 할 것.
