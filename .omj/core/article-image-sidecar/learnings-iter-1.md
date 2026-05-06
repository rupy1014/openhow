---
name: article-image-sidecar — iteration 1 learnings (frozen)
description: iter1 의 Learnings 스냅샷 — seed → done 까지의 설계 결정·버그·교훈. iter2 시작 시 freeze.
frozen_at: 2026-04-22
---

# article-image-sidecar — iteration 1 Learnings (frozen)

### 2026-04-22: seed created (iteration 1)
- **Background**: bootpay-contents/blog 의 `/payment-intro/payment-basics` 에 이미지를 넣는 방법 논의 중, 인라인 이미지의 세로 스크롤 낭비 문제를 해결하기 위해 우측 TOC 자리를 스크롤-싱크 이미지 패널로 전환하는 아이디어 도출
- **확정된 설계 결정** (대화):
  - 우측 aside 정책: **TOC 제거, 이미지 전용**. TOC가 실제 본문 연출에 쓰이지 않는다는 저자 판단
  - 이미지 연결 방식: **링크/주소 기반** (URL · 상대경로). 이미지 저장소 신설 없음
  - 매칭 단위: **본문 범위(블록/섹션 구간) ↔ 이미지 1:1 매칭** 방향. 구체 문법은 Explore 대상
- **Open questions → Explore mode 에서 풀 것**:
  - 매칭 문법 (`:::figure-side` 컨테이너 vs heading anchor 매핑)
  - 전환 연출 (페이드/크로스디졸브/슬라이드)
  - 좁은 뷰포트 fallback (인라인 승격 vs 숨김)
  - 매칭 공백 구간의 이미지 상태

### 2026-04-22: step 1 parser + DOM scaffold implemented
- `:::figure-side src="..." [caption="..."]` 는 SPA/SSG 파서 모두에서 동일 DOM 으로 렌더됨
- `src` 가 없으면 custom extension 이 토큰화를 포기해 generic `containerExtension` fallback 으로 흘러감
- Step 1 범위는 parser/DOM/CSS fallback 까지이며, sidecar panel component / observer wiring 은 아직 미구현

### 2026-04-22: step 2 → 2.5 정정 — blog/docs 는 DocumentPreset 이 아닌 PublicationPreset 을 탄다
- **놓쳤던 지점**: Plan 에서 "UnifiedLayout.tsx:736 `toc={<TableOfContents />}` 를 교체" 로만 설계했는데, 실제로 `TYPE_TO_DEFAULT_LAYOUT.blog = 'publication'` 이라 blog/docs workspace 는 DocumentPreset 분기에 아예 진입하지 않는다. `UnifiedLayout.tsx` 는 `PublicationPreset` 3 분기(three-rail / two-panel / default) 를 우선 타고, DocumentPreset 은 그 외 타입(book 제외)의 fallback.
- **교정 결과**: `PublicationPreset` 에 `rightAside` prop 신설 + `--pub-left-total`/`--pub-right-total`/`--proximity-shift` 로 중앙정렬 공식을 `DocumentPreset` 과 동일 패턴으로 재정리. `pub-preset-body--has-right-aside` modifier 가 있을 때만 grid 가 확장되므로 aside 없는 다른 workspace 는 픽셀 단위 동일.
- **교훈**: preset 선택 매트릭스(`TYPE_TO_DEFAULT_LAYOUT`)를 plan 단계에서 먼저 훑었어야 했다. "TOC 슬롯 교체" 라는 표현만 믿고 한 preset 만 보면 안 된다.

