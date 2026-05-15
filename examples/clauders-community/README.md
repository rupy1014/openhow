# clauders-community (community 워크스페이스 예제)

`type: community` 워크스페이스 sample. clauders.ai 가입자가 자기 워크플로우·삽질·실험을 직접 공유하는 가입자 1급 시민 결.

## 자산 위치

- `openhow.json` — community type, customDomain (`community.clauders.ai`), 즉시공개 + 사후 모더레이션, anti-spam baseline
- `docs/index.md` — 랜딩 (글쓰는 법 / 규약 / 최근 글)
- `docs/posts/` — 가입자 4명이 각 1편 작성한 샘플 글
- `docs/_meta.json` — nav

## 이 예제로 검증하려는 것

1. `WorkspaceType` enum 에 `community` 가 추가되면 publish 가 통과하는가
2. 가입자 (`viewer` role) 가 글을 publish 할 수 있는가 (`canCreateCommunityPost` 분기)
3. 가입자 글이 `/c/clauders-community/posts/{slug}` 로 즉시 공개되는가
4. sitemap.xml 에 글 4편이 다 들어가는가
5. customDomain (`community.clauders.ai`) 으로 라우팅이 붙는가

## 의도

`.omj/community-workspace-type-v1/` — INTENT.md + plan-iter-1.md.
