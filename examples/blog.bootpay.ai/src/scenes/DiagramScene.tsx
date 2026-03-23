import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";
import { ImageWithFallback } from "../components/ImageWithFallback";

interface Props {
  scene: TimelineScene;
}

// 결제 도메인 로고 이름 매핑
function getLogoDisplayName(logoPath: string): string {
  const filename = logoPath.split("/").pop()?.replace(".png", "").replace(".svg", "") || "";
  const names: Record<string, string> = {
    bootpay: "Bootpay",
    toss: "토스페이먼츠",
    "toss-payments": "토스페이먼츠",
    kcp: "NHN KCP",
    inicis: "KG이니시스",
    nice: "나이스페이먼츠",
    stripe: "Stripe",
    paddle: "Paddle",
  };
  return names[filename.toLowerCase()] || filename;
}

export const DiagramScene: React.FC<Props> = ({ scene }) => {
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

  // PG사 로고 색상
  const PG_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

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
          opacity,
          transform: `scale(${interpolate(scale, [0, 1], [0.95, 1])})`,
        }}
      >
        {scene.logos && scene.logos.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: 80,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {scene.logos.map((logo, index) => {
              const activationStart = 40 + index * 25;
              const activationPeak = activationStart + 15;
              const activationEnd = activationStart + 50;

              const activationIntensity = interpolate(
                frame,
                [activationStart, activationPeak, activationEnd],
                [0, 1, 0.3],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              const appearProgress = interpolate(
                frame,
                [index * 10, index * 10 + 15],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              const displayName = getLogoDisplayName(logo);
              const accentColor = PG_COLORS[index % PG_COLORS.length];

              return (
                <div
                  key={logo}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                    opacity: appearProgress,
                    transform: `translateY(${interpolate(appearProgress, [0, 1], [30, 0])}px) scale(${1 + activationIntensity * 0.1})`,
                  }}
                >
                  <div
                    style={{
                      width: 180,
                      height: 180,
                      borderRadius: 32,
                      background: `rgba(255, 255, 255, ${0.08 + activationIntensity * 0.12})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `3px solid rgba(255, 255, 255, ${0.15 + activationIntensity * 0.4})`,
                      boxShadow: activationIntensity > 0.3
                        ? `0 0 40px ${accentColor}60, 0 8px 32px rgba(0, 0, 0, 0.5)`
                        : "0 8px 32px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <ImageWithFallback
                      src={logo}
                      alt={displayName}
                      fallbackText={displayName}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      color: activationIntensity > 0.3 ? accentColor : "#ffffff",
                      fontSize: 40,
                      fontFamily: "Pretendard, sans-serif",
                      fontWeight: 700,
                      textShadow: activationIntensity > 0.3
                        ? `0 0 20px ${accentColor}80`
                        : "0 2px 8px rgba(0, 0, 0, 0.8)",
                      letterSpacing: 1,
                    }}
                  >
                    {displayName}
                  </div>
                </div>
              );
            })}
          </div>
        ) : scene.image ? (
          <div
            style={{
              borderRadius: 24,
              padding: 40,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 60px rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <ImageWithFallback
              src={scene.image}
              alt={scene.displayText || "Diagram"}
              fallbackText={scene.displayText || scene.caption}
              style={{
                maxWidth: 1600,
                maxHeight: 700,
                objectFit: "contain",
                borderRadius: 16,
              }}
            />
          </div>
        ) : (
          <div
            style={{
              borderRadius: 24,
              padding: "60px 80px",
              border: "2px solid rgba(59, 130, 246, 0.4)",
              boxShadow: "0 0 60px rgba(59, 130, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                color: "#ffffff",
                fontSize: 72,
                fontFamily: "Pretendard, sans-serif",
                fontWeight: 600,
                textAlign: "center",
                textShadow: "0 0 20px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.8)",
              }}
            >
              {scene.displayText || "Diagram"}
            </div>
          </div>
        )}

        {scene.image && scene.displayText && (
          <div
            style={{
              color: "#e2e8f0",
              fontSize: 44,
              fontFamily: "Pretendard, sans-serif",
              fontWeight: 500,
              marginTop: 32,
              textAlign: "center",
              textShadow: "0 0 20px rgba(255, 255, 255, 0.1), 0 2px 8px rgba(0, 0, 0, 0.8)",
            }}
          >
            {scene.displayText}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
