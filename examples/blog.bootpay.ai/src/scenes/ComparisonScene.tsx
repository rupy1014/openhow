import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";
import { formatDisplayText } from "../lib/text-utils";

interface Props {
  scene: TimelineScene;
}

const ACCENT_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"];

export const ComparisonScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const items = scene.items || [];
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "60px 100px",
        }}
      >
        {scene.displayText && (
          <div
            style={{
              color: "#ffffff",
              fontSize: 60,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              textAlign: "center",
              marginBottom: 48,
              opacity: fadeOut,
              textShadow: "0 0 30px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.8)",
            }}
          >
            {formatDisplayText(scene.displayText)}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            width: "100%",
            maxWidth: 1400,
          }}
        >
          {items.map((item, index) => {
            const itemDelay = index * 4;
            const slideIn = spring({
              frame: frame - itemDelay,
              fps,
              config: { damping: 20, stiffness: 120 },
            });
            const itemFadeIn = interpolate(
              frame,
              [itemDelay, itemDelay + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const itemOpacity = itemFadeIn * fadeOut;
            const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

            return (
              <div
                key={index}
                style={{
                  opacity: itemOpacity,
                  transform: `translateX(${interpolate(slideIn, [0, 1], [-50, 0])}px)`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: 20,
                  padding: "36px 48px",
                  borderLeft: `6px solid ${accentColor}`,
                  boxShadow: `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 40px ${accentColor}15`,
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <span
                  style={{
                    color: "#ffffff",
                    fontSize: 56,
                    fontFamily: "Pretendard, sans-serif",
                    fontWeight: 700,
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    color: accentColor,
                    fontSize: 52,
                    fontFamily: "Pretendard, sans-serif",
                    fontWeight: 600,
                    textAlign: "right",
                    maxWidth: 600,
                    textShadow: `0 0 20px ${accentColor}60`,
                  }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        {scene.source && (
          <div
            style={{
              color: "#64748b",
              fontSize: 28,
              fontFamily: "Pretendard, sans-serif",
              marginTop: 40,
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
