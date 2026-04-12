# Blog 타입에 two-menu(계층 네비게이션) 추가 요구사항

## 배경

`bootpay-developer` 워크스페이스는 API 레퍼런스·가이드 문서 115페이지를 가진 개발자 문서다. 현재 두 선택지가 있다.

| | `type: docs` + `two-panel` | `type: blog` |
|---|---|---|
| 장점 | 계층 사이드바 + TOC 구조 | 카드/썸네일 등 **시각적 완성도 높음** |
| 단점 | 레이아웃이 밋밋함, 커버 이미지 활용 안 됨 | 계층 네비가 없어 115페이지 탐색 불가 |

**실제로 써보니 `blog` 쪽 완성도가 훨씬 높다.** 카드·썸네일·전체 느낌이 정돈되어 있다. 반면 `docs`는 기능은 필요한데 시각적으로 단조롭다.

## 요구사항

**`type: blog` 의 시각적 완성도는 유지하면서**, 구조적으로 `docs` 처럼 **계층 네비게이션(two-menu)** 을 쓸 수 있어야 한다.

### two-menu 가 뭔가

- **1차 메뉴**: 상단 가로 탭 또는 좌측 섹션 (예: 시작하기 / 일반결제 / 정기결제 / 커머스 / 구독 / 웹훅 / 레시피 / 레퍼런스)
- **2차 메뉴**: 선택된 1차 섹션 하위의 글 목록 (좌측 사이드바 또는 카드 그리드)
- `_meta.json` 의 `nav` 배열 + 각 폴더의 `items` 구조를 그대로 활용

현재 `bootpay-developer/docs/_meta.json` 에 이미 `nav` 배열과 `divider` 기반 섹션 구분이 들어 있다. 이 구조를 blog 레이아웃에서 읽어서 렌더링할 수 있게 해달라.

### 동작 시나리오

1. 사용자가 `https://developer.bootpay.ai/` 접속
2. **상단 탭** (또는 상단 영역에 가로로) 섹션 메뉴 노출: `시작하기 | 결제 | 커머스 | 실전·참고`
3. 초기 화면: 첫 섹션(시작하기)의 **카드 리스트** — 각 글의 커버 이미지, 제목, 요약
4. 섹션 탭 클릭 시 → 해당 섹션 글들의 카드 리스트로 전환
5. 글 카드 클릭 → 기존 blog 상세 페이지 (발행일, 이전/다음 글 네비 포함)
6. **글 상세 페이지에서도** 1차 섹션 탭은 유지되고, 좌측에 해당 섹션 글 목록이 사이드바로 붙는다 (선택된 글 하이라이트)

### 참고 레퍼런스

- **Stripe docs**: 상단 제품 탭(Payments/Connect/Billing/...) + 좌측 계층 사이드바 + 본문 + 우측 TOC
- **Cloudflare docs**: 상단 섹션 탭 + 좌측 사이드바
- **Supabase docs**: 좌측 2단 네비 (섹션 → 하위 문서)

시각은 Stripe / Supabase 수준, 구조는 현재 bootpay 블로그의 카드 완성도를 유지.

## 구체 제안 — `navigation.mode: "two-menu"` 추가

기존 `type: docs` 의 `navigation.mode: "two-panel"` 처럼, **`type: blog` 에 `navigation.mode: "two-menu"`** 옵션을 추가하는 방식 제안.

```json
{
  "type": "blog",
  "navigation": {
    "mode": "two-menu"
  }
}
```

- `navigation.mode` 생략 시 → 현재 blog 카드 리스트 그대로 (기본값, 하위 호환)
- `navigation.mode: "two-menu"` 지정 시 → `_meta.json` nav 배열 기반으로 상단 탭 + 좌측 섹션 리스트 노출
- 글 카드 grid / 상세 페이지 스타일은 blog 레이아웃 재사용

## 영향 범위 (예상)

| 파일 | 변경 |
|------|------|
| `packages/viewer/src/layouts/BlogLayout.tsx` | two-menu 모드 분기 추가 |
| `packages/viewer/src/components/` | 상단 섹션 탭 컴포넌트, 좌측 섹션 사이드바 컴포넌트 신규 |
| `packages/viewer/src/pages/workspace/WorkspaceDocs.tsx` | blog + two-menu 일 때 섹션별 카드 리스트 필터 |
| `packages/viewer/src/stores/project.ts` | `_meta.json` nav 구조 파싱 재사용 |
| `packages/types` | `NavigationMode` 타입에 `"two-menu"` 추가 |
| `docs/configuration.md`, `docs/workspace-types.md` | 문서 업데이트 |

## 실제 적용 대상

- 워크스페이스: `channels/bootpay-developer`
- 페이지 수: 115개 (guide 5 / payment 22 / billing 11 / commerce 34 / subscription 21 / recipes 6 / webhook 2 / integration 8 / architecture 4 / reference 2)
- 섹션 구조: `docs/_meta.json` 의 `nav` 배열 참고 (시작하기 / 결제 / 커머스 / 실전·참고 divider 구분)
- 배포 목표 URL: `https://developer.bootpay.ai`
- 커버 이미지: `docs/images/covers/` (생성 예정, 36개 프롬프트 `docs/images/midjourney-prompts.md` 참조)

## 우선순위

높음. bootpay-developer 배포의 전제 조건이다. 현재는 `type: docs` 로 띄우면 계층 네비는 되지만 시각적으로 단조롭고, `type: blog` 로 띄우면 115페이지가 한 번에 쏟아져서 탐색이 안 된다. 두 모드의 장점을 합친 `two-menu` 가 필요하다.
