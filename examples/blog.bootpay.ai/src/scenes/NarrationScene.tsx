import { AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";

interface Props {
  scene: TimelineScene;
}

/** 결제 도메인 섹션별 배경 블롭 색상 */
const SECTION_COLORS: Record<string, string[]> = {
  hook: ["#3b82f6", "#6366f1", "#fbbf24"],
  intro: ["#3b82f6", "#60a5fa", "#a78bfa"],
  pg: ["#10b981", "#059669", "#6366f1"],
  fee: ["#f59e0b", "#fbbf24", "#f472b6"],
  billing: ["#8b5cf6", "#a78bfa", "#3b82f6"],
  settlement: ["#22d3ee", "#06b6d4", "#a78bfa"],
  approval: ["#f472b6", "#ec4899", "#6366f1"],
  security: ["#ef4444", "#f97316", "#fbbf24"],
  operation: ["#4ade80", "#22c55e", "#3b82f6"],
  comparison: ["#60a5fa", "#3b82f6", "#fbbf24"],
  summary: ["#3b82f6", "#f472b6", "#fbbf24"],
};

const DEFAULT_COLORS = ["#3b82f6", "#6366f1", "#22d3ee"];

export const NarrationScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const FADE_IN_FRAMES = 10;
  const FADE_OUT_FRAMES = 8;
  const fadeIn = interpolate(frame, [0, FADE_IN_FRAMES], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - FADE_OUT_FRAMES, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const opacity = fadeIn * fadeOut;

  const displayText = scene.displayText || scene.tts || "";
  const isDuplicate = !!scene.highlight && scene.highlight === displayText;
  const showHighlight = !!scene.highlight;
  const showDisplayText = !isDuplicate;

  // 타이핑 애니메이션
  const typingStart = FADE_IN_FRAMES;
  const typingFrames = Math.max(1, Math.floor(scene.durationFrames * 0.1));
  const charsVisible = Math.floor(
    interpolate(frame, [typingStart, typingStart + typingFrames], [0, displayText.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

  const isTyping = charsVisible < displayText.length && frame >= typingStart;
  const cursorOpacity = isTyping
    ? interpolate(frame % 20, [0, 10, 20], [1, 0.2, 1], { extrapolateRight: "clamp" })
    : 0;

  // 하이라이트 페이드인
  const hlStart = Math.max(0, typingStart - 5);
  const hlProgress = showHighlight
    ? interpolate(frame, [hlStart, hlStart + 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  const seed = scene.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = SECTION_COLORS[scene.section || ""] || DEFAULT_COLORS;

  return (
    <AbsoluteFill>
      {/* 배경: 움직이는 그라디언트 블롭 */}
      {colors.map((color, i) => {
        const baseX = 20 + i * 30;
        const baseY = 30 + i * 20;
        const dx = Math.sin(frame * 0.015 + seed + i * 2.1) * 8;
        const dy = Math.cos(frame * 0.012 + seed + i * 1.7) * 6;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${baseX + dx}%`,
              top: `${baseY + dy}%`,
              width: 500 - i * 60,
              height: 500 - i * 60,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
              transform: "translate(-50%, -50%)",
              filter: "blur(80px)",
            }}
          />
        );
      })}

      {/* 배경 영상 또는 이미지 */}
      {scene.videoSrc ? (
        <OffthreadVideo
          src={staticFile(scene.videoSrc)}
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.3,
            filter: "blur(2px) saturate(0.7)",
          }}
        />
      ) : scene.image ? (
        <Img
          src={staticFile(scene.image)}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.12,
            filter: "blur(4px) saturate(0.6)",
          }}
        />
      ) : null}

      {/* 메인 콘텐츠 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "80px 120px",
          opacity,
        }}
      >
        {showHighlight && (
          <div
            style={{
              marginBottom: showDisplayText ? 24 : 0,
              opacity: hlProgress,
              transform: `translateY(${interpolate(hlProgress, [0, 1], [-8, 0])}px)`,
              color: "#3b82f6", // 부트페이 블루
              fontSize: isDuplicate ? 80 : 52,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 700,
              lineHeight: 1.4,
              textAlign: "center",
              maxWidth: 1500,
              textShadow:
                "0 0 20px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8)",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            {scene.highlight}
          </div>
        )}

        {showDisplayText && (
          <div
            style={{
              color: "#ffffff",
              fontSize: 80,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              lineHeight: 1.4,
              textAlign: "center",
              maxWidth: 1500,
              textShadow:
                "0 0 30px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.8)",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
            }}
          >
            <span>{displayText.substring(0, charsVisible)}</span>
            {isTyping && (
              <span
                style={{
                  opacity: cursorOpacity,
                  color: "#3b82f6",
                  fontWeight: 300,
                }}
              >
                |
              </span>
            )}
            <span style={{ opacity: 0 }}>{displayText.substring(charsVisible)}</span>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
