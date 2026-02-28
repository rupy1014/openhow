# CLI Reference

All commands provided by `@openhow/cli`.

## Installation

```bash
npm install -g @openhow/cli
```

---

## Commands

### `openhow init`

Initialize a new project in the current directory.

```bash
openhow init
```

Creates `openhow.json` and a starter content folder based on the selected template (API Docs, Tutorial Book, or Blog).

---

### `openhow serve [path]`

Start a local preview server.

```bash
openhow serve              # serves current directory
openhow serve ./my-docs    # serves a specific path
```

| Option | Default | Description |
|--------|---------|-------------|
| `--port` | `3600` | Port to listen on |
| `--open` | `true` | Auto-open browser |

The server reads your `openhow.json` config, scans the content directory, and injects navigation data into the viewer. No API calls are made — all data is served locally.

---

### `openhow publish [path]`

Publish content to the openhow cloud.

```bash
openhow publish            # publishes current directory
openhow publish ./my-docs  # publishes a specific path
```

**What it does:**
1. Reads your local token (`~/.openhow/tokens.json`)
2. Scans the content directory
3. Computes content hashes — only changed files are uploaded
4. Rewrites relative image paths to R2 asset URLs
5. Creates the workspace if it doesn't exist yet

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be uploaded without uploading |
| `--force` | Force re-upload all files, ignoring hashes |

---

### `openhow login`

Authenticate with GitHub or Google OAuth.

```bash
openhow login --provider github
openhow login --provider google
```

Token is saved to `~/.openhow/tokens.json`. The browser opens automatically for the OAuth flow.

---

### `openhow logout`

Remove stored credentials.

```bash
openhow logout
```

---

### `openhow whoami`

Display the currently logged-in user.

```bash
openhow whoami
# → taesup@example.com (GitHub)
```

---

### `openhow status`

Show account and workspace summary.

```bash
openhow status
```

Displays:
- Logged-in user
- Current workspace (if any)
- Plan tier
- Document count

---

### `openhow config`

Read and write local configuration.

```bash
openhow config get              # print current config
openhow config set key value    # set a config value
openhow config reset            # reset to defaults
```

Config is stored in `~/.openhow/config.json`.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `OPENHOW_TOKEN` | Auth token (for CI/non-interactive environments) |
| `OPENHOW_API_URL` | Override the API endpoint (for self-hosted instances) |
