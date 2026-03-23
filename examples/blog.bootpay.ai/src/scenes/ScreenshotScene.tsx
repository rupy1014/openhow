import { AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";
import { ImageWithFallback } from "../components/ImageWithFallback";
import { formatDisplayText } from "../lib/text-utils";

interface Props {
  scene: TimelineScene;
}

export const ScreenshotScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const slideIn = interpolate(frame, [0, 15], [30, 0], {
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });

  const imagePath = scene.image?.startsWith("/")
    ? scene.image.slice(1)
    : scene.image;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 100px",
        opacity,
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 1400,
          maxHeight: 700,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 100px rgba(59, 130, 246, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transform: `translateY(${slideIn}px)`,
        }}
      >
        <div
          style={{
            background: "rgba(30, 30, 50, 0.95)",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          </div>
          {scene.caption && (
            <div
              style={{
                marginLeft: 12,
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: 14,
                fontFamily: "Pretendard, sans-serif",
              }}
            >
              {scene.caption}
            </div>
          )}
        </div>

        {scene.videoSrc ? (
          <OffthreadVideo
            src={staticFile(scene.videoSrc)}
            muted
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              minWidth: 1200,
              minHeight: 500,
              objectFit: "cover",
            }}
          />
        ) : (
          <ImageWithFallback
            src={imagePath || ""}
            alt={scene.caption || "Screenshot"}
            fallbackText={scene.caption || "스크린샷 준비 중"}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              minWidth: 1200,
              minHeight: 500,
            }}
          />
        )}
      </div>

      {scene.displayText && (
        <div
          style={{
            marginTop: 32,
            color: "#ffffff",
            fontSize: 60,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 500,
            textAlign: "center",
            textShadow: "0 0 30px rgba(255, 255, 255, 0.1), 0 4px 12px rgba(0, 0, 0, 0.8)",
          }}
        >
          {formatDisplayText(scene.displayText || "")}
        </div>
      )}
    </AbsoluteFill>
  );
};
