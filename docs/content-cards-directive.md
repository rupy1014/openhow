# :::content-cards 디렉티브 구현

## 의도

블로그 글 하단의 "추천 콘텐츠" 섹션을 **썸네일 카드 형태**로 렌더링한다.
현재는 blockquote + 텍스트 링크지만, 기획자 대상 블로그 특성상 시각적 카드가 탐색 UX에 더 맞다.

### 현재 (텍스트 링크)

```markdown
### 추천 콘텐츠

> **`PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법` *(미작성 — 2026-08-27 확인)***
> 심사에서 막히는 화면·문구·준비물을 먼저 정리한다.
```

### 목표 (썸네일 카드)

```markdown
### 추천 콘텐츠

:::content-cards
- pg-review-preparation
- payment-ui-selection
:::
```

이것만 쓰면, 해당 문서의 frontmatter에서 `title`, `thumbnail`, `description`을 자동으로 읽어 카드로 렌더링한다.

---

## 마크다운 문법

```markdown
:::content-cards
- {slug}
- {slug}
- {slug}
:::
```

- slug는 같은 워크스페이스 내 문서의 상대 경로 (확장자 없이)
- 다른 카테고리 문서도 가능: `getting-started/payment-methods`
- 카드 수는 2~3개 권한

---

## 카드에 표시할 정보

각 slug 문서의 **frontmatter**에서 자동 추출한다. 추가 입력 불필요.

| 필드 | 출처 | 예시 |
|------|------|------|
| 썸네일 | `thumbnail` | `/__content__/images/taesup4gi_img-129_shield.png` |
| 제목 | `title` | `PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법` |
| 설명 | `description` | `심사 반려 패턴 5가지와 한 번에 통과하는 준비 순서` |
| 링크 | slug에서 생성 | 현재 워크스페이스 기준 상대 URL |

### frontmatter 예시 (이미 모든 글에 존재)

```yaml
---
title: "PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법"
thumbnail: /__content__/images/taesup4gi_img-129_shield.png
description: "심사 반려 패턴 5가지와 한 번에 통과하는 준비 순서"
---
```

---

## 렌더링 결과 (HTML 구조)

```html
<div class="content-cards">
  <a class="content-card" href="/blog/bootpay/getting-started/pg-review-preparation">
    <div class="content-card__thumbnail">
      <img src="/__content__/images/taesup4gi_img-129_shield.png"
           alt="PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법" />
    </div>
    <div class="content-card__body">
      <h4 class="content-card__title">PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법</h4>
      <p class="content-card__desc">심사 반려 패턴 5가지와 한 번에 통과하는 준비 순서</p>
    </div>
  </a>
  <!-- 반복 -->
</div>
```

---

## 레이아웃

```
┌──────────────────────────────────────────────┐
│ ### 추천 콘텐츠                                │
│                                              │
│ ┌─────────────────┐  ┌─────────────────┐     │
│ │  [thumbnail]    │  │  [thumbnail]    │     │
│ │                 │  │                 │     │
│ ├─────────────────┤  ├─────────────────┤     │
│ │ 제목 (2줄 제한)  │  │ 제목 (2줄 제한)  │     │
│ │ 설명 (1줄)      │  │ 설명 (1줄)      │     │
│ └─────────────────┘  └─────────────────┘     │
└──────────────────────────────────────────────┘
```

- 데스크톱: 2~3열 가로 배치
- 모바일: 1열 세로 스택 또는 가로 스크롤
- 썸네일 비율: 16:10 (기존 Midjourney 이미지 비율과 동일)
- 제목: 최대 2줄, 초과 시 말줄임
- 설명: 최대 1줄, 초과 시 말줄임

---

## 스타일 가이드

- 카드 배경: 밝은 회색 (`#f8f9fa`) / 다크모드 대응
- border-radius: 12px (부트페이 블로그 톤에 맞게 부드럽게)
- 호버: 약간의 lift shadow + 썸네일 미세 확대 (scale 1.02)
- 제목 폰트: 본문보다 약간 굵게 (semibold)
- 설명 폰트: muted color, 본문 사이즈
- 카드 간 간격: 16px

---

## 구현 위치 (참고)

`:::canvas-flow` 디렉티브가 이미 구현되어 있으므로 같은 패턴을 따르면 된다.

1. **파서**: `:::content-cards` 블록을 파싱하여 slug 리스트 추출
2. **데이터 로딩**: 각 slug의 frontmatter를 조회 (워크스페이스 문서 메타데이터에서)
3. **컴포넌트**: `ContentCards` React 컴포넌트로 렌더링

기존 `:::canvas-flow` 등록 방식과 동일하게 디렉티브를 추가 등록하면 된다.

---

## 적용 범위

- blog.bootpay.ai 전체 32편의 `### 추천 콘텐츠` 섹션
- 향후 다른 `type: "blog"` 워크스페이스에서도 동일하게 사용 가능
- `### 바로 참고할 문서` (외부 링크)는 기존 텍스트 형태 유지 — 카드 대상 아님

---

## 마크다운 변경 예시 (before → after)

**Before:**
```markdown
### 추천 콘텐츠

> **`PG 심사에서 3번 반려당한 팀이 2주 만에 통과한 방법` *(미작성 — 2026-08-27 확인)***
> 심사에서 막히는 화면·문구·준비물을 먼저 정리한다.

> **`결제 화면 3가지 방식, 우리 팀에 맞는 건 이거다` *(미작성 — 2026-08-27 확인)***
> 직접 구현, 기본 제공 화면, 링크 결제 중 어떤 방식이 맞는지 결정한다.
```

**After:**
```markdown
:::content-cards
- pg-review-preparation
- payment-ui-selection
:::
```

제목, 설명, 썸네일은 해당 문서의 frontmatter에서 자동으로 가져오므로 중복 작성이 사라진다. 제목이 바뀌어도 카드가 자동으로 반영된다.
