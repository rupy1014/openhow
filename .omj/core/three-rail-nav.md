---
status: superseded
created: 2026-04-20
updated: 2026-04-20
iteration: 1
supersededBy: core/nav-mode-collapse.md
---

# three-rail-nav — 3레일 세로 네비게이션 (Track × Product × Feature)

## Why

`bootpay-docs/developer` 같은 공식 개발자 레퍼런스는 **제품축 × 기능축** 이 교차해서 한 섹션에 문서가 20개 넘게 쌓인다. 현재 openhow 는 `[MainNav | Sidebar | Main]` 2레일 구조 + 스캐너가 서브폴더를 1단까지만 그룹으로 처리 → `결제 SDK > 단건 결제 > 클라 SDK > 위젯` 같은 3단 IA 를 표현할 방법이 없다. 사용자가 메뉴 한 컬럼에서 6개 그룹을 동시에 스캔해야 해서 길을 잃는다.

Stripe/Cloudflare/AWS 식 "**3 레일 = Track / Product / Feature**" 구조로 가면 독자가 메뉴 깊이마다 질문 하나씩 해결한다. 렌더 파이프라인(`NavigationItem.items` 재귀)은 이미 N단 지원. 막혀있는 건 (1) scanner 가 폴더 2단까지만 이해, (2) 뷰어가 2레일 grid 만 지원 — 이 둘이 해결 범위.

**제약: 본문은 브라우저 정중앙에 고정.** 이건 어떤 레일 구성에서도 깨지면 안 됨. 기존 `ghost right-padding` 트릭(`PublicationPreset.css:45-58`)을 3레일로 확장.

## Context

**부모 intent**: `core/unified-layout.md` (iter 10, done). 이 작업은 통합 레이아웃 위에 **새로운 계층 표현 레이어**를 얹는 것.

**요구 문서**: `docs/three-level-nav-requirement.md` — 스캐너 재귀 동작 + URL 정책(A안: 경로 그대로) + 하위 호환 방향까지 명시. 이 intent 는 거기서 미확정이던 **"nav 3개면 공간 활용 UX"** 를 풀고 실행 범위를 잠금.

**현재 2레일 (실측)**:
- `--main-nav-width` = `--publication-nav-width` = **200px**
- `--content-reading-max` = **740px**
- 완벽 중앙정렬 필요 뷰포트: `2 × 200 + 740 ≈ 1572px`

**3레일 가로 예산 (중앙정렬 유지 조건)**:
- 왼쪽 레일 합을 X 라 하면 필요 뷰포트 = `2X + 740`. 3레일을 다 200px 로 두면 2092px 필요 → 외장 모니터 전용.
- 실전 해답: 레일별 역할에 맞춰 폭 차등 + 뷰포트 breakpoint 로 graceful fallback.

**레일 역할 (확정)**:

| 레일 | 역할 | 항목 수 | 기본 폭 | 축소 시 |
|---|---|---|---|---|
| **L1 Track** | 제품 트랙 (결제 SDK / 커머스 / 인증) | 3~8 | 72px (icon+짧은 라벨) | 56px (icon-only) → 헤더 탭 → 드로어 |
| **L2 Product** | 제품 (단건 / 빌링 / 구독) | 3~5 | 180px | 유지 |
| **L3 Feature** | 기능축 트리 + 페이지 | 5~20+중첩 | 220px | 유지 |

**뷰포트 breakpoint**:

| 뷰포트 | 동작 | 중앙정렬 |
|---|---|---|
| ≥ 1760px | 3레일 전개 (72 + 180 + 220) | ✅ |
| 1440–1759px | L1 아이콘-only (56px) | ✅ |
| 1280–1439px | L1 → 헤더 가로 탭 (2레일로 축퇴) | ✅ (기존 2레일 예산과 동일) |
| < 1280px | 모바일 드로어 1개로 접힘 | 해당없음 |

**확정 설계 결정 (대화에서 합의)**:
1. **L1 = MainNav 재활용**. 기존 `MainNav.tsx` 를 72px icon-first 로 좁힘 + 아이콘 강화. 완전히 새 컴포넌트 신설 안 함.
2. **L2 Product 는 L1 선택에 따라 동적**. 활성 트랙의 children 만 표시 — 긴 리스트 스크롤 대신 정보밀도 낮춘다.
3. **1280~1439 에서 L1 은 헤더 가로 탭으로 이관**. 드롭다운 숨김보다 가시성 우선.

