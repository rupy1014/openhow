---
name: article-image-sidecar — iteration 2 learnings (frozen)
description: iter2 의 Learnings 스냅샷 — fade + `:::figure-tabs` + code review 정돈 교훈. iter3 시작 시 freeze.
frozen_at: 2026-04-22
---

# article-image-sidecar — iteration 2 Learnings (frozen)

### 2026-04-22: fade 는 CSS-only opacity + figure key 조합이면 충분 — 2-step raf 불필요
- **시도한 대안**: 초기 설계는 A → B 전환 시 "fade-out → content swap → fade-in" 2-step raf 체인. panel 에 `.figure-sidecar-panel--fading` 을 잠깐 걸고 다음 프레임에 state 교체.
- **실제 채택**: panel wrapper 에 `transition: opacity 160ms` + `--empty` 상태에 `opacity: 0`. figure 자체에는 `animation: figure-sidecar-fade-in 160ms ease-out` + `key={src}`. active ↔ active 전환은 figure 의 key 변경으로 새 노드 mount + fade-in animation, empty ↔ active 는 wrapper opacity transition. 양쪽이 겹쳐도 160ms 내라 사용자 인지상 문제 없음.
- **교훈**: crossfade 가 "기술적으로 더 정확" 해 보여도, 간단한 CSS-only 로 체감상 동등하면 그쪽이 정답. raf 체인은 React 18 batching 과 쉽게 꼬이므로 피할 수 있으면 피한다.

### 2026-04-22: `:::figure-tabs` 는 `:::response` 와 동일한 "heading + 단일 블록" 패턴으로 수렴
- **배경**: 탭 문법 후보로 (a) 속성 리스트 (`tab1_src=... tab2_src=...`), (b) `:::tab` 중첩 (현재 `:::` nesting 미지원으로 불가), (c) `### label + ![alt](src)` 쌍 반복 3가지.
- **선택**: (c). 이유: `:::response` 가 이미 `#### 라벨 + fenced code block` 패턴을 검증했고, 저자가 같은 mental model 로 즉시 이해 가능. 속성 리스트는 3 탭만 돼도 가독성 붕괴.
- **파서 구현 트릭**: heading token 을 `### → tab start` 로 해석하고 다음 paragraph 에서 `<img>` 하나만 추출해 `{label, src, caption}` 로 직렬화. heading 이 2개 미만이면 `containerExtension` fallback (기존 `:::response` 와 정확히 동일 라인).
- **교훈**: 새 컨테이너 문법을 만들 때 먼저 "기존 컨테이너 중 비슷한 게 있나?" 부터 확인. 저자 학습 비용이 가장 큰 저항선.

### 2026-04-22: ImageSidecar 는 single/tabs 를 공통 `tabs[]` state 로 통일하는 게 깔끔
- **접근**: 단일 `data-figure-src` 블록도 컴포넌트 내부에서 `tabs=[{label:'',src,caption}]` 로 정규화. 렌더 시 `tabs.length > 1` 일 때만 탭 버튼 row 를 표시.
- **이점**: 2개 렌더 경로 (single vs tabs) 로 분기하지 않고 단일 경로 유지. 조건부는 UI 레이어에만 (탭 버튼 보이기/숨기기).
- **교훈**: feature flag / 분기는 data 레이어까지 올라오면 경로 2배. data 정규화로 흡수하고 UI 에서만 분기하는 게 유지보수 우위.

### 2026-04-22: iter2 code review — SSG 셀렉터 specificity 재발 + 이중 breakpoint 드리프트
- **발견 1 — SSG fade-out 침묵 실패**: `ssgStyles.ts` 의 `.ssg-figure-sidecar.figure-sidecar-panel { opacity: 1 }` (0,2,0) 가 `.figure-sidecar-panel--empty { opacity: 0 }` (0,1,0) 를 이겨서 SSG 에서 empty 로 돌아갈 때 fade-out 이 동작 안 함. iter1 의 "combo 셀렉터 specificity" 교훈이 다른 파일(ssgStyles) 에서 재발. 해결: base 셀렉터를 `.figure-sidecar-panel` 로 낮춰 SPA 와 동일 (0,1,0) 로 맞춤 → 소스 순서만으로 `--empty` 가 이김.
- **발견 2 — breakpoint drift**: PublicationPreset.css 는 aside 를 `1679px` 에 숨기는데 `markdown.css` 인라인 fallback 은 `1439px` 에 켜짐 → **1440–1679px 구간에서 SPA 에만 이미지가 전혀 안 보임**. SSG ssgStyles 는 이미 1679 로 맞춰져 있어 SPA 만 드리프트. ImageSidecar.css 에도 중복된 `1439px` 패널 숨김 규칙이 있었는데, aside 가 이미 1679 에서 숨으므로 불필요했음.
- **교훈**: 같은 DOM 에 적용되는 CSS 가 2-4 파일에 분산될 때 (SPA markdown.css / ImageSidecar.css / SSG ssgStyles.ts / PublicationPreset.css), **같은 의미의 숫자 상수는 한 번만 나와야 한다**. 지금은 `1679` 를 4 곳에 수동 복제 — 향후 `--figure-sidecar-breakpoint: 1679px` 같은 공유 토큰으로 뽑아서 단일 소스화 필요 (Backlog).
- **교훈 2**: combo selector specificity 함정은 한 번 배워도 **파일이 다르면 다시 밟는다**. 리뷰 시 "opacity/display 같은 상호 배타 속성이 두 셀렉터에 있으면 specificity 계산" 을 체크리스트로.
