# Blog Layout 구현 스펙

## 배경

openhow에 `type: "blog"` 워크스페이스가 있지만, 실제 렌더링은 docs와 동일한 사이드바+본문 레이아웃을 사용한다. blog.bootpay.ai 같은 블로그 워크스페이스가 블로그답게 보이려면 전용 레이아웃이 필요하다.

## 현재 상태

| 요소 | 현재 |
|------|------|
| 워크스페이스 타입 | `docs`, `course`, `team`, `blog`, `wiki`, `project`, `book` — 7개 |
| 레이아웃 | `MainLayout`, `BookLayout`, `AdminLayout` — 3개 |
| blog 프리셋 | `navigationMode: 'sidebar'`, theme: red — **docs와 동일 레이아웃** |
| WorkspaceDocs | type=blog여도 첫 문서로 자동 리다이렉트 → 글 목록을 볼 수 없음 |

## 목표

`type: "blog"` 워크스페이스 접속 시:
1. **글 목록 페이지**: 사이드바 없이, 카드형 리스트 (제목 + 날짜 + 한줄요약)
2. **글 상세 페이지**: 블로그 포스트 느낌 (발행일, 이전/다음 글 네비)
3. 기존 docs/course/team 등의 동작은 변경 없음

---

## 변경 대상 파일

### 1. 신규: `packages/viewer/src/layouts/BlogLayout.tsx`

MainLayout을 간소화한 블로그 전용 레이아웃.

```tsx
import { Outlet, Link, useParams } from 'react-router'
import { useProjectStore } from '../stores/project'
import { useThemeStore } from '../stores/theme'
import './BlogLayout.css'

export default function BlogLayout() {
  const { workspace: paramSlug = '' } = useParams()
  const customWorkspace = useProjectStore((s) => s.customWorkspace)
  const workspaceSlug = paramSlug || customWorkspace || ''
  const workspace = useProjectStore((s) => s.workspace)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <div className={`blog-layout ${isDark ? 'dark' : ''}`}>
      <header className="blog-header">
        <div className="blog-header-inner">
          <Link to={`/w/${workspaceSlug}`} className="blog-title">
            {workspace?.name || workspaceSlug}
          </Link>
          <div className="blog-header-actions">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>
      <main className="blog-main">
        <Outlet />
      </main>
      <footer className="blog-footer">
        <p>Powered by <a href="https://openhow.io" target="_blank" rel="noopener">openhow</a></p>
      </footer>
    </div>
  )
}
```

**핵심**: 사이드바 없음. 심플한 헤더(블로그명) + 본문 + 푸터.

### 2. 신규: `packages/viewer/src/layouts/BlogLayout.css`

```css
.blog-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-color);
}

.blog-header {
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.blog-header-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.blog-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-color);
  text-decoration: none;
}

.blog-header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.blog-main {
  flex: 1;
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.blog-footer {
  border-top: 1px solid var(--border-color);
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.blog-footer a {
  color: var(--text-secondary);
  text-decoration: underline;
}

/* ─── 글 목록 (카드 리스트) ─── */

.blog-post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.blog-post-card {
  display: block;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  text-decoration: none;
  color: inherit;
  transition: opacity 0.15s;
}

.blog-post-card:first-child {
  padding-top: 0;
}

.blog-post-card:hover {
  opacity: 0.7;
}

.blog-post-date {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.blog-post-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 0.4rem;
  line-height: 1.4;
}

.blog-post-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.blog-post-tags {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.blog-tag {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  background: var(--surface-elevated);
  color: var(--text-secondary);
}

/* ─── 글 상세 하단 네비 ─── */

.blog-post-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
  gap: 1rem;
}

.blog-post-nav a {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color 0.15s;
}

.blog-post-nav a:hover {
  color: var(--text-color);
}

.blog-post-nav .next {
  text-align: right;
  margin-left: auto;
}

@media (max-width: 640px) {
  .blog-main {
    padding: 1.5rem 1rem;
  }
  .blog-post-title {
    font-size: 1.15rem;
  }
}
```

### 3. 수정: `packages/viewer/src/router.tsx`

BlogLayout 임포트 추가 + blog 워크스페이스용 라우트 블록 추가.

**변경 1** — 상단 lazy import에 추가:

```tsx
const BlogLayout = lazy(() => import('./layouts/BlogLayout'))
```

**변경 2** — routes 배열에서 BookLayout 블록 뒤에 추가:

```tsx
// Blog layout (no sidebar, card list)
{
  path: '/blog/:workspace',
  element: <SuspenseWrapper><BlogLayout /></SuspenseWrapper>,
  children: [
    { index: true, element: <SuspenseWrapper><WorkspaceDocs /></SuspenseWrapper> },
    { path: '*', element: <SuspenseWrapper><DocPage /></SuspenseWrapper> },
  ],
},
```

**참고**: `/blog/:workspace` 경로를 새로 만든다. 기존 `/w/:workspace`와 `/d/:workspace/*` 경로는 그대로 유지. BlogLayout이 별도 경로를 갖는 구조 (BookLayout이 `/read/:workspace`인 것과 동일 패턴).

### 4. 수정: `packages/viewer/src/pages/workspace/WorkspaceDocs.tsx`

**변경 1** — useEffect 리다이렉트 로직에 blog 분기 추가:

