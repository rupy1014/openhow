import * as fs from "fs";
import * as path from "path";
import YAML from "yaml";

type Frontmatter = Record<string, unknown>;

type MarkdownDoc = {
  filePath: string;
  slug: string;
  frontmatter: Frontmatter;
  body: string;
};

type ValidationIssue = {
  filePath: string;
  message: string;
  kind: "old_pattern" | "missing_target" | "missing_frontmatter";
};

type MetadataAuditEntry = {
  filePath: string;
  slug: string;
  missingFields: string[];
};

const workspaceRoot = path.resolve(__dirname, "../..");
const positionalArgs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const docsRootArg = positionalArgs[0];
const docsRoot = docsRootArg
  ? path.resolve(process.cwd(), docsRootArg)
  : path.join(workspaceRoot, "docs");
const WRITE_MODE = process.argv.includes("--write");
const REPORT_JSON_ARG = process.argv.find((arg) => arg.startsWith("--report-json"));
const reportJsonPath = REPORT_JSON_ARG
  ? (() => {
      const [, value] = REPORT_JSON_ARG.split("=", 2);
      if (value && value.trim().length > 0) {
        return path.resolve(process.cwd(), value.trim());
      }
      return path.join(process.cwd(), "content-cards-report.json");
    })()
  : null;

function walkMarkdownFiles(dirPath: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.(md|markdown)$/i, "");
}

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(raw);
  if (!match) return { frontmatter: {}, body: raw };

  const frontmatter = (YAML.parse(match[1]) ?? {}) as Frontmatter;
  const body = raw.slice(match[0].length);
  return { frontmatter, body };
}

function loadDocs(root: string): MarkdownDoc[] {
  return walkMarkdownFiles(root).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const relativePath = path.relative(root, filePath);
    const slug = normalizeSlug(
      typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
        ? frontmatter.slug
        : relativePath
    );

    return { filePath, slug, frontmatter, body };
  });
}

function buildSlugIndex(root: string, docs: MarkdownDoc[]): Map<string, MarkdownDoc> {
  const index = new Map<string, MarkdownDoc>();
  for (const doc of docs) {
    index.set(doc.slug, doc);
    index.set(normalizeSlug(path.relative(root, doc.filePath)), doc);
  }
  return index;
}

