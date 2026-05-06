# Repo cleanup audit

Date: 2026-05-04

This note records repository hygiene findings after moving the nested `csflow.ai` project out of this workspace. It is intentionally non-destructive: candidates below need owner confirmation before deletion or large tracked-file moves.

## Completed

- Moved nested repo `openhow/csflow.ai` to sibling path `/Users/taesupyoon/sideProjects/csflow.ai`.
- Confirmed `openhow/csflow.ai` no longer exists.
- Confirmed `/Users/taesupyoon/sideProjects/csflow.ai/.git` exists.
- Removed stale `/csflow.ai/` ignore rule from `.gitignore` so accidental reintroduction is visible.
- Moved unreferenced root scratch media (`0422.gif`, screenshot PNG) into ignored `temp/root-scratch/`.
- Moved ignored root `client_secret*.json` into ignored `.secrets/` after no exact root filename references were found.
- Moved tracked `urls.txt` to `references/liveklass-urls.txt` and updated utility script defaults/examples.

## Current workspace shape

- `core/` is the primary product monorepo, but is intentionally ignored by this root repo as a private/local project tree.
- `docs/` contains product documentation and planning docs.
- `examples/` contains published/sample content plus a submodule-style reference tree (`examples/openclaw_sources`).
- `.omj/`, `.omx/`, `.serena/`, `.claude/`, `.wrangler/` are workflow/runtime metadata and should stay out of product review unless a specific task requires them.

## Cleanup candidates

| Priority | Path | Evidence | Suggested action |
| --- | --- | --- | --- |
| Done | `client_secret_*.json` | Root-level credential artifact was ignored but locally visible. | Moved current root file into ignored `.secrets/`; still rotate/remove from local machine if no longer needed. |
| High | `.omj/` | Existing tracked intent files plus many modified/untracked/killed/archived items. Nested `.omj/.omj/.runtime` and `.omj/core/.omj/.runtime` are generated runtime noise. | Keep intent docs that are still product-relevant; archive or remove killed items in a dedicated commit; ignore nested runtime directories. |
| High | `temp/` | About 154 MB of screenshots, visual verification output, and local package roots; already ignored. | Periodically delete or move to external artifact storage after any active visual work is complete. |
| Done | `urls.txt` | Tracked root file, about 13 MB and 285,071 lines; scripts used it as LiveKlass input. | Moved to `references/liveklass-urls.txt`; updated utility defaults/examples. |
| Done | root media files (`0422.gif`, screenshot PNG) | No product references found; files were root-level scratch artifacts. | Moved current files to ignored `temp/root-scratch/`; delete later if no longer needed. |
| Medium | `examples/openclaw_sources` | Git submodule entry in `.gitmodules`, large independent source tree with many nested package roots. | Keep if needed as a live source reference; otherwise replace with README/link or fetch script. |
| Medium | `examples/clauders.ai/_drafts` large PDFs/PPTX/MP4/GIFs | Multiple tracked binary assets above 10 MB, including drafts and study outputs. | Separate public content from bulky source/reference archives; consider Git LFS or external archive. |
| Low | `references/` | Untracked `stitch-storyboard` reference content. | Decide whether this is source reference to track, or local-only scratch to ignore/archive. |
| Low | duplicate docs (`docs/clauders_program.md` and `.txt`) | Same topic appears in two formats. | Check whether both are consumed; keep one source of truth if redundant. |

## Safe next cleanup sequence

1. Commit the non-destructive separation/audit changes first.
2. Decide the policy for root artifacts: root should contain only repo control files and high-level docs; scratch assets go under `temp/` or external storage.
3. Clean `.omj/` in a dedicated pass: preserve active intent docs, keep `_archived` only for valuable records, remove `_killed` items after confirmation.
4. Decide whether `references/liveklass-urls.txt` should remain in Git or move to external data storage.
5. Audit `examples/clauders.ai/_drafts` binaries and choose either Git LFS/external archive or curated examples only.
6. Re-check `git status --short` and run product verification from `core/` only when product code changes.
