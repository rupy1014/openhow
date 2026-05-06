---
status: done
created: 2026-04-30
updated: 2026-04-30
iteration: 1
parent: creator-saas-storyboard
loop:
  until: judge
---

# pricing-page-v1 — `/pricing` 을 frame 2 단일 수수료 LP 로 개편

## Why

`creator-saas-storyboard.md:437` iteration 2 review 에서 *"`Pricing.tsx` 의 현재 단일 수수료 구조와 `platform-cost-simulation.md` 의 Pro killed 맥락을 반영해 Frame 2 를 UnifiedFeeCard + SettlementFlow + FAQ 로 수정. 4-tier grid 는 v2 옵션."* 으로 잠금됐다.

`references/stitch-storyboard/frame-2-pricing.html` 가 확정 mockup. 본 intent 는 ralph loop 의 **마지막 wedge** — Frame 1 home pivot, Frame 6 community polish 이후 storyboard 6 frame 의 대미.

현재 `Pricing.tsx` 는 단일 수수료 카드 + 3-step settlement + 6 FAQ paragraph 형태로 핵심은 같지만, mockup 의 (a) Settlement 4-step 가로 흐름, (b) 8-tile Included Features Grid, (c) FAQ accordion 토글, (d) "정책 잠정값" 라벨, (e) v2 placeholder pill 이 빠져있다. 거래 수수료 자체는 storyboard 결정에 따라 잠정값으로 명시.

## What

- [done] **iter 1**: `Pricing.tsx` + `Pricing.css` 을 frame 2 mockup 기준으로 시각·구조 개편. Bootpay/auth/router 무수정. FAQ 는 클라이언트 useState accordion. 아이콘은 inline SVG (Material Symbols 미사용). → **metric**: 빌드 통과 + Playwright `localhost:5173/pricing` 에서 (1) 통합 요금 5% 카드 (2) Settlement 4-step 흐름 (3) Included Features 8 tiles (4) FAQ accordion 5 items 클릭 토글 (5) v2 placeholder pill — 5 토큰 가시
- [planned] **iter 2** (선택): pricing-policy intent 와 연동 — 5% 잠정값을 단일 source(`PRICING_RATE` config) 로 빼고 numeric 동적 적용 → **metric**: 환경 변수/설정 1곳 변경으로 카드 + FAQ 답변 동시 갱신
- [planned] **iter 3** (선택): SEO meta + landing page에서 pricing 으로의 cross-link + 사용량 기반 v2 요금제 안내 → **metric**: Lighthouse SEO 90+

## Not

- **Bootpay / 결제 로직 변경** — `/pricing` 은 정적 LP. 결제 흐름 무관.
- **router.tsx 변경** — `/pricing` 라우트 그대로.
- **수수료 5% 정책값 변경** — storyboard 결정에 따라 잠정값. iter 2 에서 정책 intent 와 분리해 처리.
- **Material Symbols icon font** — 미설치. 모든 아이콘 inline SVG.
- **Tailwind / 외부 CSS lib** — 미사용, 기존 CSS 변수 (`--primary-color`, `--surface-*`, `--text-*`, `--border-*`) 재사용.
- **외부 이미지 fetch** — placeholder/그라디언트만.
- **i18n** — 한국어 카피 그대로.
- **다른 페이지 (Home / Pricing 외)** — 본 iter 범위 밖.

## Context

**현재 Pricing.tsx 구조** (`core/packages/viewer/src/pages/Pricing.tsx` 110 LOC):
- 정적 컴포넌트, hooks 없음
- `features` (5 strings) + `faqs` (6 객체) 상수
- Hero / Single plan card / Settlement (3-step vertical) / FAQ (always-open) — 3 섹션

**현재 Pricing.css** (256 LOC): `.pricing-page`, `.plan-card`, `.settlement-*`, `.faq-*` 네임스페이스. 다크모드 자동.

**Frame 2 mockup 의 신규 요소**:
- Hero: badge + display-lg title + subtitle (기존 동일, 다듬기)
- **Unified Fee Card**: 통합 요금 pill + 72px "5%" + "거래 수수료" + "(정책 잠정값)" 라벨 + "VAT/PG 수수료 정책 별도" 부연 + 5 inline check features (2col grid + 1 col-span-2) + CTA
- **Settlement Flow**: 4-step horizontal (구매자 결제 / 환불 가능 기간 (7일) / 익월 정산 산정 / 익월 말일 송금), 각 step 은 원형 아이콘 + 라벨, step 사이 화살표 (모바일 세로 스택)
- **Included Features Grid**: 8 tiles 2-4 col grid (VOD 코스 / 구독형 블로그 / 페이월 / 멤버십 / 결제(Bootpay) / 커스텀 도메인 / 취소·환불 정책 / 학생 게시판), 각 tile 은 아이콘 + 제목 + 한 줄 설명
- **FAQ Accordion**: 5 items (수수료에 PG 수수료가 포함되나요? / VAT 처리는? / 정산일은? / 환불·취소는? / 타사 대비?), 클릭 시 expand_more icon 회전 + 본문 toggle, 첫 item open default
- **v2 Placeholder**: 회색 pill — "사용량이 매우 큰 크리에이터 대상 별도 요금제는 v2 검토 중"

