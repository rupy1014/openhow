# Content Types & Examples

mdshare supports three content types. Each generates a different folder structure, navigation style, and reading experience.

---

## API Docs (`hierarchical`)

Best for: developer references, SDK guides, API documentation, knowledge bases.

**Folder structure:**
```
docs/
├── guide/
│   ├── _meta.json
│   ├── getting-started.md
│   └── installation.md
├── api/
│   ├── _meta.json
│   ├── authentication.md
│   └── endpoints.md
└── _meta.json
```

**Navigation:** Multi-level sidebar with collapsible sections. The top-level `_meta.json` defines the main navigation categories.

**Real example:** [Bootpay Developer Docs](https://mdshare.rupy1014.workers.dev/d/bootpay/guide) — payment gateway API reference covering 5 product areas (결제, 구독, 정산, 빌링, 부가서비스).

---

## Tutorial Book (`sequential`)

Best for: courses, e-books, step-by-step guides, numbered chapters.

**Folder structure:**
```
book/
├── 00-intro.md
├── 01-setup.md
├── 02-basics.md
├── 03-advanced.md
└── mdshare.json
```

**Navigation:** Linear previous/next navigation. Files are sorted by numeric prefix. Progress is preserved per user.

**Monetization:** Use `freeSections` and `price` in frontmatter to lock premium chapters behind a paywall.

```markdown
---
title: Advanced Techniques
access: subscriber
price: 9900
freeSections: 2
---
```

**Real example:** [AI Vibe Coding Book](https://github.com/rupy1014/ai-jobdori) — 20-chapter programming course with free preview chapters.

---

## Blog (`blog`)

Best for: dev logs, changelogs, newsletters, community updates, sermon archives.

**Folder structure:**
```
posts/
├── 2025-01-15-hello-world.md
├── 2025-02-01-new-feature.md
└── mdshare.json
```

**Navigation:** Newest-first list. No explicit ordering needed — files sort by date prefix automatically.

**Access:** Posts can be public, team-only, or subscriber-only individually.

**Real example:** [Slow Church](https://github.com/rupy1014/slow-church) — 17 weekly sermons shared with church members.

---

## Choosing a type

| Question | Recommended type |
|----------|-----------------|
| Do readers need to jump between topics? | `hierarchical` |
| Do readers follow a fixed order? | `sequential` |
| Is content date-driven or episodic? | `blog` |
| Do you want to charge per chapter? | `sequential` with `price` frontmatter |
| Do you want team-only access? | Any type with `access: team` |

---

## Use case gallery

| Use case | Type | Access | Monetization |
|----------|------|--------|-------------|
| Developer API reference | hierarchical | public | — |
| Internal company wiki | hierarchical | team | — |
| Service policy docs | hierarchical | team | — |
| Online course | sequential | subscriber | per-chapter paywall |
| Premium research report | hierarchical | subscriber | full paywall |
| Community newsletter | blog | public or team | — |
| Church sermons | sequential | public | — |
| Changelog / dev log | blog | public | — |
