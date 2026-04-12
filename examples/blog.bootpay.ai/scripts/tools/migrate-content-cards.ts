import * as fs from "fs";
import * as path from "path";
import { spawnSync } from "child_process";

const workspaceRoot = path.resolve(__dirname, "../..");
const positionalArgs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const docsRootArg = positionalArgs[0];
const docsRoot = docsRootArg
  ? path.resolve(process.cwd(), docsRootArg)
  : path.join(workspaceRoot, "docs");

const reportJsonArg = process.argv.find((arg) => arg.startsWith("--report-json"));
const reportJsonPath = reportJsonArg
  ? (() => {
      const [, value] = reportJsonArg.split("=", 2);
      return value && value.trim().length > 0
        ? path.resolve(process.cwd(), value.trim())
        : path.join(process.cwd(), "content-cards-report.json");
    })()
  : path.join(process.cwd(), "content-cards-report.json");
const summaryJsonArg = process.argv.find((arg) => arg.startsWith("--summary-json"));
const summaryJsonPath = summaryJsonArg
  ? (() => {
      const [, value] = summaryJsonArg.split("=", 2);
      return value && value.trim().length > 0
        ? path.resolve(process.cwd(), value.trim())
        : path.join(process.cwd(), "content-cards-migration-summary.json");
    })()
  : path.join(process.cwd(), "content-cards-migration-summary.json");
const summaryMdArg = process.argv.find((arg) => arg.startsWith("--summary-md"));
const summaryMdPath = summaryMdArg
  ? (() => {
      const [, value] = summaryMdArg.split("=", 2);
      return value && value.trim().length > 0
        ? path.resolve(process.cwd(), value.trim())
        : path.join(process.cwd(), "content-cards-migration-summary.md");
    })()
  : path.join(process.cwd(), "content-cards-migration-summary.md");
const auditJsonArg = process.argv.find((arg) => arg.startsWith("--audit-json"));
const auditJsonPath = auditJsonArg
  ? (() => {
      const [, value] = auditJsonArg.split("=", 2);
      return value && value.trim().length > 0
        ? path.resolve(process.cwd(), value.trim())
        : path.join(process.cwd(), "content-cards-metadata-audit.json");
    })()
  : path.join(process.cwd(), "content-cards-metadata-audit.json");
const auditMdArg = process.argv.find((arg) => arg.startsWith("--audit-md"));
const auditMdPath = auditMdArg
  ? (() => {
      const [, value] = auditMdArg.split("=", 2);
      return value && value.trim().length > 0
        ? path.resolve(process.cwd(), value.trim())
        : path.join(process.cwd(), "content-cards-metadata-audit.md");
    })()
  : path.join(process.cwd(), "content-cards-metadata-audit.md");
const diffPath = path.join(process.cwd(), "content-cards-migration.diff");
const statPath = path.join(process.cwd(), "content-cards-migration.stat.txt");

type ValidationReport = {
  summary?: {
    docsWithMissingMetadata?: number;
    missingMetadataFieldCounts?: Record<string, number>;
  };
  metadataAudit?: {
    docsWithMissingFields?: number;
    missingFieldCounts?: Record<string, number>;
    docs?: Array<{
      filePath: string;
      slug: string;
      missingFields: string[];
    }>;
  };
};

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

function snapshotMarkdown(dirPath: string): Map<string, string> {
  const snapshot = new Map<string, string>();
  for (const filePath of walkMarkdownFiles(dirPath)) {
    snapshot.set(filePath, fs.readFileSync(filePath, "utf-8"));
  }
  return snapshot;
}

function getChangedFiles(before: Map<string, string>, after: Map<string, string>): string[] {
  const allFiles = new Set([...before.keys(), ...after.keys()]);
  return [...allFiles]
    .filter((filePath) => before.get(filePath) !== after.get(filePath))
    .sort();
}

function runValidator(): number {
  const scriptPath = path.join(workspaceRoot, "scripts/tools/validate-content-cards.ts");
  const result = spawnSync(
    "pnpm",
    [
      "exec",
      "tsx",
      scriptPath,
      docsRoot,
      "--write",
      `--report-json=${reportJsonPath}`,
    ],
    {
      cwd: workspaceRoot,
      stdio: "inherit",
    }
  );

  return result.status ?? 1;
}

function ensureParentDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function getGitRoot(cwd: string): string | null {
  const result = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf-8",
  });

  if (result.status !== 0) return null;
  return result.stdout.trim() || null;
}

function buildSummary(params: {
  docsRoot: string;
  reportJsonPath: string;
  changedFiles: string[];
  gitRoot: string | null;
  validationReport: ValidationReport | null;
}) {
  return {
    docsRoot: params.docsRoot,
    reportJsonPath: params.reportJsonPath,
    generatedAt: new Date().toISOString(),
    changedFileCount: params.changedFiles.length,
    changedFiles: params.changedFiles.map((filePath) => path.relative(process.cwd(), filePath)),
    gitRoot: params.gitRoot,
    diffPath: params.gitRoot ? diffPath : null,
    statPath: params.gitRoot ? statPath : null,
    auditJsonPath,
    auditMdPath,
    docsWithMissingMetadata:
      params.validationReport?.metadataAudit?.docsWithMissingFields ??
      params.validationReport?.summary?.docsWithMissingMetadata ??
      0,
    missingMetadataFieldCounts:
      params.validationReport?.metadataAudit?.missingFieldCounts ??
      params.validationReport?.summary?.missingMetadataFieldCounts ??
      {},
  };
}

