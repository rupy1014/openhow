# Configuration

mdshare projects are configured through three layers: the project config file, frontmatter in individual markdown files, and `_meta.json` for navigation structure.

---

## `mdshare.json`

The project-level config file, created by `mdshare init`.

```json
{
  "title": "My Documentation",
  "content": "./docs",
  "type": "hierarchical",
  "theme": {
    "preset": "blue"
  },
  "workspace": "my-docs"
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | — | Project title shown in the header |
| `content` | string | `"./docs"` | Path to the content directory |
| `type` | `"hierarchical"` \| `"sequential"` \| `"blog"` | `"hierarchical"` | Content structure type |
| `theme.preset` | `"blue"` \| `"green"` \| `"purple"` \| `"red"` | `"blue"` | Color theme |
| `workspace` | string | auto-generated | Workspace slug used in the published URL |

### Content types

| Type | Structure | Navigation | Best for |
|------|-----------|------------|----------|
| `hierarchical` | `topic/subtopic/*.md` | Multi-level sidebar | API docs, reference manuals |
| `sequential` | `01-intro.md`, `02-basics.md` | Previous / Next | Courses, tutorial books |
| `blog` | Date-based or flat | Newest-first list | Dev logs, articles, updates |

---

## Frontmatter

Each markdown file can include a YAML frontmatter block at the top.

```markdown
---
title: Getting Started
description: Learn how to install and use the mdshare CLI.
access: public
order: 1
draft: false
---

# Getting Started
...
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `title` | string | filename | Document title shown in sidebar and `<title>` |
| `description` | string | — | Shown below the title and in search results |
| `access` | `"public"` \| `"private"` \| `"team"` \| `"subscriber"` | `"public"` | Who can view this document |
| `order` | number | filename sort | Manual sort order within the current directory |
| `draft` | boolean | `false` | If `true`, excluded from publish |
| `price` | number | — | Required payment amount for subscriber access |
| `freeSections` | number | — | Number of sections visible before paywall |

### Access levels

| Value | Visible to |
|-------|-----------|
| `public` | Everyone (no login required) |
| `private` | Only you (document owner) |
| `team` | Members of your workspace |
| `subscriber` | Users who have paid the `price` |

---

## `_meta.json`

Controls the sidebar navigation structure within a directory. If omitted, mdshare generates navigation automatically from the file and folder names.

```json
{
  "label": "Guide",
  "items": [
    { "text": "Introduction", "link": "/guide/introduction" },
    { "text": "Installation", "link": "/guide/installation" },
    {
      "text": "Advanced",
      "collapsed": true,
      "items": [
        { "text": "Configuration", "link": "/guide/advanced/configuration" }
      ]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Section name shown in the main nav (top-level only) |
| `items` | array | Ordered list of navigation items |
| `items[].text` | string | Link label |
| `items[].link` | string | URL path (relative to workspace root) |
| `items[].collapsed` | boolean | Start this group collapsed |
| `items[].items` | array | Nested items (one level deep) |

---

## Auto-generated navigation

If no `_meta.json` is present, mdshare generates navigation automatically:

- **Folders** become sidebar sections
- **Files** become sidebar links, sorted by:
  1. Numeric prefix (`01-`, `02-` …)
  2. Alphabetically otherwise
- **`index.md`** in a folder becomes the section landing page
- **Underscored files** (`_draft.md`) are excluded

### Numeric prefix stripping

Files named `01-introduction.md` are displayed as `Introduction` in the sidebar — the numeric prefix is used for sorting only.