function getOldRecommendationSections(body: string): string[] {
  const matches = body.match(/### 추천 콘텐츠[\s\S]*?(?=\n## |\n# |$)/g) ?? [];
  return matches.filter((section) => />\s*\*\*\[/.test(section));
}

function extractRecommendationSlugs(section: string): string[] {
  const slugs: string[] = [];
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of section.matchAll(linkRegex)) {
    const target = match[1]?.trim();
    if (!target) continue;
    if (/^(https?:)?\/\//i.test(target)) continue;
    slugs.push(normalizeSlug(target));
  }

  return [...new Set(slugs)];
}

function replaceOldRecommendationSections(body: string): { nextBody: string; replacements: number } {
  let replacements = 0;
  const nextBody = body.replace(/### 추천 콘텐츠[\s\S]*?(?=\n## |\n# |$)/g, (section) => {
    if (!/>\s*\*\*\[/.test(section)) return section;

    const slugs = extractRecommendationSlugs(section);
    if (slugs.length === 0) return section;

    replacements += 1;
    return [
      "### 추천 콘텐츠",
      "",
      ":::content-cards",
      ...slugs.map((slug) => `- ${slug}`),
      ":::",
      "",
    ].join("\n");
  });

  return { nextBody, replacements };
}

function getContentCardBlocks(body: string): string[][] {
  const blocks: string[][] = [];
  const regex = /^:::content-cards[ \t]*\n([\s\S]*?)\n?:::/gm;

  for (const match of body.matchAll(regex)) {
    const slugs = match[1]
      .split("\n")
      .map((line) => {
        const itemMatch = /^\s*-\s+(.+?)\s*$/.exec(line);
        return itemMatch?.[1]?.trim() ?? "";
      })
      .filter(Boolean);
    blocks.push(slugs);
  }

  return blocks;
}

function resolveTargetDoc(slugIndex: Map<string, MarkdownDoc>, currentDocSlug: string, rawSlug: string): MarkdownDoc | null {
  const normalized = normalizeSlug(rawSlug);
  return (
    slugIndex.get(normalized) ??
    slugIndex.get(normalizeSlug(path.join(path.dirname(currentDocSlug), normalized))) ??
    null
  );
}

function validateContentCards(root: string, docs: MarkdownDoc[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slugIndex = buildSlugIndex(root, docs);

  for (const doc of docs) {
    const oldSections = getOldRecommendationSections(doc.body);
    if (oldSections.length > 0) {
      issues.push({
        filePath: doc.filePath,
        kind: "old_pattern",
        message: `old 추천 콘텐츠 blockquote pattern remains (${oldSections.length})`,
      });
    }

    const cardBlocks = getContentCardBlocks(doc.body);
    for (const slugs of cardBlocks) {
      for (const rawSlug of slugs) {
        const resolved = resolveTargetDoc(slugIndex, doc.slug, rawSlug);

        if (!resolved) {
          issues.push({
            filePath: doc.filePath,
            kind: "missing_target",
            message: `content-cards target not found: ${rawSlug}`,
          });
          continue;
        }

        const missingFields = ["title", "thumbnail", "description"].filter((field) => {
          const value = resolved.frontmatter[field];
          return typeof value !== "string" || value.trim().length === 0;
        });

        if (missingFields.length > 0) {
          issues.push({
            filePath: doc.filePath,
            kind: "missing_frontmatter",
            message: `target ${resolved.slug} missing frontmatter: ${missingFields.join(", ")}`,
          });
        }
      }
    }
  }

  return issues;
}

function rewriteDocs(docs: MarkdownDoc[]): number {
  let changedFiles = 0;

  for (const doc of docs) {
    const raw = fs.readFileSync(doc.filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(raw);
    const { nextBody, replacements } = replaceOldRecommendationSections(body);

    if (replacements === 0 || nextBody === body) continue;

    const frontmatterBlock =
      Object.keys(frontmatter).length > 0
        ? `---\n${YAML.stringify(frontmatter).trimEnd()}\n---\n\n`
        : "";

    fs.writeFileSync(doc.filePath, `${frontmatterBlock}${nextBody.trimStart()}`);
    changedFiles += 1;
  }

  return changedFiles;
}

function buildDocDetails(root: string, docs: MarkdownDoc[], issues: ValidationIssue[]) {
  const slugIndex = buildSlugIndex(root, docs);
  return docs.map((doc) => {
    const oldRecommendationSections = getOldRecommendationSections(doc.body);
    const contentCardBlocks = getContentCardBlocks(doc.body).map((targets) => ({
      targets,
      resolved: targets.map((rawSlug) => {
        const resolved = resolveTargetDoc(slugIndex, doc.slug, rawSlug);

        if (!resolved) {
          return {
            requestedSlug: rawSlug,
            resolvedSlug: null,
            exists: false,
            missingFrontmatter: [],
          };
        }

        const missingFrontmatter = ["title", "thumbnail", "description"].filter((field) => {
          const value = resolved.frontmatter[field];
          return typeof value !== "string" || value.trim().length === 0;
        });

        return {
          requestedSlug: rawSlug,
          resolvedSlug: resolved.slug,
          exists: true,
          missingFrontmatter,
        };
      }),
    }));

    return {
      filePath: path.relative(process.cwd(), doc.filePath),
      slug: doc.slug,
      oldRecommendationSectionCount: oldRecommendationSections.length,
      contentCardBlockCount: contentCardBlocks.length,
      contentCardBlocks,
      issues: issues
        .filter((issue) => issue.filePath === doc.filePath)
        .map((issue) => ({ kind: issue.kind, message: issue.message })),
    };
  });
}

function buildMetadataAudit(docs: MarkdownDoc[]) {
  const entries: MetadataAuditEntry[] = docs
    .map((doc) => {
      const missingFields = ["title", "thumbnail", "description"].filter((field) => {
        const value = doc.frontmatter[field];
        return typeof value !== "string" || value.trim().length === 0;
      });

      return {
        filePath: path.relative(process.cwd(), doc.filePath),
        slug: doc.slug,
        missingFields,
      };
    })
    .filter((entry) => entry.missingFields.length > 0);

  const missingFieldCounts = entries.reduce<Record<string, number>>((acc, entry) => {
    for (const field of entry.missingFields) {
      acc[field] = (acc[field] ?? 0) + 1;
    }
    return acc;
  }, {});

  return {
    docsWithMissingFields: entries.length,
    missingFieldCounts,
    docs: entries,
  };
}

function writeJsonReport(root: string, docs: MarkdownDoc[], issues: ValidationIssue[], rewrittenFiles: number) {
  if (!reportJsonPath) return;

  const issueCountsByKind = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.kind] = (acc[issue.kind] ?? 0) + 1;
    return acc;
  }, {});
  const metadataAudit = buildMetadataAudit(docs);
  const report = {
    docsRoot: root,
    generatedAt: new Date().toISOString(),
    summary: {
      markdownDocs: docs.length,
      docsUsingContentCards: docs.filter((doc) => getContentCardBlocks(doc.body).length > 0).length,
      docsUsingOldRecommendationPattern: docs.filter((doc) => getOldRecommendationSections(doc.body).length > 0).length,
      rewrittenFiles,
      issueCount: issues.length,
      issueCountsByKind,
      docsWithMissingMetadata: metadataAudit.docsWithMissingFields,
      missingMetadataFieldCounts: metadataAudit.missingFieldCounts,
    },
    issues: issues.map((issue) => ({
      filePath: path.relative(process.cwd(), issue.filePath),
      kind: issue.kind,
      message: issue.message,
    })),
    docs: buildDocDetails(root, docs, issues),
    metadataAudit,
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2) + "\n");
}

