# AGENTS.md
Guide for autonomous coding agents in this repo.
Scope: `/Users/taesupyoon/sideProjects/mdshare` (root), with primary code in `/core`.

## 1) Repo Layout
- Root (`mdshare/`) is docs/examples/orchestration.
- Product code lives in `core/`.
- For app/API/CLI implementation, work in `core/`.
- Monorepo packages:
  - `core/packages/types` (`@openhow/types`)
  - `core/packages/cli` (`@openhow/cli`)
  - `core/packages/viewer` (Vue 3 app)
  - `core/packages/worker` (Cloudflare Worker API)

## 2) Cursor/Copilot Rules Check
Searched at root and under `core/`:
- `.cursorrules`
- `.cursor/rules/`
- `.github/copilot-instructions.md`
Current result:
- No Cursor rule files found.
- No Copilot instruction files found.
If these files are added later, treat them as higher-priority repo instructions.

## 3) Tooling Baseline
- Package manager: `pnpm`.
- Node: `>=18`.
- Workspace: `core/pnpm-workspace.yaml` (`packages/*`).
- Build orchestration: Turbo (`core/turbo.json`).

## 4) Build/Lint/Test Commands
Run from `core/` unless noted.

### Monorepo root scripts (`core/package.json`)
- `pnpm dev` -> `turbo run dev`
- `pnpm build` -> `turbo run build`
- `pnpm test` -> `turbo run test`
- `pnpm lint` -> `turbo run lint`
- `pnpm clean` -> `turbo run clean && rm -rf node_modules`
Turbo behavior (`core/turbo.json`):
- `test` depends on `build`.
- `lint` has no outputs.

### Package scripts
`core/packages/types`
- `pnpm build`
- `pnpm dev`
- `pnpm clean`
`core/packages/cli`
- `pnpm build`
- `pnpm dev`
- `pnpm clean`
- `pnpm test` (Vitest)
`core/packages/viewer`
- `pnpm dev`
- `pnpm build`
- `pnpm preview`
- `pnpm clean`
`core/packages/worker`
- `pnpm dev` (wrangler dev)
- `pnpm deploy`
- `pnpm db:generate`
- `pnpm db:migrate:local`
- `pnpm db:migrate:remote`

## 5) Single-Test Execution
Important current state:
- Only `@openhow/cli` has an explicit test runner script (`vitest`).
- `viewer`, `worker`, `types` do not define package-level `test` scripts.
Run one file (CLI package):
- `cd core/packages/cli && pnpm test -- path/to/file.test.ts`
Run by test name (CLI package):
- `cd core/packages/cli && pnpm test -- -t "test name"`
Run CLI tests from monorepo root:
- `cd core && pnpm --filter @openhow/cli test -- path/to/file.test.ts`
If touched area has no tests:
- Run nearest verification (`pnpm build` for that package).
- Explicitly report coverage gap.

## 6) Dev and Deploy Flow
Common local setup:
- Terminal A: `cd core/packages/worker && pnpm dev`
- Terminal B: `cd core/packages/viewer && pnpm dev`
Docs workspace note:
- `examples/clauders.ai` publish target is `clauders`.
- Do not publish `examples/clauders.ai` to `clauders-ai` unless the user explicitly asks.
- `clauders-ai` is a deprecated/private workspace kept separate from the real public workspace.
Production deploy order:
1. `cd core/packages/viewer && pnpm build`
2. `cd core/packages/worker && pnpm deploy`

## 7) Code Style Expectations
### 7.1 General
- Match the existing style of touched files.
- Keep changes minimal and focused.
- Avoid repo-wide formatting churn.
- Default to ASCII unless file already uses non-ASCII.

### 7.2 Imports and Module Boundaries
- Reuse shared contracts from `@openhow/types`.
- Use `import type` for type-only imports.
- Keep import grouping/order consistent with nearby code.
- CLI TS source uses ESM local imports with `.js` suffix.
  - Example: `import { serve } from './commands/serve.js'`
- Viewer/Worker usually use extensionless local imports.

### 7.3 Types and TypeScript
- TypeScript is strict (`core/tsconfig.json`).
- Avoid `any`; prefer interfaces and union literals.
- Explicitly type worker JSON request payloads:
  - `await c.req.json<{ ... }>()`
