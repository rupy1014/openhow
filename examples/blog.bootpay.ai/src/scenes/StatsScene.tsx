import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";
import { formatDisplayText } from "../lib/text-utils";

interface Props {
  scene: TimelineScene;
}

export const StatsScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  const fadeIn = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          opacity,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            color: "#3b82f6",
            fontSize: 220,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 800,
            letterSpacing: -4,
            textShadow: "0 0 80px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4), 0 4px 20px rgba(0, 0, 0, 0.8)",
          }}
        >
          {scene.stat}
        </div>

        {scene.detail && (
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 56,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              marginTop: 32,
              textShadow: "0 0 20px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.8)",
            }}
          >
            {formatDisplayText(scene.detail || "")}
          </div>
        )}

        {scene.source && (
          <div
            style={{
              color: "#64748b",
              fontSize: 32,
              fontFamily: "Pretendard, sans-serif",
              marginTop: 48,
              padding: "8px 24px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {scene.source}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
