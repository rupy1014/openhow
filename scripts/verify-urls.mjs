#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONCURRENCY = 5;

function printUsage() {
  console.log(`Usage:
  node scripts/verify-urls.mjs --input urls.txt [--valid-out valid-links.txt] [--csv-out results.csv]
                               [--allow-domain example.com] [--concurrency 5] [--timeout-ms 8000]

Options:
  --input <path>           Text file with one URL per line. Lines starting with # are ignored.
  --valid-out <path>       Output file for reachable URLs. Default: <input-dir>/valid-links.txt
  --csv-out <path>         Output CSV for all checks. Default: <input-dir>/results.csv
  --allow-domain <domain>  Restrict checks to one or more allowed hostnames.
  --concurrency <number>   Max simultaneous checks. Default: 5
  --timeout-ms <number>    Per-request timeout in milliseconds. Default: 8000
  -h, --help               Show this help

Example:
  node scripts/verify-urls.mjs --input urls.txt --allow-domain docs.example.com`);
}

function parseArgs(argv) {
  const options = {
    allowDomains: [],
    concurrency: DEFAULT_CONCURRENCY,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '-h' || arg === '--help') {
      options.help = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      throw new Error(`Unknown argument: ${arg}`);
    }

    const next = argv[index + 1];
    if (next == null || next.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`);
    }

    switch (arg) {
      case '--input':
        options.input = next;
        break;
      case '--valid-out':
        options.validOut = next;
        break;
      case '--csv-out':
        options.csvOut = next;
        break;
      case '--allow-domain':
        options.allowDomains.push(next.toLowerCase());
        break;
      case '--concurrency':
        options.concurrency = Number.parseInt(next, 10);
        break;
      case '--timeout-ms':
        options.timeoutMs = Number.parseInt(next, 10);
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }

    index += 1;
  }

  if (!options.help && !options.input) {
    throw new Error('--input is required');
  }

  if (!Number.isInteger(options.concurrency) || options.concurrency < 1) {
    throw new Error('--concurrency must be a positive integer');
  }

  if (!Number.isInteger(options.timeoutMs) || options.timeoutMs < 1) {
    throw new Error('--timeout-ms must be a positive integer');
  }

  return options;
}

function normalizeUrl(rawUrl) {
  let parsed;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, note: 'invalid_url' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, note: 'unsupported_protocol' };
  }

  return { ok: true, url: parsed.toString(), hostname: parsed.hostname.toLowerCase() };
}

function csvEscape(value) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

async function fetchWithTimeout(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

async function checkUrl(url, timeoutMs) {
  try {
    let response = await fetchWithTimeout(url, { method: 'HEAD' }, timeoutMs);

    if (response.status === 405 || response.status === 501) {
      response = await fetchWithTimeout(
        url,
        {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
        },
        timeoutMs,
      );
    }

    return {
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      finalUrl: response.url,
      note: 'checked',
    };
  } catch (error) {
    return {
      ok: false,
      status: '',
      finalUrl: '',
      note: error instanceof Error ? error.name : 'request_failed',
    };
  }
}

async function runQueue(items, workerCount, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function consume() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, () => consume()));
  return results;
}

async function main() {
  let options;

  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`[error] ${error instanceof Error ? error.message : String(error)}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printUsage();
    return;
  }

  const inputPath = path.resolve(options.input);
  const baseDir = path.dirname(inputPath);
  const validOutPath = path.resolve(options.validOut ?? path.join(baseDir, 'valid-links.txt'));
  const csvOutPath = path.resolve(options.csvOut ?? path.join(baseDir, 'results.csv'));

  const rawContent = await readFile(inputPath, 'utf8');
  const entries = rawContent
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));

  const preparedEntries = entries.map((rawUrl) => {
    const normalized = normalizeUrl(rawUrl);
    if (!normalized.ok) {
      return {
        inputUrl: rawUrl,
        ok: false,
        status: '',
        finalUrl: '',
        note: normalized.note,
      };
    }

    if (
      options.allowDomains.length > 0 &&
      !options.allowDomains.includes(normalized.hostname)
    ) {
      return {
        inputUrl: normalized.url,
        ok: false,
        status: '',
        finalUrl: '',
        note: 'blocked_domain',
      };
    }

    return {
      inputUrl: normalized.url,
      hostname: normalized.hostname,
      pendingCheck: true,
    };
  });

  const pending = preparedEntries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.pendingCheck);

  const checked = await runQueue(pending, options.concurrency, async ({ entry, index }) => ({
    index,
    result: await checkUrl(entry.inputUrl, options.timeoutMs),
  }));

  for (const item of checked) {
    const target = preparedEntries[item.index];
    preparedEntries[item.index] = {
      inputUrl: target.inputUrl,
      ok: item.result.ok,
      status: item.result.status,
      finalUrl: item.result.finalUrl,
      note: item.result.note,
    };
  }

  const validUrls = preparedEntries.filter((entry) => entry.ok).map((entry) => entry.inputUrl);
  const csvRows = [
    ['input_url', 'ok', 'status', 'final_url', 'note'],
    ...preparedEntries.map((entry) => [
      entry.inputUrl,
      entry.ok,
      entry.status,
      entry.finalUrl,
      entry.note,
    ]),
  ];

  await writeFile(validOutPath, validUrls.join('\n') + (validUrls.length > 0 ? '\n' : ''), 'utf8');
  await writeFile(
    csvOutPath,
    csvRows.map((row) => row.map(csvEscape).join(',')).join('\n') + '\n',
    'utf8',
  );

  const summary = [
    `[ok] checked ${preparedEntries.length} URL(s)`,
    `[ok] reachable URLs: ${validUrls.length}`,
    `[ok] valid list: ${validOutPath}`,
    `[ok] csv report: ${csvOutPath}`,
  ];

  console.log(summary.join('\n'));
}

await main();