**데이터 모델**:
- 스캐너가 폴더 트리를 재귀로 `NavigationItem.items` 로 출력 (`docs/three-level-nav-requirement.md` 제안 그대로).
- 뷰어가 depth 에 따라 어느 레일로 보낼지 결정:
  - depth 1 (섹션 폴더) → L1 Track
  - depth 2 (그 아래 서브폴더) → L2 Product
  - depth 3+ (그 아래 전부) → L3 Feature (내부 트리)
- `depth===1 && items.length ≤ N` 같은 휴리스틱 대신 **폴더 깊이가 공식적인 신호**. `_meta.json` 에 `display` 같은 힌트는 현재 도입 안 함.

**하위 호환**:
- 대부분 워크스페이스는 depth 2 까지 → L3 이 비면 PublicationPreset 은 기존 2레일 grid 로 fallback (별도 조건 불필요, grid-template-columns 가 0-width 컬럼 처리).
- 기존 2레일 워크스페이스(blog/docs/course 등) 에 시각 변화 없어야 함. 회귀 테스트 스냅샷 비교.

## What

- [x] [validated] **스캐너 재귀 확장** — `core/packages/cli/src/scanner/index.ts` 의 `buildSidebar` 서브폴더 처리를 재귀 함수로 교체. 폴더를 발견하면 `_meta.json` 읽고 직속 파일 + 더 깊은 서브폴더를 재귀 호출하여 `NavigationItem.items` 트리 반환. 기존 `parts.length > 2` 분기 · `nestNumericChildren` 유틸은 재귀 기반으로 통합. top-nav 생성 로직은 건드리지 않음. → **metric: 기존 워크스페이스 스캔 결과 shape 무변화 (2단 구조 테스트로 커버)**
- [x] [validated] **PublicationPreset 3-panel grid 추가** — `grid-template-columns: var(--track-rail-width) var(--product-rail-width) var(--feature-rail-width) minmax(0, 1fr)` 로 `pub-preset-body--three-panel` 변형 신설. ghost right-padding 수식을 `calc(track + product + feature + 3*gap)` 으로 확장. 기존 `--two-panel` 은 유지. → **metric: 수식 기반 ghost padding 으로 뷰포트 크기와 관계없이 `main-inner` 가 `margin:0 auto` 중앙정렬 유지**
- [x] [validated] **뷰포트 breakpoint CSS** — 1759px/1439px/1279px 3단계 media query. 1759 에서 track rail 56px, 1439 에서 track rail 숨김 + 2-panel grid 로 축퇴, 1279 에서 드로어로 접힘. → **metric: 각 breakpoint 에서 ghost padding 수식이 올바른 레일 합으로 재계산됨**
- [x] [validated] **L1 MainNav 재활용 — icon-first 모드** — `MainNav.tsx` 에 `compact?: boolean` prop 추가. compact 일 때 라벨/뱃지/chevron 숨기고 icon(+label 첫 글자 fallback) + native `title` tooltip. 기존 non-compact 동작 보존. → **metric: `MainNav.tsx` + `MainNav.css` 2파일만 수정하여 완료**
- [x] [validated] **L2 Product 레일 + L3 Feature 트리 와이어링** — `UnifiedLayout` 에서 `isThreeRail` (config.navigation.mode === 'three-rail') 분기. `activeProductIndex` 는 현재 pathname 을 각 group 의 descendant link 와 재귀 매칭(`containsLink`)하여 결정 — custom slug 환경에서도 동작. L3 = `groups[activeProductIndex].items`. 기존 `Navigation` 컴포넌트 재귀 렌더 재활용. → **metric: link 기반 매칭으로 URL slug 정책과 독립**
- [x] [validated] **모바일 드로어 — 3레일 평탄화** — `<768px` 에서 `mobileSidebarContent` 에 `[MainNav(non-compact) + productRailItems + featureRailItems]` 수직 스택. Step 4 wiring 에 포함. → **metric: 탭 전환 없이 스크롤로 3계층 접근**
- [x] [validated] **스캐너 단위 테스트** — `scanner.test.ts` 신규. 2단 shape 불변 / 3단 재귀 트리 / `_meta.json` label / order 정렬 4케이스. 73/73 tests green. → **metric: `pnpm --filter @openhow/cli test run` 통과**

## Not

