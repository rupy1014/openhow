import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import YAML from "yaml";

// ── Config ──────────────────────────────────────────
const KIE_API_KEY = process.env.KIE_AI_API_KEY;
const KIE_BASE_URL = "https://api.kie.ai/api/v1/jobs";
const DRY_RUN = process.argv.includes("--dry-run");
const ONLY_ARG = process.argv.find((a) => a.startsWith("--only="));
const ONLY_IDS: Set<string> | null = ONLY_ARG
  ? new Set(ONLY_ARG.replace("--only=", "").split(","))
  : null;

// 1인 설명 — narrator만 사용 (kie.ai 경유 ElevenLabs)
const VOICE = {
  id: process.env.KIE_VOICE_ID || "Chris",
  name: "태섭",
  settings: {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.3,
  },
};

const SPEED = 1.0;
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 120000;

// ── Types ───────────────────────────────────────────
interface Scene {
  id: string;
  type: string;
  mode: string;
  section: string;
  speaker?: string;
  tts: string;
  display_text?: string;
  duration_sec?: number;
}

interface EpisodeYAML {
  meta: {
    id: string;
    slug: string;
    title: string;
  };
  scenes: Scene[];
}

// ── Helpers ─────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── YAML Parser ─────────────────────────────────────
function loadScenes(yamlPath: string) {
  const raw = fs.readFileSync(yamlPath, "utf-8");
  const parsed = YAML.parse(raw) as EpisodeYAML;

  const scenes = parsed.scenes.filter((s) => s.tts && s.tts.trim().length > 0);

  const totalChars = scenes.reduce((sum, s) => sum + s.tts.length, 0);
  const cost = totalChars * 0.000167;

  console.log(`📄 Loaded: ${yamlPath}`);
  console.log(`   Total scenes: ${parsed.scenes.length}`);
  console.log(`   With TTS: ${scenes.length}`);
  console.log(`   Narrator (kie.ai → ElevenLabs): ${scenes.length}씬, ${totalChars}자`);
  console.log(`\n💰 예상 비용: ~$${cost.toFixed(3)}\n`);

  return { meta: parsed.meta, scenes, costEstimate: cost };
}

// ── kie.ai TTS (비동기: createTask → poll → download) ──
async function createTTSTask(text: string): Promise<string> {
  const res = await fetch(`${KIE_BASE_URL}/createTask`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "elevenlabs/text-to-speech-multilingual-v2",
      input: {
        text,
        voice: VOICE.id,
        speed: SPEED,
        language_code: "ko",
      },
    }),
  });

  const responseText = await res.text();
  if (!res.ok) {
    throw new Error(`kie.ai createTask error: ${res.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText) as {
    data?: { taskId?: string; task_id?: string };
  };
  const taskId = data?.data?.taskId || data?.data?.task_id;
  if (!taskId) throw new Error(`No taskId in response: ${responseText}`);
  return taskId;
}

async function pollTask(taskId: string): Promise<string> {
  const startTime = Date.now();

  while (Date.now() - startTime < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(`${KIE_BASE_URL}/recordInfo?taskId=${taskId}`, {
      headers: { Authorization: `Bearer ${KIE_API_KEY}` },
    });

    if (!res.ok) {
      console.warn(`⚠️  Poll error for ${taskId}: ${res.status}`);
      continue;
    }

    const data = (await res.json()) as {
      data?: {
        state?: string;
        status?: string;
        resultJson?: string;
        works?: Array<{ resource?: { url?: string } }>;
      };
    };

    const state = data?.data?.state || data?.data?.status;

    if (state === "success" || state === "completed" || state === "succeed") {
      let audioUrl: string | undefined;

      // resultJson에서 URL 추출
      if (data?.data?.resultJson) {
        try {
          const result = JSON.parse(data.data.resultJson) as {
            resultUrls?: string[];
          };
          audioUrl = result?.resultUrls?.[0];
        } catch {}
      }

      // fallback: works 배열
      if (!audioUrl) {
        audioUrl = data?.data?.works?.[0]?.resource?.url;
      }

      if (!audioUrl)
        throw new Error(
          `Task ${taskId} completed but no audio URL: ${JSON.stringify(data)}`
        );
      return audioUrl;
    }

    if (state === "failed" || state === "error") {
      throw new Error(`Task ${taskId} failed: ${JSON.stringify(data)}`);
    }
  }

  throw new Error(`Task ${taskId} timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

async function downloadFile(
  url: string,
  outputPath: string
): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return Math.round(buffer.byteLength / 1024);
}

// ── TTS Generator ───────────────────────────────────
async function generateTTS(
  text: string,
  filename: string,
  outputDir: string
): Promise<{ sizeKB: number; actualSec: number | undefined }> {
  const outputPath = path.join(outputDir, filename);

  // 1. createTask
  const taskId = await createTTSTask(text);

  // 2. poll until done
  const audioUrl = await pollTask(taskId);

  // 3. download
  const sizeKB = await downloadFile(audioUrl, outputPath);

  // 4. measure duration
  let actualSec: number | undefined;
  try {
    const dur = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${outputPath}"`,
      { encoding: "utf-8" }
    ).trim();
    actualSec = Math.round(parseFloat(dur) * 100) / 100;
  } catch {}

  return { sizeKB, actualSec };
}

// ── Duration estimation ─────────────────────────────
function estimateDuration(text: string): number {
  const syllables = text.replace(/\s/g, "").length;
  return Math.round(syllables / 3.5);
}

