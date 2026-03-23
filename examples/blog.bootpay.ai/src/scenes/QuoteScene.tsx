import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";
import { formatDisplayText } from "../lib/text-utils";

interface Props {
  scene: TimelineScene;
}

export const QuoteScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const scale = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });

  return (
    <AbsoluteFill>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "80px 120px",
          opacity,
          transform: `scale(${interpolate(scale, [0, 1], [0.95, 1])})`,
        }}
      >
        <div
          style={{
            borderRadius: 32,
            padding: "60px 80px",
            maxWidth: 1400,
            position: "relative",
            borderLeft: "6px solid #3b82f6",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 40,
              color: "#3b82f6",
              fontSize: 140,
              fontFamily: "Georgia, serif",
              opacity: 0.4,
              lineHeight: 1,
              textShadow: "0 0 30px rgba(59, 130, 246, 0.3)",
            }}
          >
            &ldquo;
          </div>

          <div
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              lineHeight: 1.5,
              textAlign: "center",
              textShadow: "0 0 20px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.8)",
              marginTop: 20,
            }}
          >
            {formatDisplayText(scene.displayText || scene.tts || "")}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