### 2026-04-22: ImageSidecar 는 MutationObserver 로 blocks 대기 필요
- **증상**: useEffect `[]` dep 으로 최초 1회 querySelectorAll — 마크다운이 async 로 렌더되는 경우 mount 시점에 `.figure-sidecar-block` 이 0개. 결과적으로 `setCurrent` 호출 안 되고 empty state 유지.
- **수정**: useEffect 안에 MutationObserver(`document.body`, `{ childList: true, subtree: true }`) 를 달고 scan 함수를 돌려 block 이 나타나면 IntersectionObserver 에 이어붙이고 초기 current 를 설정. SSG 쪽(`hydrateScript.ts`)은 이미 DOM 이 서버 렌더된 상태에서 init 이 돌기 때문에 동일 문제 없음.
- **교훈**: React 에서 Outlet 하위 async content 를 querySelector 로 접근하는 컴포넌트는 반드시 MutationObserver 보강 필요.

### 2026-04-22: has-right-aside 조합 셀렉터의 CSS specificity 함정
- **증상**: `@media (max-width: 1679px) { .pub-preset-body--has-right-aside { --pub-right-total: 0px; } }` 가 기대대로 적용되지 않아서 narrow viewport 에서도 `--pub-right-total: 400px` 가 유지. 그 결과 main 의 padding-right 공식이 음수가 되면서 본문이 계속 우측으로 쏠림.
- **원인**: `.pub-preset-body--two-panel.pub-preset-body--has-right-aside` 같은 combo 셀렉터가 (0,2,0) specificity 를 가져서 media query 안의 (0,1,0) 단일 클래스 셀렉터를 이김. media query 는 specificity 를 주지 않는다.
- **해결**: media query 안에서 각 combo 를 명시적으로 열거 — `.pub-preset-body--has-right-aside, .--two-panel.--has-right-aside, .--three-panel.--has-right-aside, ...` 식으로 복수 셀렉터 나열.
- **교훈**: CSS 커스텀 프로퍼티도 일반 속성과 동일하게 cascade. media query 만으로는 specificity 가 안 올라간다. 일반 룰이 combo 셀렉터로 값을 박아뒀으면 반응형 오버라이드도 combo 셀렉터로 받아야 함.

### 2026-04-22: figure-sidecar 는 TOC 와 완전히 별개의 폭 토큰을 가져야 한다
- **문제**: iter1 초기 구현에서 `--aside-width: 220px` (TOC 용 전역 토큰) 을 그대로 빌려 썼더니 사용자가 "너무 우측에 떠 있고 너무 작다" 로 판단. 왼쪽 nav 는 product-rail(180) + feature-rail(220) 으로 총 400px 인데 우측만 220 이라 시각적 비대칭.
- **해결**: `--figure-sidecar-width: 400px` 를 `.pub-preset-body` 스코프에 신설하고 `--aside-width` 와 완전 분리. DocumentPreset 의 TOC 는 그대로 220 유지.
- **추가 수정**: `.pub-preset-body--three-panel` 같은 mode 기본 룰이 `--pub-right-total: 0px` 를 박고 있어서 `.--has-right-aside` 의 공통 값이 CSS 캐스케이드에서 덮이던 숨은 버그 — 각 mode+aside 조합 룰에서 `--pub-right-total: var(--figure-sidecar-width)` 를 명시해야 proximity-shift 공식이 제대로 동작.
- **교훈**: "같은 우측 레일이니까 같은 토큰 쓰자" 라는 gut 이 잘못. 레일별 용도(TOC 네비 vs 이미지 연출) 에 따라 시각 가중치가 달라서 폭 토큰부터 분리하는 게 맞다. 왼쪽 레일 합산과 대칭을 맞추면 centering 수학도 자연스럽게 해결됨.

### 2026-04-22: `:::` 블록은 현재 nesting 불가 (smoke sample 설계 제약)
- figureSideExtension 의 regex 는 `[\s\S]*?\n?:::` 비-greedy 라 안쪽에 다른 `:::...` 블록이 있으면 첫 `:::` 매칭에서 닫혀버림. 다른 기존 확장(canvas/container 등)도 동일 패턴.
- 당장은 smoke sample 에서 `:::figure-side` 가 `:::canvas-flow` 를 감싸지 않도록 canvas-flow **다음**에 배치. 저자 친화성을 위해선 추후 `whenExtension` 처럼 opening colon 수를 backreference 로 잡는 방식 필요 — backlog 등록.