- **DocumentPreset 의 3레일 확장** — 일단 PublicationPreset 한정. DocumentPreset 은 TOC 까지 붙어서 4~5컬럼이 되면 중앙정렬 뷰포트 예산이 깨짐. 필요 생기면 후속 intent.
- **SSG (`ssgStyles.ts`) 의 3레일 지원** — SPA 먼저 완결 후 SSG 패리티 작업으로 이관.
- **`_meta.json` 에 `display`/`layout` 같은 레일 힌트 필드** — 폴더 깊이만으로 판단. 힌트 도입은 "깊이 해석이 틀어지는 실제 케이스" 가 발견된 뒤 재논의.
- **4단 이상 계층 (Stripe 식 Product > Section > Topic > Page)** — 현재 범위 밖. 3단이면 bootpay-docs 충분히 커버. L3 내부에서 깊이 1단 접힘은 허용 (데이터는 N단).
- **L1 트랙을 상시 확장형 (200px 라벨 항상 노출)** — 가로 예산 2092px 요구로 비현실적. icon-first 로 고정.
- **페이월/권한 기반 레일 숨김** — 네비 레이아웃 범위 밖. 별도 intent.
- **AdminLayout 3레일 지원** — 해당 레이아웃은 구조상 3레일 불필요.

## Footprint

- core/packages/cli/src/scanner/index.ts — `generateSidebar` 의 서브폴더 단일 레벨 처리를 재귀 `buildFolderItems` 로 교체. `FolderTree` 내부 인터페이스 + `folderTreeToNavItem/SidebarGroup` 헬퍼 추가. 각 depth 의 `_meta.json` label/order/collapsed/badge 가 `NavigationItem` 으로 승계. `generateSidebar` 를 `export` 로 승격 (테스트 대상). (2026-04-20, iteration 1)
- core/packages/cli/src/scanner/scanner.test.ts — vitest 단위 테스트 신규. 4케이스: 2단 shape 불변 / 3단 재귀 트리 / `_meta.json` label / order 정렬. `fs.mkdtemp` 임시 디렉토리 기반. 73/73 green. (2026-04-20, iteration 1)
- core/packages/viewer/src/components/MainNav.tsx — `compact?: boolean` prop 추가. compact 시 라벨/뱃지/chevron 숨기고 icon(+label 첫 글자 fallback) + native `title` tooltip 으로 트랙 스위칭. non-compact 분기는 기존 동작 보존 (icon 은 `item.icon` 있을 때만 렌더). (2026-04-20, iteration 1)
- core/packages/viewer/src/components/MainNav.css — `.main-nav.compact` / `.main-nav-item.compact` 변형 스타일. 버튼 폭 56px, label flex:0, chevron/divider-label display:none. (2026-04-20, iteration 1)
- core/packages/viewer/src/layouts/PublicationPreset.tsx — `productRailPanel?: ReactNode`, `isThreePanel?: boolean` prop 추가. `showThreePanel` 이 body class / DOM 분기의 최우선 경로. 기존 two-panel / with-sidebar / mobile drawer 경로 불변. (2026-04-20, iteration 1)
- core/packages/viewer/src/layouts/PublicationPreset.css — `.pub-preset-body--three-panel` grid 4열 (72/180/220/1fr). ghost right-padding = `min(track+product+feature+3*gap, available)` 로 `main-inner margin:0 auto` 중앙정렬 유지. 1759/1439/1279 media query 3단계 graceful fallback. (2026-04-20, iteration 1)
- core/packages/types/src/config.ts — `NavigationConfig.mode` 유니언에 `'three-rail'` 추가. (2026-04-20, iteration 1)
- core/packages/types/src/workspace.ts — `Workspace.navigationMode` 유니언에 `'three-rail'` 추가. (2026-04-20, iteration 1)
- core/packages/viewer/src/stores/project.ts — `WorkspaceInfo.navigationMode` 유니언에 `'three-rail'` 추가. (2026-04-20, iteration 1)
- core/packages/viewer/src/layouts/UnifiedLayout.tsx — `isThreeRail` 계산 (config.navigation.mode 또는 workspace.navigationMode 기반), `containsLink` 재귀 헬퍼 + `findFirstLink` helper, `activeProductIndex` (pathname 매칭 기반 — custom slug 환경에서도 동작), `productRailItems` / `featureRailItems` useMemo. `PublicationPreset` 호출 분기에 3-rail 브랜치 추가 (기존 publication/document 경로 모두 is-three-rail=false 일 때만 작동). MainNav compact 모드로 L1 렌더, mobile drawer 에 3계층 수직 스택. (2026-04-20, iteration 1)

