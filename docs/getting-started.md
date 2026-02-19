# Getting Started

This guide walks you through publishing your first document with mdshare in under 5 minutes.

## Prerequisites

- Node.js 18 or later
- An mdshare account → [Sign up](https://mdshare.rupy1014.workers.dev/login)

## 1. Install the CLI

```bash
npm install -g @max5/cli
```

Verify the installation:

```bash
mdshare --version
```

## 2. Log in

```bash
mdshare login --provider github
# or
mdshare login --provider google
```

This opens a browser window for OAuth. On success, your token is saved to `~/.mdshare/tokens.json`.

## 3. Initialize a project

```bash
mkdir my-docs && cd my-docs
mdshare init
```

The interactive wizard asks:

```
◆  What is your project title?
│  My Documentation
│
◆  What type of content?
│  ● API Docs  ○ Tutorial Book  ○ Blog
│
◆  Theme color?
│  ● Blue  ○ Green  ○ Purple  ○ Red
```

This generates:

```
my-docs/
├── mdshare.json          ← project config
└── docs/
    ├── guide/
    │   └── getting-started.md
    └── _meta.json        ← navigation structure
```

## 4. Preview locally

```bash
mdshare serve
```

Opens a live preview at **http://localhost:3600**. Changes to your markdown files reload automatically.

## 5. Publish

```bash
mdshare publish
```

mdshare compares content hashes and only uploads changed files. On the first publish, a workspace is created automatically.

```
✔  Workspace created: my-docs
✔  Uploaded: guide/getting-started.md
✔  Uploaded: _meta.json

→  https://mdshare.rupy1014.workers.dev/d/my-docs/guide/getting-started
```

## Next steps

- [CLI Reference](cli.md) — all available commands
- [Configuration](configuration.md) — customize navigation, access control, and frontmatter
- [Content Types & Examples](examples.md) — choose the right template for your content