function main() {
  if (!fs.existsSync(docsRoot)) {
    console.error(`❌ docs root not found: ${docsRoot}`);
    process.exit(1);
  }

  let docs = loadDocs(docsRoot);
  let rewrittenFiles = 0;

  if (WRITE_MODE) {
    rewrittenFiles = rewriteDocs(docs);
    docs = loadDocs(docsRoot);
  }

  const issues = validateContentCards(docsRoot, docs);
  const docsWithCards = docs.filter((doc) => getContentCardBlocks(doc.body).length > 0).length;
  const docsWithOldPattern = docs.filter((doc) => getOldRecommendationSections(doc.body).length > 0).length;

  writeJsonReport(docsRoot, docs, issues, rewrittenFiles);

  console.log(`📚 docs root: ${docsRoot}`);
  console.log(`📝 markdown docs: ${docs.length}`);
  if (WRITE_MODE) {
    console.log(`🛠️ rewritten files: ${rewrittenFiles}`);
  }
  if (reportJsonPath) {
    console.log(`📄 json report: ${reportJsonPath}`);
  }
  console.log(`🃏 docs using :::content-cards: ${docsWithCards}`);
  console.log(`🧱 docs still using old 추천 콘텐츠 blockquotes: ${docsWithOldPattern}`);

  if (issues.length === 0) {
    console.log("✅ content-cards validation passed");
    return;
  }

  console.error(`❌ content-cards validation found ${issues.length} issue(s):`);
  for (const issue of issues) {
    console.error(`- ${path.relative(workspaceRoot, issue.filePath)}: ${issue.message}`);
  }
  process.exit(1);
}

main();