## Backlog

- [ ] L1 icon 세트 정의 (트랙마다 어떤 아이콘을 쓸지) — 현재 `MainNav` 에 `icon` 필드는 있지만 대부분 미채움
- [ ] L2 Product 활성 상태 URL 동기화 (새로고침 시 어떤 product 가 펼쳐져 있어야 하는지 — 현재는 URL path 기반 추론 예상)
- [ ] `docs/three-level-nav-requirement.md` 의 URL 정책 A안(`/payment/billing/key/issue`) 이 slug linter 의 `ascii-kebab` 정책과 호환되는지 확인
- [ ] bootpay-docs 폴더 재배치 (단건/빌링/구독 × 클라/서버/고급) — 별도 PR, 이 intent 완료 후

## Learnings

### 2026-04-20: iteration 1 구현 + Codex review 사이클

- **opt-in 전략 (config.navigation.mode === 'three-rail')** 이 맞았다. 기존 2레일 워크스페이스(blog/docs/course) 에 제로 임팩트. 워커 검증 · DB 스키마 · Onboarding 폼은 의도적으로 제외 — cloud 워크스페이스는 backlog. 로컬 `openhow serve` 의 bootpay-docs 같은 use case 만 먼저 지원.
- **Codex review 가 두 개 버그 발견** — Claude 만으로는 못 잡은 이슈들:
  1. **Scanner special-case 가 L2/L3 한 단씩 잘못 밀어넣음**: 원래 `directPages.length === 0 && subTrees.length === 1 && subTrees[0].hasNestedFolders` 일 때 `{ text: groupLabel, items: [folderTreeToNavItem(tree)] }` 로 래퍼를 감쌌음. 의도는 "single-product 에서도 section label 을 상단에 보여주기". 하지만 3-rail 모드에선 top-level groups = Product 리스트 라는 불변식을 깨뜨려서 L2 에 "Section" 한 개, L3 에 실제 Product 가 나타남. **해결**: special-case 블록 전체 삭제 + scanner.test.ts 의 expected shape 를 평탄화된 형태로 업데이트. Section label 은 어차피 MainNav 가 담당하므로 sidebar 에서 중복 제거.
  2. **activeProductKey 가 URL 2번째 세그먼트 slug 에 의존**: 처음엔 `location.pathname.split('/')[2]` 로 Product key 추론. 하지만 `frontmatter.slug` 가 폴더 구조와 다른 URL 을 만들 수 있음 (slug 는 URL 의 source of truth). 그러면 activeProductKey 가 null → 항상 groups[0] fallback 으로 첫 Product 의 feature rail 이 나옴. **해결**: `activeProductIndex` 로 교체, `containsLink` 재귀 헬퍼로 현재 pathname 과 매칭되는 link 를 가진 group 을 찾아 index 반환. URL slug 정책과 독립.