### 2026-04-22: sticky child 의 scroll container 함정 — aside 에 overflow-y:auto 가 있으면 panel sticky 가 viewport 기준으로 동작 안 함
- **증상**: Step 6 헤드리스 검증은 통과했는데(panel.classList.empty=false, img src 정상) 실제 뷰포트에서 이미지가 안 보였음. 검사 결과 panel.rect.y = -2383 (뷰포트 위로 벗어남).
- **원인**: `.pub-preset-right-aside` 가 `overflow-y: auto` → 자체 scroll container 생성. 내부 panel 의 `position: sticky` 는 **가장 가까운 scrollable ancestor** 기준으로 고정. 그래서 panel 이 aside 내부 scroll 을 따라다닐 뿐, 페이지 전체 스크롤에는 반응 못 함. aside 자체는 static 이라 페이지 스크롤 시 같이 위로 빠짐 → panel 도 같이 사라짐.
- **해결**: `.pub-preset-right-aside` 에서 `overflow-y: auto` 한 줄 제거. aside 가 scroll container 가 아니게 되니 panel sticky 는 document/viewport 기준으로 재매핑됨.
- **교훈**: `position: sticky` 는 항상 "가장 가까운 scrollable ancestor" 기준. 부모에 `overflow: auto|scroll|hidden` (특히 `hidden` 도 해당) 이 있으면 의도한 viewport fixed 가 아니라 그 ancestor 안에서만 sticky. content 높이가 ancestor 보다 작으면 scroll 자체가 없어서 sticky 도 무의미해진다. sticky 가 의도대로 안 붙으면 먼저 **ancestor chain 의 overflow 값** 을 의심.

### 2026-04-22: IntersectionObserver → scroll+compute() 전환으로 range 제어 + 라우트 전환 persist 버그 동시 해결
- **IntersectionObserver 한계**: 블록이 뷰포트에 들어온 순간을 "point marker" 로 보기 때문에 "이 구간 밖이면 비워라" 를 표현 못함. 저자가 원한 건 구간 기반 활성화 (range marker) 였음.
- **라우트 전환 버그 원인**: `useEffect([])` 초기화 후 컴포넌트가 re-mount 안 되니까 `current` state 가 이전 페이지 값 그대로 유지. IntersectionObserver 는 이전 페이지 DOM 에서 이미 해제됐는데 state 만 남아서 "모든 페이지에 이전 이미지 노출" 현상.
- **해결 패턴**: `scroll` + `resize` + `MutationObserver` 가 공통 `compute()` 를 raf-throttled 로 재호출. compute 는 매번 DOM 을 다시 조회 → 블록 리스트가 비면 `setCurrent(null)`. MutationObserver 가 route change(React Router 가 Outlet DOM 을 갈아끼움) 를 감지해서 자동으로 compute 재실행 → 이전 이미지 자동 clear.
- **activation line = vh * 0.3**: 읽는 지점(보통 화면 위쪽)의 "현재 집중 영역" 에 맞는 이미지를 보여줌. 뷰포트 중앙이 아닌 상단 30% 로 잡은 건 독자의 시선이 보통 위쪽에 있기 때문.
- **range = `[block[i].top, block[i+1].top)`**: 다음 블록이 나오기 전까지 현재 이미지 유지. 마지막 블록은 `bottom + 0.8 * vh` 로 tail buffer 줘서 본문 끝까지 편하게 읽고 나면 자연스럽게 empty 로.
- **교훈**: "DOM 변화 기반 trigger" 가 필요한 UI 에서는 IntersectionObserver 보다 `scroll + compute()` + `MutationObserver` 조합이 range 제어 + 라우트 전환 resilience 둘 다 잡는다.