현재 코드 (lines 117-133):
```tsx
useEffect(() => {
  if (loading || !workspace) return
  if (isLearningWorkspace) { loadCourses(); return }
  if (workspace.type === 'book' && documents.length > 0) {
    navigate(`/read/${workspaceSlug}/${documents[0].slug}`, { replace: true })
    return
  }
  if (documents.length > 0) {
    navigate(`/d/${workspaceSlug}/${documents[0].slug}`, { replace: true })
  }
}, [...])
```

수정 후:
```tsx
useEffect(() => {
  if (loading || !workspace) return
  if (isLearningWorkspace) { loadCourses(); return }
  if (workspace.type === 'book' && documents.length > 0) {
    navigate(`/read/${workspaceSlug}/${documents[0].slug}`, { replace: true })
    return
  }
  // blog 타입: 리다이렉트하지 않음 — 카드 목록을 직접 렌더
  if (workspace.type === 'blog') {
    return
  }
  if (documents.length > 0) {
    navigate(`/d/${workspaceSlug}/${documents[0].slug}`, { replace: true })
  }
}, [...])
```

**변경 2** — return문(line 241~)에서 blog 카드 목록 렌더 추가:

기존 `return` 블록의 `{loading ? (` 앞에 blog 분기를 추가:

```tsx
// Blog post list view
const isBlog = workspace?.type === 'blog'

if (!loading && isBlog && documents.length > 0) {
  // 날짜 내림차순 정렬
  const sorted = [...documents].sort((a, b) =>
    new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
  )

  // blog 경로인지 확인 (/blog/:workspace vs /w/:workspace)
  const isBlogRoute = location.pathname.startsWith('/blog/')
  const docBase = isBlogRoute ? `/blog/${workspaceSlug}` : `/d/${workspaceSlug}`

  return (
    <div className="blog-post-list-container">
      {workspace?.description && (
        <p className="blog-description">{workspace.description}</p>
      )}
      <ul className="blog-post-list">
        {sorted.map((doc) => {
          const date = new Date(doc.updatedAt || doc.createdAt)
          const dateStr = date.toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric'
          })
          return (
            <li key={doc.id}>
              <Link to={`${docBase}/${doc.slug}`} className="blog-post-card">
                <div className="blog-post-date">{dateStr}</div>
                <h2 className="blog-post-title">{doc.title}</h2>
                {doc.description && (
                  <p className="blog-post-desc">{doc.description}</p>
                )}
                {doc.tags && doc.tags.length > 0 && (
                  <div className="blog-post-tags">
                    {doc.tags.map((tag) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
```

**변경 3** — WorkspaceDocs.css에 추가:

```css
/* ─── Blog post list (in WorkspaceDocs) ─── */

.blog-post-list-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  text-align: left;
}

.blog-description {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
}
```

### 5. 수정 (선택): `packages/viewer/src/pages/workspace/WorkspaceDocs.tsx`

`/w/:workspace`로 접속했을 때 blog 타입이면 `/blog/:workspace`로 리다이렉트:

```tsx
// blog 타입이면서 /w/ 경로로 들어왔을 때 → /blog/ 경로로 리다이렉트
if (workspace.type === 'blog' && !location.pathname.startsWith('/blog/')) {
  navigate(`/blog/${workspaceSlug}`, { replace: true })
  return
}
```

이 줄을 useEffect 안에서 `workspace.type === 'blog'` 체크 앞에 넣는다.

---

## Document 타입 레퍼런스

```typescript
// @openhow/types — packages/types/src/document.ts
export interface Document {
  id: string
  workspaceId: string
  slug: string
  title: string
  nav: string | null
  description: string | null
  accessLevel: AccessLevel
  status?: DocumentStatus
  freeSections?: number
  price?: number
  content?: string
  contentHash: string
  tags?: string[]
  createdBy: string
  createdAt: string   // ISO date
  updatedAt: string   // ISO date
}
```

## WorkspaceInfo 타입 레퍼런스

```typescript
// packages/viewer/src/stores/project.ts
interface WorkspaceInfo {
  id: string
  name: string
  slug: string
  type?: WorkspaceType   // 'docs' | 'course' | 'team' | 'blog' | 'wiki' | 'project' | 'book'
  category?: WorkspaceCategory
  navigationMode?: 'sidebar' | 'two-panel'
  description?: string | null
  // ... (joinPolicy, isPaid, etc.)
}
```

## 기존 패턴 레퍼런스

| 타입 | 경로 패턴 | 레이아웃 |
|------|----------|---------|
| docs | `/w/:workspace` → `/d/:workspace/:slug` | MainLayout |
| book | `/w/:workspace` → `/read/:workspace/:slug` | BookLayout |
| **blog** | `/w/:workspace` → `/blog/:workspace` | **BlogLayout** (신규) |
| course | `/w/:workspace` → 코스 허브 렌더 | MainLayout |

## 검증

```bash
cd packages/viewer
npx tsc --noEmit
pnpm build
```

## 주의사항

- MainLayout, BookLayout, AdminLayout은 수정하지 말 것
- 기존 docs/course/team/wiki/project 타입의 동작을 변경하지 말 것
- 새 npm 패키지 추가 금지
- CSS 변수(`var(--text-color)`, `var(--border-color)` 등)는 기존 테마 시스템을 그대로 사용
- BlogLayout의 카드에 사용하는 CSS 클래스는 `blog-` 접두어로 통일
