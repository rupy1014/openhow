import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";

interface Props {
  scene: TimelineScene;
}

const STEP_COLORS = ["#4ade80", "#60a5fa", "#f472b6", "#fbbf24", "#a78bfa"];

export const FlowScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const steps = scene.steps || [];
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
          padding: "80px 100px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          {steps.map((step, index) => {
            const stepDelay = index * 8;
            const slideIn = spring({
              frame: frame - stepDelay,
              fps,
              config: { damping: 18, stiffness: 100 },
            });
            const stepFadeIn = interpolate(
              frame,
              [stepDelay, stepDelay + 10],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const stepOpacity = stepFadeIn * fadeOut;
            const color = STEP_COLORS[index % STEP_COLORS.length];

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                }}
              >
                <div
                  style={{
                    opacity: stepOpacity,
                    transform: `translateY(${interpolate(slideIn, [0, 1], [30, 0])}px)`,
                    border: `3px solid ${color}`,
                    borderRadius: 20,
                    padding: "36px 48px",
                    boxShadow: `0 0 40px ${color}30, 0 8px 24px rgba(0, 0, 0, 0.3)`,
                  }}
                >
                  <div
                    style={{
                      color: color,
                      fontSize: 32,
                      fontFamily: "Pretendard, sans-serif",
                      fontWeight: 700,
                      marginBottom: 8,
                      textShadow: `0 0 15px ${color}60`,
                    }}
                  >
                    STEP {index + 1}
                  </div>
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: 52,
                      fontFamily: "Pretendard, sans-serif",
                      fontWeight: 600,
                      textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    style={{
                      opacity: stepOpacity,
                      color: color,
                      fontSize: 72,
                      fontWeight: 300,
                      textShadow: `0 0 20px ${color}60`,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
