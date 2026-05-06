---
status: done
created: 2026-04-17
updated: 2026-04-17
iteration: 1
---

# paywalled-seo-v1 — 공개 유료 문서 SEO 유지 + 본문 유출 차단

## Why

openhow는 공개(public) 문서를 검색 자산으로 삼고 싶지만, 현재 구현은 공개 유료 문서가 SEO 대상이 되면서도 SSG HTML에 전체 본문이 포함될 수 있다. 이 상태는 검색 노출 전략과 유료 보호가 서로 충돌한다. **공개 유료 문서는 검색 가능해야 하지만, 검색엔진과 비구독자에게는 프리뷰만 노출되어야 한다.**

## What

- [validated] 공개 유료 문서의 SEO 허용 기준을 `public` 기준으로 유지하고, price/isPaid 때문에 noindex 되지 않게 유지한다.
- [validated] SSG HTML은 공개 유료 문서에 대해 전체 본문 대신 프리뷰 본문만 렌더링한다.
- [validated] 정적 JSON/API 응답도 공개 유료 문서에 대해 전체 본문 대신 프리뷰만 반환하고, `freeSections`가 없을 때도 전체 본문이 새지 않게 막는다.
- [validated] 뷰어 paywall UI는 서버가 이미 잘라서 준 프리뷰 문서에서도 일관되게 paywall overlay를 띄운다.
- [validated] 관련 회귀 테스트를 추가해 “SEO는 유지되지만 전체 본문은 노출되지 않음”을 검증한다.

## Not

- Google paywalled structured data / JSON-LD 추가
- snippet 세밀 제어(`data-nosnippet`, `max-snippet`) 정책
- 요금제/권한 모델 전체 재설계
- 비공개(team/private) 문서를 검색 노출 대상으로 변경

## Context

- 현재 SEO indexability/sitemap 기준은 `public` 문서 중심이라 공개 유료 문서도 검색 대상이 될 수 있다.
- 하지만 publish SSG HTML은 아직 전체 markdown를 렌더링하고 있고, 정적/동적 preview 로직도 `freeSections`가 비어 있으면 누출 가능성이 있다.
- 목표는 **공개 유료 = 검색 가능 + preview only**, **team/private = 검색 제외**의 일관된 모델이다.

## Footprint

- `core/packages/cli/src/ssg/paywall-preview.ts` — 공개 유료 문서 preview markdown 절단 헬퍼 추가
- `core/packages/cli/src/ssg/buildHtml.ts` — publish 경로에서 공개 유료 문서 HTML을 preview-only로 렌더링
- `core/packages/cli/src/commands/publish.ts` — paid `.free.json`을 항상 생성하고 preview helper 재사용
- `core/packages/viewer/src/pages/DocPage.tsx` — 서버가 이미 잘라서 준 preview 문서에도 paywall overlay 유지
- `core/packages/worker/src/lib/paywall-preview.ts` — worker preview 절단 헬퍼 추가
- `core/packages/worker/src/routes/documents.ts` — 비구독자 API 응답에서 전체 본문 대신 preview만 반환, `freeSections` 메타 동봉
- `core/packages/worker/src/lib/onboarding-templates.ts` — SEO가 필요한 유료 글은 `public + price/freeSections`로 운영하도록 안내 문구 수정
- `core/packages/cli/src/ssg/paywall-preview.test.ts` / `buildHtml.test.ts` / `core/packages/worker/src/lib/paywall-preview.test.ts` — 회귀 테스트 추가

## Learnings

- 구현 전 상태: 공개 유료 문서의 SEO 의도는 이미 있었지만, SSG/preview 레이어가 완전히 따라오지 못해 본문 유출 리스크가 존재했다.
- H2 기준 preview 절단이 현재 viewer의 paywall section 분할(`splitByH2`)과 가장 일관됐다. H1을 section으로 세면 블로그 모드에서 preview가 비어 보이는 문제가 생겼다.
