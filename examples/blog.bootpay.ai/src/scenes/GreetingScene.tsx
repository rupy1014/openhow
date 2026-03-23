import { AbsoluteFill, Img, OffthreadVideo, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { TimelineScene } from "../types";

interface Props {
  scene: TimelineScene;
}

/**
 * 인사 씬 — 1인 설명 포맷
 * 립싱크 영상 또는 캐릭터 정적 이미지
 */
export const GreetingScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );
  const opacity = fadeIn * fadeOut;

  const imgScale = spring({ frame, fps, config: { damping: 30, stiffness: 80 } });
  const scale = interpolate(imgScale, [0, 1], [1.05, 1]);

  const textSpring = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 20, stiffness: 100 } });
  const textY = interpolate(textSpring, [0, 1], [40, 0]);

  const characterImage = scene.image || "assets/characters/narrator/narrator-01.png";
  const hasLipsyncVideo = !!scene.videoSrc;
  const hideNameTag = hasLipsyncVideo || scene.section === "intro" || scene.section === "outro";

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#000000" }} />

      <div style={{ position: "absolute", inset: 0, opacity }}>
        {hasLipsyncVideo ? (
          <OffthreadVideo
            src={staticFile(scene.videoSrc!)}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
            }}
          />
        ) : (
          <Img
            src={staticFile(characterImage)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top center",
              transform: `scale(${scale})`,
            }}
          />
        )}

        {!hideNameTag && (
          <>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "30%",
                background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 60,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                transform: `translateY(${textY}px)`,
              }}
            >
              <div
                style={{
                  color: "#3b82f6",
                  fontSize: 44,
                  fontFamily: "Pretendard, sans-serif",
                  fontWeight: 700,
                  letterSpacing: 6,
                  textShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
                }}
              >
                {scene.highlight || "부트페이"}
              </div>
            </div>
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};
