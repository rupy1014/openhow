import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import YAML from "yaml";
import type {
  EpisodeYAML,
  TTSManifest,
  TimelineData,
  TimelineScene,
  BgmTrack,
} from "../../src/types";

// ── Config ──────────────────────────────────────────
const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

// 1인 설명 → 씬 간 패딩 (무음편집 스타일)
const PADDING_SEC = 0.15; // 씬 간 최소 여유

// ── Main ────────────────────────────────────────────
function main() {
  const args = process.argv.filter((a) => !a.startsWith("--"));
  const slugArg = args[2];

  let yamlPath: string;
  if (slugArg && fs.existsSync(slugArg)) {
    yamlPath = slugArg;
  } else {
    const slug = slugArg || "payment-practical";
    yamlPath = path.join(__dirname, `../../video/scenes/${slug}.yaml`);
  }

  if (!fs.existsSync(yamlPath)) {
    console.error(`❌ YAML not found: ${yamlPath}`);
    process.exit(1);
  }

  const yamlContent = fs.readFileSync(yamlPath, "utf-8");
  const yaml = YAML.parse(yamlContent) as EpisodeYAML;

  console.log(`📄 Loading: ${yamlPath}`);
  console.log(`   Episode: ${yaml.meta.title}`);

  // TTS 매니페스트 로드
  const manifestPath = path.join(
    __dirname,
    `../../public/audio/${yaml.meta.slug}/_manifest.json`
  );
  let manifest: TTSManifest | null = null;

  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      console.log(
        `   TTS Manifest: ${manifest!.total_scenes} scenes, ${manifest!.total_actual_sec}초`
      );
    } catch (err) {
      console.warn(`   ⚠️ Manifest 파싱 실패: ${(err as Error).message}`);
    }
  } else {
    console.log(`   ⚠️ TTS Manifest not found → est_sec 사용`);
  }

  // 씬별 오디오 길이 매핑
  const audioDurations = new Map<string, number>();
  if (manifest) {
    for (const scene of manifest.scenes) {
      const duration = scene.actual_sec ?? scene.est_sec;
      audioDurations.set(scene.id, duration);
    }
  }

  // 타임라인 빌드
  let currentFrame = 0;
  const timelineScenes: TimelineScene[] = [];
  const warnings: string[] = [];

  for (let i = 0; i < yaml.scenes.length; i++) {
    const scene = yaml.scenes[i];

    let durationSec: number;

    if (scene.tts && audioDurations.has(scene.id)) {
      durationSec = audioDurations.get(scene.id)!;
    } else if (scene.duration_sec) {
      durationSec = scene.duration_sec;
    } else if (scene.tts) {
      const estSec = Math.round(scene.tts.replace(/\s/g, "").length / 3.5);
      durationSec = estSec;
      warnings.push(`⚠️ ${scene.id}: actual_sec 없음, est_sec(${estSec}s) 사용`);
    } else {
      durationSec = 3;
      warnings.push(`⚠️ ${scene.id}: duration 없음, 기본값 3초`);
    }

    const durationFrames = Math.round(durationSec * FPS);

    // 씬 간 패딩 (첫 씬 제외)
    const gapFrames = i === 0 ? 0 : Math.round(PADDING_SEC * FPS);
    const startFrame = currentFrame + gapFrames;

    // mode 결정: greeting 타입은 greeting, 나머지는 content
    const mode = scene.type === "greeting" ? "greeting" : "content";

    const timelineScene: TimelineScene = {
      id: scene.id,
      type: scene.type,
      mode: mode as "content" | "greeting",
      section: scene.section,
      speaker: scene.speaker || "narrator",
      startFrame,
      durationFrames,
      tts: scene.tts,
      displayText: scene.display_text,
      highlight: scene.highlight,
      source: scene.source,
      image: scene.image,
      caption: scene.caption,
      logos: scene.logos,
      stat: scene.stat,
      detail: scene.detail,
      items: scene.items,
      steps: scene.steps,
      chartTitle: scene.chart_title,
      chartData: scene.chart_data,
      durationSec: scene.duration_sec,
    };

    // 오디오 소스
    if (scene.tts && manifest) {
      const manifestScene = manifest.scenes.find((s) => s.id === scene.id);
      if (manifestScene) {
        timelineScene.audioSrc = `audio/${yaml.meta.slug}/${manifestScene.file}`;
        timelineScene.audioDurationSec =
          manifestScene.actual_sec ?? manifestScene.est_sec;
      }
    }

    // 립싱크 영상
    if (scene.lipsync) {
      const videoPath = path.join(
        __dirname,
        `../../public/video/${yaml.meta.slug}/${scene.id}.mp4`
      );
      if (fs.existsSync(videoPath)) {
        timelineScene.videoSrc = `video/${yaml.meta.slug}/${scene.id}.mp4`;
      } else {
        warnings.push(`⚠️ ${scene.id}: lipsync=true이지만 영상 없음`);
      }
    }

    timelineScenes.push(timelineScene);
    currentFrame = startFrame + durationFrames;
  }

  // BGM 트랙 빌드
  const bgmTracks: BgmTrack[] = [];
  if (yaml.bgm) {
    for (let i = 0; i < yaml.bgm.length; i++) {
      const bgmConfig = yaml.bgm[i];

      const sectionScenes = timelineScenes.filter(
        (s) => s.section === bgmConfig.section
      );
      if (sectionScenes.length === 0) {
        warnings.push(`⚠️ BGM: "${bgmConfig.section}" 섹션 없음`);
        continue;
      }

      const lastScene = sectionScenes[sectionScenes.length - 1];
      const sectionEndFrame = lastScene.startFrame + lastScene.durationFrames;
      const sectionStartFrame = sectionScenes[0].startFrame;

      const durationFrames = bgmConfig.duration_sec
        ? Math.round(bgmConfig.duration_sec * FPS)
        : sectionEndFrame - sectionStartFrame;

      const track: BgmTrack = {
        id: `bgm-${i + 1}`,
        section: bgmConfig.section,
        src: bgmConfig.src,
        startFrame: sectionStartFrame,
        durationFrames,
        volume: bgmConfig.volume,
        fadeInFrames: Math.round(bgmConfig.fade_in_sec * FPS),
        fadeOutFrames: Math.round(bgmConfig.fade_out_sec * FPS),
        ...(bgmConfig.start_from_sec
          ? { startFromFrames: Math.round(bgmConfig.start_from_sec * FPS) }
          : {}),
      };
      bgmTracks.push(track);
    }
  }

  // 타임라인 데이터 생성
  const totalFrames = currentFrame;
  const totalDurationSec = totalFrames / FPS;

  const timelineData: TimelineData = {
    meta: {
      id: yaml.meta.id,
      slug: yaml.meta.slug,
      title: yaml.meta.title,
      subtitle: yaml.meta.subtitle || "",
      episode: yaml.meta.episode || 1,
      date: new Date().toISOString().split("T")[0],
      fps: FPS,
      width: WIDTH,
      height: HEIGHT,
    },
    totalFrames,
    totalDurationSec: Math.round(totalDurationSec * 10) / 10,
    bgm: bgmTracks,
    scenes: timelineScenes,
  };

  // 출력
  const outputDir = path.join(__dirname, "../../src/data");
  fs.mkdirSync(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, `${yaml.meta.slug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(timelineData, null, 2));

  console.log(`\n✅ Timeline built: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   총 씬: ${timelineScenes.length}개`);
  console.log(`   총 프레임: ${totalFrames}`);
  console.log(
    `   총 시간: ${Math.floor(totalDurationSec / 60)}분 ${Math.round(totalDurationSec % 60)}초`
  );

  if (bgmTracks.length > 0) {
    console.log(`\n🎵 BGM:`);
    for (const bgm of bgmTracks) {
      const startSec = bgm.startFrame / FPS;
      const endSec = (bgm.startFrame + bgm.durationFrames) / FPS;
      console.log(
        `   ${bgm.section}: ${formatTime(startSec)} ~ ${formatTime(endSec)}`
      );
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️ Warnings (${warnings.length}):`);
    for (const w of warnings) {
      console.log(`   ${w}`);
    }
  }

  // 검증
  console.log(`\n🔍 Validation:`);
  const lengthOk = totalDurationSec >= 300 && totalDurationSec <= 900;
  console.log(
    `   영상 길이: ${lengthOk ? "✅" : "⚠️"} (${(totalDurationSec / 60).toFixed(1)}분)`
  );
  console.log(`   BGM 구간: ${bgmTracks.length >= 1 ? "✅" : "⚠️"} (${bgmTracks.length}개)`);
}

function formatTime(sec: number): string {
  const min = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${min}:${s.toString().padStart(2, "0")}`;
}

main();