// ── Main ────────────────────────────────────────────
async function main() {
  const args = process.argv.filter((a) => !a.startsWith("--"));
  const yamlArg = args[2];

  let yamlPath: string;
  if (yamlArg && fs.existsSync(yamlArg)) {
    yamlPath = yamlArg;
  } else {
    const slug = yamlArg || "payment-getting-started";
    yamlPath = path.join(__dirname, `../../video/scenes/${slug}.yaml`);
  }

  if (!fs.existsSync(yamlPath)) {
    console.error(`❌ YAML not found: ${yamlPath}`);
    process.exit(1);
  }

  if (!DRY_RUN && !KIE_API_KEY) {
    console.error("❌ KIE_AI_API_KEY not found in .env");
    process.exit(1);
  }

  const { meta, scenes, costEstimate } = loadScenes(yamlPath);
  const outputDir = path.join(__dirname, `../../public/audio/${meta.slug}`);

  if (!DRY_RUN) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (DRY_RUN) {
    console.log("🏃 DRY RUN — TTS API를 호출하지 않습니다.\n");
  }

  if (ONLY_IDS) {
    console.log(`🎯 선택적 재생성: ${[...ONLY_IDS].join(", ")}\n`);
  }

  console.log(`🎙️  Generating TTS for: ${meta.title}`);
  console.log(`📂 Output: ${outputDir}\n`);

  // 기존 매니페스트 로드
  const existingManifestPath = path.join(outputDir, "_manifest.json");
  let existingManifest: Record<string, { actual_sec?: number }> = {};
  if (ONLY_IDS && fs.existsSync(existingManifestPath)) {
    try {
      const existing = JSON.parse(
        fs.readFileSync(existingManifestPath, "utf-8")
      );
      for (const s of existing.scenes || []) {
        existingManifest[s.id] = { actual_sec: s.actual_sec };
      }
    } catch {}
  }

  let totalChars = 0;
  let totalEstSec = 0;
  let totalActualSec = 0;
  let generatedCount = 0;
  let skippedCount = 0;
  const manifest: Array<{
    id: string;
    file: string;
    section: string;
    chars: number;
    est_sec: number;
    actual_sec?: number;
  }> = [];

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const filename = `${String(i + 1).padStart(3, "0")}-${scene.id}.mp3`;
    const chars = scene.tts.length;
    const estSec = estimateDuration(scene.tts);

    totalChars += chars;
    totalEstSec += estSec;

    let actualSec: number | undefined;

    // --only 모드: 대상이 아닌 씬은 스킵
    if (ONLY_IDS && !ONLY_IDS.has(scene.id)) {
      const existing = existingManifest[scene.id];
      actualSec = existing?.actual_sec;
      if (actualSec) totalActualSec += actualSec;
      skippedCount++;
      manifest.push({
        id: scene.id,
        file: filename,
        section: scene.section,
        chars,
        est_sec: estSec,
        actual_sec: actualSec,
      });
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `  [${i + 1}/${scenes.length}] ${scene.id} (${VOICE.name}/kie.ai) — ${chars}자, ~${estSec}초 → ${filename}`
      );
    } else {
      try {
        const result = await generateTTS(scene.tts, filename, outputDir);
        actualSec = result.actualSec;
        if (actualSec) totalActualSec += actualSec;
        generatedCount++;
        console.log(
          `  ✅ [${i + 1}/${scenes.length}] ${scene.id} (${VOICE.name}/kie.ai) — ${chars}자, ${result.sizeKB}KB, ${actualSec?.toFixed(1) ?? "?"}s → ${filename}`
        );
      } catch (error) {
        console.error(
          `  ❌ [${i + 1}/${scenes.length}] ${scene.id}:`,
          error
        );
        continue;
      }
    }

    manifest.push({
      id: scene.id,
      file: filename,
      section: scene.section,
      chars,
      est_sec: estSec,
      actual_sec: actualSec,
    });
  }

  // 매니페스트 저장
  const manifestPath = path.join(outputDir, "_manifest.json");
  const manifestData = {
    episode: meta.slug,
    title: meta.title,
    generated_at: new Date().toISOString(),
    voice: {
      provider: "kie.ai (elevenlabs)",
      id: VOICE.id,
      name: VOICE.name,
    },
    speed: SPEED,
    total_scenes: manifest.length,
    total_chars: totalChars,
    total_est_sec: totalEstSec,
    total_actual_sec: Math.round(totalActualSec * 10) / 10,
    total_actual_min: Math.round((totalActualSec / 60) * 10) / 10,
    cost_estimate_usd: Math.round(costEstimate * 1000) / 1000,
    scenes: manifest,
  };

  if (!DRY_RUN) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
    console.log(`\n📋 Manifest: ${manifestPath}`);
  } else {
    console.log(`\n📋 Manifest (dry-run):`);
    console.log(JSON.stringify(manifestData, null, 2));
  }

  console.log(`\n🎉 Done!`);
  if (ONLY_IDS) {
    console.log(
      `   생성: ${generatedCount}개 씬, 스킵: ${skippedCount}개 씬`
    );
  }
  console.log(`   총 ${manifest.length}개 씬, ${totalChars}자`);
  console.log(
    `   예상 길이: ~${Math.round((totalEstSec / 60) * 10) / 10}분`
  );
}

main();