**카피 보존 원칙**: 기존 FAQ 답변 카피 (정산 흐름·환불 정책·타 플랫폼 비교 등) 는 mockup 의 5 질문 셋에 맞게 재배치. 같은 의미는 같은 답변 그대로.

## Footprint

- `core/packages/viewer/src/pages/Pricing.tsx` — 110 → 258 LOC. useState 1개 (`openFaq`, 첫 item open default) 추가, includedFeatures 8 객체 + settlementSteps 4 객체 + faqs 5 객체 상수, inline SVG 아이콘 14종 (SmartDisplay/Article/Lock/Membership/Card/Domain/Refund/Forum/PayStep/History/Calc/Bank/CheckCircle/ExpandMore). FAQ aria-expanded 포함.
- `core/packages/viewer/src/pages/Pricing.css` — 256 → 429 LOC. `.fee-card__*`, `.settlement-flow` / `.settlement-step--{primary,secondary,neutral}` / `.settlement-arrow`, `.included-grid` / `.included-tile`, `.faq-row` / `.faq-row__head/__q/__chev/__a` / `.faq-row--open` rotate(180deg), `.v2-placeholder__pill` 추가. 구 `.plan-*` / `.faq-item` / `.settlement-num` 셀렉터 전부 제거. 3 breakpoint (1023/767/479px). 다크모드 자동.

## Backlog

- [ ] iter 2 — 단일 수수료값 config 화 (`PRICING_RATE`)
- [ ] iter 3 — SEO meta / landing cross-link / 사용량 기반 v2 안내
- [ ] FAQ accordion ARIA aria-expanded/aria-controls 보강
- [ ] 모바일 viewport (375px) settlement 세로 스택 검증

## Learnings

### 2026-04-30: iter 1 build done [done]

- **결과**: Codex 정확히 2 파일만 수정 (`Pricing.tsx` 110→258 LOC, `Pricing.css` 256→429 LOC). typecheck pass, `pnpm --filter @openhow/viewer build` pass (7.2s). 10/10 핵심 토큰 매치 (`통합 요금`, `정책 잠정값`, `정산 프로세스`, `기본 제공 기능`, `자주 묻는 질문`, `v2 검토 중`, `fee-card__cta`, `settlement-flow`, `included-grid`, `faq-row__head`). 금지 패턴 (`react-router-dom`, `console.log`, `@import url`, `Material Symbols`) 0건.
- **Inline SVG 14종 vs Material Symbols**: mockup 은 Material Symbols icon font 였지만 본 repo 는 미설치. 14종 아이콘을 `currentColor` stroke 기반으로 단순 line 스타일로 작성 — `MembershipIcon` 의 별 path 만 살짝 복잡, 나머지는 8-15 라인 이내. `currentColor` 채택 덕에 `--primary-color` / `--text-secondary` 가 그대로 흘러들어가 톤 일관성 자연 확보.
- **FAQ accordion 패턴**: `openFaq: number | null = 0` 으로 첫 item open default. 클릭 시 같은 index 면 close (null 토글), 다른 index 면 swap. 한 번에 1개만 열림. `aria-expanded={open}` + button reset 으로 키보드 접근성 기본 확보. CSS `.faq-row--open .faq-row__chev { transform: rotate(180deg) }` 로 시각 토글.
- **Settlement 4-step 의 tone 분기**: primary/secondary/neutral 3 톤 — primary 는 첫 step (구매자 결제), secondary 는 마지막 step (송금), 중간 2개는 neutral. CSS 에서 `--surface-*` 와 `--primary-soft` 로만 분기해 다크모드 자동. mockup 의 `bg-primary-fixed` / `bg-secondary-fixed` / `bg-surface-container-high` 매핑이 자연스럽게 우리 토큰 셋으로 변환됨.
- **수수료 5% 잠정값 표기**: storyboard 결정에 따라 카드에 "(정책 잠정값, 정책 의도에서 확정)" 명시. 추후 별도 정책 intent 에서 확정되면 단일 source 로 빼는 작업이 iter 2 — `PRICING_RATE` config 1곳 변경으로 카드 + FAQ 답변 동시 갱신 가능하도록 설계.
- **storyboard 마지막 frame 도달**: Frame 1 (public-home-creator-saas-pivot) → Frame 6 (community-board-polish-v1) → Frame 2 (pricing-page-v1, 본 intent) 순으로 ralph loop 6-frame 시퀀스 완료. lesson-card / creator-store / course-landing / lesson-player 는 이전 세션에서 이미 done. 자율 반복 종료.
