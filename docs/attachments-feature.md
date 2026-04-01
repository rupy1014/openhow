# Attachments 기능 — 문서 타이틀 영역 다운로드 버튼

## 요약

문서에 첨부파일(HTML 데크, PPTX 등)이 있으면 `doc-title-actions` 영역에 다운로드 아이콘을 자동 표시한다.
마크다운 frontmatter의 `attachments` 배열을 읽어서 조건부 렌더링한다.

## 동기

bootpay 채널 가이드 문서에 발표용 HTML 데크를 생성하는 `/ppt` 워크플로우를 만들었다.
문서 본문 하단에 마크다운 링크로 다운로드를 제공하고 있지만, 타이틀 영역 액션 버튼에도 배치하면 발견성이 높아진다.
기존 버튼(발표 모드, 마크다운 복사, 버전 히스토리)과 동일한 패턴으로 추가한다.

## Frontmatter 규격

```yaml
---
attachments:
  - label: "결제 기획 데크 (HTML)"
    href: "/shared/examples/payment-checkout-ux-deck.html"
  - label: "결제 기획 데크 (PPTX)"
    href: "/shared/examples/payment-checkout-ux-deck.pptx"
---
```

- `label`: 버튼 tooltip 텍스트
- `href`: 클릭 시 새 탭으로 열리는 경로 (content root 기준 상대 경로)
- 배열 — 여러 첨부 가능
- `attachments`가 없거나 빈 배열이면 버튼을 렌더링하지 않는다

## 수정 대상

### `core/packages/viewer/src/pages/DocPage.tsx`

#### 1. attachments useMemo 추가 (line 288 근처, `hasDocMeta` 아래)

```tsx
const attachments = useMemo(() => {
  if (!currentFrontmatter?.attachments) return []
  return Array.isArray(currentFrontmatter.attachments)
    ? currentFrontmatter.attachments
    : []
}, [currentFrontmatter])
```

#### 2. doc-title-actions에 다운로드 버튼 추가 (line 886, version-history 버튼 바로 앞)

```tsx
{attachments.length > 0 && attachments.map((att: any, i: number) => (
  <button
    key={i}
    className="copy-md-btn"
    title={att.label || 'Download'}
    onClick={() => window.open(att.href, '_blank')}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  </button>
))}
```

### CSS 변경: 없음

기존 `.copy-md-btn` 스타일(32×32, flex, hover/focus)을 그대로 재사용한다.

## 아이콘

Lucide `download` 패턴 — 아래 화살표 + 트레이:

```svg
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</svg>
```

## 기존 코드 참고 (현재 doc-title-actions 구조)

```
DocPage.tsx:858-895

<div className="doc-title-actions">
  {rawMarkdown && !isSlideRoute && (
    <button className="copy-md-btn" title="발표모드"> ... </button>
  )}
  {rawMarkdown && (
    <button className="copy-md-btn" title="마크다운 복사"> ... </button>
  )}
  {(currentDocument.updatedAt || isLocalMode) && (
    <button className="version-history-btn" title="Version history"> ... </button>
  )}
</div>
```

새 버튼은 version-history 바로 **앞**, 마크다운 복사 바로 **뒤**에 배치한다.

## 검증

1. frontmatter에 `attachments`가 있는 문서 → 다운로드 아이콘 표시
2. frontmatter에 `attachments`가 없는 문서 → 아이콘 없음
3. 버튼 클릭 → 새 탭에서 파일 열림
4. 여러 첨부 → 버튼 여러 개 표시
5. tooltip에 label 텍스트 표시
