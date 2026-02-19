# Self-hosting

mdshare runs entirely on Cloudflare infrastructure. If you prefer to own your data and infrastructure, you can deploy your own mdshare instance to your Cloudflare account.

> **Note:** Self-hosting is currently in early access. The deployment package is available on request. [Contact us](mailto:hello@mdshare.dev) to get access.

---

## Architecture

A self-hosted mdshare instance consists of:

| Component | Cloudflare product | Description |
|-----------|-------------------|-------------|
| API + SPA | **Workers** | Hono-based API + Vue 3 frontend served as static assets |
| Database | **D1** | Documents, workspaces, users, members |
| File storage | **R2** | Markdown content + uploaded assets |
| Session cache | **KV** | Auth sessions |

All Cloudflare products have a generous free tier sufficient for small to medium deployments.

---

## Requirements

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed
- GitHub and/or Google OAuth app credentials (for authentication)
- Node.js 18+

---

## Cloudflare setup

### 1. Create D1 database

```bash
wrangler d1 create mdshare-db
```

Note the `database_id` from the output.

### 2. Create R2 bucket

```bash
wrangler r2 bucket create mdshare-docs
```

### 3. Create KV namespace

```bash
wrangler kv namespace create mdshare-sessions
```

Note the `id` from the output.

---

## OAuth credentials

You need at least one OAuth provider configured.

### GitHub OAuth app

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**
2. Set **Authorization callback URL** to `https://your-worker.workers.dev/api/auth/callback/github`
3. Copy **Client ID** and **Client Secret**

### Google OAuth app

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `https://your-worker.workers.dev/api/auth/callback/google` to authorized redirect URIs
4. Copy **Client ID** and **Client Secret**

---

## Configuration

Update `wrangler.toml` with your resource IDs:

```toml
name = "mdshare"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "mdshare-db"
database_id = "YOUR_D1_DATABASE_ID"

[[r2_buckets]]
binding = "R2"
bucket_name = "mdshare-docs"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID"
```

Set secrets via Wrangler:

```bash
wrangler secret put BETTER_AUTH_SECRET      # random string, 32+ chars
wrangler secret put GITHUB_CLIENT_ID
wrangler secret put GITHUB_CLIENT_SECRET
wrangler secret put GOOGLE_CLIENT_ID        # optional
wrangler secret put GOOGLE_CLIENT_SECRET    # optional
```

---

## Deploy

```bash
# Run database migrations
wrangler d1 execute mdshare-db --file=./migrations/0001_init.sql

# Build and deploy
pnpm run deploy
```

Your instance will be live at `https://mdshare.your-subdomain.workers.dev`.

---

## Point the CLI to your instance

```bash
mdshare config set apiUrl https://mdshare.your-subdomain.workers.dev
```

Or set the environment variable:

```bash
export MDSHARE_API_URL=https://mdshare.your-subdomain.workers.dev
```

---

## Custom domain (optional)

Add a custom domain in the Cloudflare dashboard under **Workers & Pages** → your worker → **Settings** → **Domains & Routes**.

---

## Estimated Cloudflare costs

For small to medium teams on the Cloudflare free tier:

| Product | Free allowance | Typical self-hosted usage |
|---------|---------------|--------------------------|
| Workers | 100k req/day | Easily within free tier |
| D1 | 5M row reads/day | Easily within free tier |
| R2 | 10 GB storage, 1M Class B ops/month | Within free tier for most teams |
| KV | 100k reads/day | Within free tier |

For larger deployments, Cloudflare's paid plans start at $5/month.