function writeSummaryFiles(summary: ReturnType<typeof buildSummary>) {
  ensureParentDir(summaryJsonPath);
  fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2) + "\n");

  const markdown = [
    "# Content Cards Migration Summary",
    "",
    `- Generated at: ${summary.generatedAt}`,
    `- Docs root: ${summary.docsRoot}`,
    `- JSON report: ${summary.reportJsonPath}`,
    `- Changed file count: ${summary.changedFileCount}`,
    `- Git root: ${summary.gitRoot ?? "N/A"}`,
    `- Diff path: ${summary.diffPath ?? "N/A"}`,
    `- Stat path: ${summary.statPath ?? "N/A"}`,
    `- Metadata audit JSON: ${summary.auditJsonPath}`,
    `- Metadata audit Markdown: ${summary.auditMdPath}`,
    `- Docs with missing metadata: ${summary.docsWithMissingMetadata}`,
    "",
    "## Changed Files",
    "",
    ...(summary.changedFiles.length > 0
      ? summary.changedFiles.map((filePath) => `- ${filePath}`)
      : ["- (none)"]),
    "",
    "## Missing Metadata Counts",
    "",
    ...(Object.keys(summary.missingMetadataFieldCounts).length > 0
      ? Object.entries(summary.missingMetadataFieldCounts).map(([field, count]) => `- ${field}: ${count}`)
      : ["- (none)"]),
  ].join("\n");

  ensureParentDir(summaryMdPath);
  fs.writeFileSync(summaryMdPath, `${markdown}\n`);
}

function readValidationReport(): ValidationReport | null {
  if (!fs.existsSync(reportJsonPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(reportJsonPath, "utf-8")) as ValidationReport;
  } catch {
    return null;
  }
}

function writeMetadataAuditFiles(validationReport: ValidationReport | null) {
  const audit = validationReport?.metadataAudit ?? {
    docsWithMissingFields: 0,
    missingFieldCounts: {},
    docs: [],
  };

  ensureParentDir(auditJsonPath);
  fs.writeFileSync(auditJsonPath, JSON.stringify(audit, null, 2) + "\n");

  const markdown = [
    "# Content Cards Metadata Audit",
    "",
    `- Docs with missing fields: ${audit.docsWithMissingFields ?? 0}`,
    "",
    "## Missing Field Counts",
    "",
    ...(audit.missingFieldCounts && Object.keys(audit.missingFieldCounts).length > 0
      ? Object.entries(audit.missingFieldCounts).map(([field, count]) => `- ${field}: ${count}`)
      : ["- (none)"]),
    "",
    "## Docs Missing Metadata",
    "",
    ...(audit.docs && audit.docs.length > 0
      ? audit.docs.map((doc) => `- ${doc.filePath} (${doc.slug}) — ${doc.missingFields.join(", ")}`)
      : ["- (none)"]),
  ].join("\n");

  ensureParentDir(auditMdPath);
  fs.writeFileSync(auditMdPath, `${markdown}\n`);
}

function writeGitArtifacts(changedFiles: string[], gitRoot: string | null) {
  if (!gitRoot) return;

  if (changedFiles.length === 0) {
    fs.writeFileSync(diffPath, "");
    fs.writeFileSync(statPath, "");
    return;
  }

  const relativeFiles = changedFiles.map((filePath) => path.relative(gitRoot, filePath));

  const diffResult = spawnSync("git", ["diff", "--", ...relativeFiles], {
    cwd: gitRoot,
    encoding: "utf-8",
  });
  const statResult = spawnSync("git", ["diff", "--stat", "--", ...relativeFiles], {
    cwd: gitRoot,
    encoding: "utf-8",
  });

  fs.writeFileSync(diffPath, diffResult.stdout ?? "");
  fs.writeFileSync(statPath, statResult.stdout ?? "");
}

function main() {
  if (!fs.existsSync(docsRoot)) {
    console.error(`❌ docs root not found: ${docsRoot}`);
    process.exit(1);
  }

  const before = snapshotMarkdown(docsRoot);
  const validatorStatus = runValidator();
  const after = snapshotMarkdown(docsRoot);
  const changedFiles = getChangedFiles(before, after);
  const gitRoot = getGitRoot(workspaceRoot);
  const validationReport = readValidationReport();
  const summary = buildSummary({
    docsRoot,
    reportJsonPath,
    changedFiles,
    gitRoot,
    validationReport,
  });
  writeSummaryFiles(summary);
  writeMetadataAuditFiles(validationReport);
  writeGitArtifacts(changedFiles, gitRoot);

  console.log("--- migration summary ---");
  console.log(`docs root: ${docsRoot}`);
  console.log(`json report: ${reportJsonPath}`);
  console.log(`summary json: ${summaryJsonPath}`);
  console.log(`summary md: ${summaryMdPath}`);
  console.log(`audit json: ${auditJsonPath}`);
  console.log(`audit md: ${auditMdPath}`);
  console.log(`git diff: ${diffPath}`);
  console.log(`git stat: ${statPath}`);
  console.log(`changed markdown files: ${changedFiles.length}`);

  for (const filePath of changedFiles) {
    console.log(`- ${path.relative(process.cwd(), filePath)}`);
  }

  if (validatorStatus !== 0) {
    process.exit(validatorStatus);
  }
}

main();
