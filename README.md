# mdshare

**Write Markdown. Publish anything.**

A document publishing platform for teams that want to share, monetize, and control access to their content — without the overhead of building a docs site from scratch.

```bash
npm install -g @max5/cli
mdshare init
mdshare serve    # preview at localhost:3600
mdshare publish  # deploy to mdshare cloud
```

---

## What you can publish

| Type | Best for |
|------|----------|
| **API Docs** | Developer references, SDK guides, integration manuals |
| **Tutorial Book** | Courses, step-by-step guides, numbered chapters |
| **Blog** | Dev logs, updates, knowledge base articles |

Real-world examples built with mdshare:
- 🔖 **[Bootpay Developer Docs](https://mdshare.rupy1014.workers.dev/d/bootpay/guide)** — API reference for a payment gateway
- 📚 **[AI Vibe Coding Book](https://github.com/rupy1014/ai-jobdori)** — Programming course with paid chapters
- ⛪ **[Slow Church](https://github.com/rupy1014/slow-church)** — Church sermons shared with members

---

## Features

- **One-command deploy** — `mdshare publish` syncs only changed files
- **Access control** — public, private, team-only, or subscriber-only per document
- **Content monetization** — paywall support for premium sections
- **Auto-generated navigation** — sidebar and TOC built from your folder structure
- **Code highlighting** — multi-language, powered by Shiki
- **Full-text search** — built-in, no configuration needed
- **Dark mode** — automatic, follows system preference
- **Edge delivery** — hosted on Cloudflare's global network

---

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Install the CLI and publish your first document |
| [CLI Reference](docs/cli.md) | All commands and options |
| [Configuration](docs/configuration.md) | `mdshare.json`, frontmatter, `_meta.json` |
| [Content Types & Examples](docs/examples.md) | Template types and real-world usage patterns |
| [Self-hosting](docs/self-hosting.md) | Deploy to your own Cloudflare account |

---

## Pricing

| Plan | Price | Use case |
|------|-------|----------|
| **Free** | $0/mo | Personal projects, public docs |
| **Pro** | $9/mo | Private docs, content monetization |
| **Team** | $29/mo | Team collaboration, unlimited workspaces |
| **Self-hosted** | Your infra | Deploy to your own Cloudflare account |

→ See full pricing at [mdshare.rupy1014.workers.dev/pricing](https://mdshare.rupy1014.workers.dev/pricing)

---

## Self-hosting

mdshare runs entirely on Cloudflare infrastructure. If you'd rather own your data and infrastructure, you can deploy your own instance:

- **Runtime**: Cloudflare Workers
- **Database**: D1 (SQLite)
- **Storage**: R2 (markdown + assets)
- **Auth**: Better Auth (GitHub / Google OAuth)

→ See [Self-hosting guide](docs/self-hosting.md) for setup instructions.

---

## CLI Installation

```bash
# npm
npm install -g @max5/cli

# or run without installing
npx @max5/cli init
```

Requires Node.js 18+.

---

## Repository Structure

```
mdshare/
├── docs/               ← Documentation (you are here)
├── examples/
│   ├── ai-docs/        ← Bootpay developer docs (submodule)
│   ├── ai-jobdori/     ← Vibe coding course (submodule)
│   └── slow-church/    ← Church sermons (submodule)
└── core/               ← Platform source (private)
```

> `core/` is the private backend source. The CLI (`@max5/cli`) is available on npm.

---

## License

The **mdshare CLI** (`@max5/cli`) and **types** (`@max5/types`) packages are freely available on npm.
The platform backend (Worker + Viewer) is proprietary. See [self-hosting](docs/self-hosting.md) for deployment options.