- **구조 오프바이원 버그는 review 없인 잡기 어려움**: 두 버그 모두 빌드·테스트는 통과했고 타입도 맞았음. "동작은 하지만 잘못된 데이터를 보여준다" 카테고리. Codex review 가 full diff 를 보고 scanner 출력과 viewer 소비 사이 계약을 역으로 추적했기 때문에 발견. 나 혼자 했으면 bootpay-docs 시각 확인 단계까지 가서야 발견했을 것.
- **cowork review 실행 위치 주의**: 처음 `$COWORK review` 를 outer repo(openhow) 에서 실행했더니 untracked 문서 하나만 보고 "no code changes" 라고 오판. `cd core && $COWORK review` 로 inner repo 에서 실행해야 정상 diff 인식. 모노레포 + nested git 구조의 함정.
- **ghost right-padding 수식의 우아함**: 3레일로 확장해도 `max(0.5rem, min(sum_of_rails, available))` 패턴이 그대로 일반화됨. 1439 breakpoint 에서 track 이 display:none 되면 grid-template-columns 도 3열로 바뀌고 padding 수식도 2레일 합으로 줄어듦 — 모든 게 CSS 변수 한 쌍(`--track-rail-width`, `--product-rail-width`, `--feature-rail-width`) + media query 로 제어됨. 별도 JS 상태 불필요.
- **Step 5 는 Step 4 에 자연스럽게 흡수**: 모바일 드로어 평탄화가 Step 4 에서 `mobileSidebarContent` 작성할 때 그대로 들어왔음. `[MainNav + productRailItems + featureRailItems]` 수직 스택 한 JSX 블록이면 충분.
- **MainNav compact 의 icon fallback 주의점**: Codex 가 처음에 `const iconFallback = item.icon || item.label.slice(0,1)` 을 무조건 렌더해서 **non-compact 모드에서도 icon 이 강제 표시되는 regression** 발생. compact === true 일 때만 fallback 쓰도록 분기 수정. 소소한 회귀지만 "기존 경로 완전 보존" 제약을 지키려면 필요.
- **`hasNestedFolders` 필드 죽은코드 잔존**: special-case 삭제 후 `FolderTree.hasNestedFolders` 는 read site 가 없음. 한 이터레이션 내에서 깔끔하게 지우려다 MUST NOT scope 초과를 피하기 위해 그대로 뒀음. 별도 청소 기회에 제거.
- **`publish.ts:1203` preexisting DTS 에러**: `isPaidWorkspace` 스코프 버그가 본 작업 시작 전부터 존재 (커밋 036ee53 이전). scanner 스텝에서 JS ESM 빌드는 통과, DTS 생성만 실패. 본 intent 범위 밖이라 건드리지 않음. 별도 backlog.

### 2026-04-20: 설계 대화 (seed → clarified)

- **`docs/three-level-nav-requirement.md` 는 스캐너 관점의 요구만 다뤘음**. "nav 3개면 공간 활용 UX" 는 거기선 미확정. 이 intent 에서 풀어야 할 핵심
- **"3단 nav" 의 중의성**: (1) 정보구조가 3계층인 데이터 모델, (2) 화면 레일이 3개인 UI. 요구 문서는 (1) 만, 이 intent 는 (2) 를 명시적으로 추가. "탭으로 돌릴까요?" 질문에 사용자가 "탭이면 nav 3개 아니지 않나" 로 반박 — 공간 문제를 UI 표면 압축으로 피해가지 말고 정면 돌파하라는 뜻. Option C (진짜 3레일) 확정
- **중앙정렬 제약이 설계 predicate**: 3레일을 쌩으로 200px×3 으로 두면 외장 모니터에서만 중앙정렬 성립 → 레일 폭 차등 + breakpoint fallback 으로 해결. "본문 중앙" 은 타협 불가 제약으로 사용자가 명시
- **L1 = MainNav 재활용 확정**: 기존 `MainNav.tsx` 가 이미 세로 레일로 뜨고 있음. 새 L1 컴포넌트 신설하지 말고 `compact` prop 하나 추가하는 최소 변경 경로. 구현 비용·회귀 리스크 최소
- **L2 동적 vs 정적 정답**: 활성 트랙의 children 만 보여주는 동적 모드가 정보밀도 낮고 직관적. 전체 평탄화는 트랙 수가 늘어나면 감당 불가. bootpay-docs 가 3~8 트랙 × 각 3~5 product 예상 → 동적이 맞음
- **Breakpoint 1280 에서 L1 → 헤더 탭**: 드롭다운 숨김은 "어디 있는지" 를 지워 탐색 비용 ↑. 가로 탭은 공간 먹지만 헤더는 원래 노출돼 있어 시각적 여유 있음
- **URL 정책 A안 (경로 그대로)**: 요구 문서에서 이미 권장. 계층이 URL 에 드러나야 공식 레퍼런스답다는 논리. 기존 scanner 가 이미 파일 경로 기반 slug 라서 기본 동작과 일치 — 추가 작업 불필요
- **렌더 파이프라인은 이미 N단 지원**: `Navigation.tsx:144-148` 재귀 컴포넌트, `buildNavigation.ts:90-102` 재귀 렌더, `NavigationItem.items: NavigationItem[]` 재귀 타입. 병목은 스캐너 하나. 요구 문서 분석이 정확
- **부모 intent 관계**: `core/unified-layout.md` iter 10 에서 레이아웃 셸 통일은 done. 이 intent 는 그 셸 위에 레일 레이어 추가. 같은 design space 이지만 Why 가 다름 ("스타일 일관성" vs "깊은 IA 지원") → 병렬 intent 로 분리
