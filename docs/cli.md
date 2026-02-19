# CLI Reference

All commands provided by `@max5/cli`.

## Installation

```bash
npm install -g @max5/cli
```

---

## Commands

### `mdshare init`

Initialize a new project in the current directory.

```bash
mdshare init
```

Creates `mdshare.json` and a starter content folder based on the selected template (API Docs, Tutorial Book, or Blog).

---

### `mdshare serve [path]`

Start a local preview server.

```bash
mdshare serve              # serves current directory
mdshare serve ./my-docs    # serves a specific path
```

| Option | Default | Description |
|--------|---------|-------------|
| `--port` | `3600` | Port to listen on |
| `--open` | `true` | Auto-open browser |

The server reads your `mdshare.json` config, scans the content directory, and injects navigation data into the viewer. No API calls are made — all data is served locally.

---

### `mdshare publish [path]`

Publish content to the mdshare cloud.

```bash
mdshare publish            # publishes current directory
mdshare publish ./my-docs  # publishes a specific path
```

**What it does:**
1. Reads your local token (`~/.mdshare/tokens.json`)
2. Scans the content directory
3. Computes content hashes — only changed files are uploaded
4. Rewrites relative image paths to R2 asset URLs
5. Creates the workspace if it doesn't exist yet

| Option | Description |
|--------|-------------|
| `--dry-run` | Show what would be uploaded without uploading |
| `--force` | Force re-upload all files, ignoring hashes |

---

### `mdshare login`

Authenticate with GitHub or Google OAuth.

```bash
mdshare login --provider github
mdshare login --provider google
```

Token is saved to `~/.mdshare/tokens.json`. The browser opens automatically for the OAuth flow.

---

### `mdshare logout`

Remove stored credentials.

```bash
mdshare logout
```

---

### `mdshare whoami`

Display the currently logged-in user.

```bash
mdshare whoami
# → taesup@example.com (GitHub)
```

---

### `mdshare status`

Show account and workspace summary.

```bash
mdshare status
```

Displays:
- Logged-in user
- Current workspace (if any)
- Plan tier
- Document count

---

### `mdshare config`

Read and write local configuration.

```bash
mdshare config get              # print current config
mdshare config set key value    # set a config value
mdshare config reset            # reset to defaults
```

Config is stored in `~/.mdshare/config.json`.

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `MDSHARE_TOKEN` | Auth token (for CI/non-interactive environments) |
| `MDSHARE_API_URL` | Override the API endpoint (for self-hosted instances) |
