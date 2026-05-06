# Stitch Storyboard — 참고용 HTML mockup

`creator-saas-storyboard` 의도 (iter 2) 로부터 Google Stitch (Gemini 3.1 Pro) 가 생성한 6 frame 의 고화질 HTML mockup. **참고용** — 디자인 시스템·정보 밀도·모듈 배치 reference 로 사용하고, 실제 코드는 프로젝트의 디자인 시스템에 맞춰 새로 작성한다.

- **Stitch Project**: https://stitch.withgoogle.com/projects/2344295347161582566
- **Design system**: "Openhow Core" — primary `#2563EB`, secondary `#4F46E5`, Pretendard/Inter, ROUND_FOUR (4px), 8pt grid, 글래스모피즘+미니멀
- **Stack (참고만)**: Tailwind CDN + Google Fonts. 실제 구현은 프로젝트의 디자인 토큰/Tailwind config 사용.

## Frame ↔ 파일 매핑

| # | Frame | 파일 | Screen ID | h |
| - | ----- | ---- | --------- | - |
| 1 | openhow.io 랜딩 | [frame-1-landing.html](frame-1-landing.html) | `b7a1301c2bc04c59bf67c6b6563dfb5e` | 7304 |
| 2 | openhow.io Pricing (단일 수수료) | [frame-2-pricing.html](frame-2-pricing.html) | `40a89e387baa4ab78ea0e3d4c8178be1` | 4580 |
| 3 | 드림스쿨 크리에이터 스토어 | [frame-3-creator-store.html](frame-3-creator-store.html) | `40583010bf4d44d2957ea7ac54f5a6e1` | 2066 |
| 4 | 강의 상세 (5단계 코어 공부법) | [frame-4-course-detail.html](frame-4-course-detail.html) | `f7d6f94cdc8d4503ab2cc6da65faf295` | 4518 |
| 5 | 강의 수강 (2강. 회독의 본질) | [frame-5-lesson-player.html](frame-5-lesson-player.html) | `13836b4c293644cfb3553965a3bec0d1` | 2048 |
| 6 | 워크스페이스 커뮤니티 게시판 | [frame-6-community.html](frame-6-community.html) | `a9387e48531846e29bda87b818a7ecf0` | 2086 |

## 활용 가이드

1. **로컬에서 열기**: `open frame-N-*.html` — 브라우저에서 그대로 렌더링
2. **모듈 추출**: 각 frame 의 LessonCard, StickyPurchaseBar, PostListCard 등을 의도별 build target 의 reference 로 첨부
3. **디자인 토큰 합의**: Stitch 가 제안한 톤 (#2563EB, Pretendard, ROUND_FOUR) 을 프로젝트 Tailwind config 에 매핑
4. **build 시 주의**: 이 HTML 은 실제 라우트/데이터/컴포넌트 구조와 무관. 프로젝트의 SSG/SPA 패턴 + Cloudflare Workers + 실제 design system 으로 재구성

## 의도 연결

- 부모 의도: [`.omj/creator-saas-storyboard.md`](../../.omj/creator-saas-storyboard.md)
- 자식 build 의도 (예정): `lesson-card-system-v1`, `creator-store-redesign-v1`, `course-landing-redesign-v1`, `community-board-polish-v1`, `lesson-player-v2`, `public-home-creator-saas-pivot`
