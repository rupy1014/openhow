// bootpay-youtube 영상 타입 정의
// ai-jobdori 기반, 1인 설명(narrator) 포맷에 맞게 단순화

export type SceneType =
  | "narration"       // 나레이션 (가장 많이 사용)
  | "stats"           // 통계/수치
  | "comparison"      // 비교표
  | "diagram"         // 다이어그램/로고
  | "flow"            // 흐름도/프로세스
  | "quote"           // 인용구/강조
  | "chart"           // 차트 (IR 스타일)
  | "screenshot"      // 스크린샷
  | "greeting";       // 인사 (캐릭터 이미지 + 립싱크)

export type SceneMode = "content" | "greeting";

// 1인 설명: speaker는 항상 "narrator"
export type Speaker = "narrator";

export interface TimelineScene {
  id: string;
  type: SceneType;
  mode: SceneMode;
  section: string;
  speaker?: Speaker;

  // Timing (frames)
  startFrame: number;
  durationFrames: number;

  // Audio
  audioSrc?: string;
  audioDurationSec?: number;
  audioVolume?: number;

  // Text
  tts?: string;
  displayText?: string;
  highlight?: string;
  source?: string;

  // Visuals
  image?: string;
  caption?: string;
  logos?: string[];
  videoSrc?: string;

  // Stats
  stat?: string;
  detail?: string;

  // Comparison
  items?: Array<{ name: string; value: string }>;

  // Flow
  steps?: string[];

  // Chart (IR 스타일)
  chartTitle?: string;
  chartData?: Array<{ label: string; value: number; highlight?: boolean }>;

  // Fixed duration (no TTS)
  durationSec?: number;
}

export interface BgmTrack {
  id: string;
  section: string;
  src: string;
  startFrame: number;
  durationFrames: number;
  volume: number;
  fadeInFrames: number;
  fadeOutFrames: number;
  startFromFrames?: number;
}

export interface TimelineData {
  meta: {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    episode: number;
    date: string;
    fps: number;
    width: number;
    height: number;
  };
  totalFrames: number;
  totalDurationSec: number;
  bgm: BgmTrack[];
  scenes: TimelineScene[];
}

// YAML 파일 구조
export interface EpisodeYAML {
  meta: {
    id: string;
    slug: string;
    title: string;
    subtitle?: string;
    episode?: number;
    created?: string;
  };
  youtube?: {
    tags: string[];
    description: string;
    thumbnail_text: string;
  };
  bgm?: Array<{
    section: string;
    src: string;
    volume: number;
    fade_in_sec: number;
    fade_out_sec: number;
    duration_sec?: number;
    start_from_sec?: number;
  }>;
  scenes: Array<{
    id: string;
    type: SceneType;
    mode: SceneMode;
    section: string;
    speaker?: Speaker;
    tts?: string;
    display_text?: string;
    duration_sec?: number;
    image?: string;
    caption?: string;
    logos?: string[];
    stat?: string;
    detail?: string;
    items?: Array<{ name: string; value: string }>;
    steps?: string[];
    chart_title?: string;
    chart_data?: Array<{ label: string; value: number; highlight?: boolean }>;
    highlight?: string;
    source?: string;
    lipsync?: boolean;
    video_src?: string;
  }>;
}

// TTS 매니페스트 구조
export interface TTSManifest {
  episode: string;
  title: string;
  generated_at: string;
  voice: string;
  speed: number;
  total_scenes: number;
  total_chars: number;
  total_est_sec: number;
  total_actual_sec: number;
  total_actual_min: number;
  scenes: Array<{
    id: string;
    file: string;
    section: string;
    chars: number;
    est_sec: number;
    actual_sec?: number;
  }>;
}