- Add explicit return types when it improves exported API clarity.

### 7.4 Naming
- Variables/functions: `camelCase`
- Constants/env-like values: `SCREAMING_SNAKE_CASE` (e.g., `API_BASE`)
- Vue components: `PascalCase.vue`
- TS module filenames: kebab-case where already used
- Stores/composables: `useXxxStore`, `useXxx`

### 7.5 Error Handling
- Worker routes should return structured JSON errors with status codes.
  - Pattern: `return c.json({ error: 'message' }, 400)`
- Validate early with guard clauses.
- Wrap external I/O boundaries in `try/catch`.
- In viewer, keep safe fallback UI/state on failures.

### 7.6 Vue/Frontend Conventions
- Use `script setup lang="ts"` + Composition API.
- Keep remote data in Pinia stores.
- Use `API_BASE` and `credentials: 'include'` for authenticated fetches.
- Preserve lazy-loaded route style in `router.ts`.

### 7.7 Worker/Backend Conventions
- Keep route modules under `core/packages/worker/src/routes/*`.
- Mount routes in `core/packages/worker/src/index.ts`.
- Use Drizzle helpers (`eq`, `and`, `sql`, etc.) consistently.
- Reuse existing auth middleware contracts (`authMiddleware`, `requireAuth`).

## 8) Infra Constraints
- Worker bindings expected: `DB`, `R2`, `KV`, `ASSETS`.
- Required auth/config secrets must remain aligned with worker env.
- For schema changes, keep Drizzle schema + migrations + wrangler config in sync.

## 9) Publish Rules
- Use `pnpm publish` (not `npm publish`).
- Publish order: `types` then `cli`.
- `viewer` and `worker` are private and not npm-published.

## 10) Codex Orchestration

This is a multi-package monorepo. For tasks spanning multiple packages, delegate code execution to Codex CLI via `run-codex.sh` to avoid bloating Claude's context with file contents.

### Pattern

```
Claude (orchestrator)
  │
  ├── Decompose task → identify target packages
  │
  ├── bash scripts/run-codex.sh <package-path> "<task>"
  │         ↓
  ├── Parse JSON result
  │         ↓
  └── Decide next step (repeat or finish)
```

### Package paths

| Package | Path |
|---------|------|
| API (Hono Worker) | `core/packages/worker` |
| Frontend (Vue 3) | `core/packages/viewer` |
| CLI | `core/packages/cli` |
| Shared types | `core/packages/types` |

### Usage

```bash
# Single package
bash scripts/run-codex.sh core/packages/worker "Order cancel 액션 구현"

# Sequential (backend → frontend)
RESULT=$(bash scripts/run-codex.sh core/packages/worker "API 구현")
STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['status'])")
SUMMARY=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin)['summary'])")

if [ "$STATUS" = "done" ]; then
  bash scripts/run-codex.sh core/packages/viewer \
    "백엔드 완료: $SUMMARY. 이에 맞게 프론트 구현."
fi

# Parallel (independent packages — different files only)
bash scripts/run-codex.sh core/packages/worker "..." > /tmp/worker.json &
bash scripts/run-codex.sh core/packages/cli "..." > /tmp/cli.json &
wait
```

**WARNING**: Never run parallel Codex tasks on the same package or overlapping files. Race conditions will cause overwrites.

### When to use Codex vs direct edit

| Scenario | Use |
|----------|-----|
| Multi-file change in one package | Codex |
| Cross-package feature (worker + viewer) | Codex (sequential) |
| Single-line fix or small targeted edit | Direct edit |
| Reading/understanding code | Direct read |

### Context management

`.claude/settings.json` has `autoCompact: true` — Claude auto-compresses context before hitting limits.
For mid-task manual compression: `/compact <summary of completed steps>`

## 11) Agent Working Agreement
Before coding:
- Confirm target package and available scripts.
- Check nearby files for local patterns first.
After coding:
- Run the narrowest relevant verification command.
- CLI changes: prefer focused Vitest execution.
- Viewer/Worker changes: at minimum run package build.
- Report exactly what was verified and what is untested.
When uncertain:
- Prefer consistency with repository patterns over generic defaults.
- Keep behavior backward compatible unless task requires change.
