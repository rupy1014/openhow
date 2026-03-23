import { AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import type { TimelineData, TimelineScene, BgmTrack } from "../types";
import { NarrationScene } from "../scenes/NarrationScene";
import { StatsScene } from "../scenes/StatsScene";
import { ComparisonScene } from "../scenes/ComparisonScene";
import { QuoteScene } from "../scenes/QuoteScene";
import { FlowScene } from "../scenes/FlowScene";
import { DiagramScene } from "../scenes/DiagramScene";
import { ChartScene } from "../scenes/ChartScene";
import { ScreenshotScene } from "../scenes/ScreenshotScene";
import { GreetingScene } from "../scenes/GreetingScene";
import { UniverseCamera } from "../components/UniverseCamera";
import { SectionContainer } from "../components/SectionContainer";
import { SectionTitleOverlay } from "../components/SectionTitleOverlay";
import { useMemo } from "react";

interface Props {
  timeline: TimelineData;
}

export const EpisodeVideo: React.FC<Props> = ({ timeline }) => {

  // 씬을 모드별로 분류 (1인 설명: student 없음, video-call 없음)
  const { contentScenes, greetingScenes } = useMemo(() => {
    const contentScenes: TimelineScene[] = [];
    const greetingScenes: TimelineScene[] = [];

    timeline.scenes.forEach((scene) => {
      if (scene.type === "greeting") {
        greetingScenes.push(scene);
      } else {
        contentScenes.push(scene);
      }
    });

    return { contentScenes, greetingScenes };
  }, [timeline.scenes]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* 레이어 1: 우주 카메라 시스템 (content 모드) */}
      {contentScenes.length > 0 && (
        <UniverseCamera scenes={contentScenes}>
          {contentScenes.map((scene) => (
            <Sequence
              key={scene.id}
              from={scene.startFrame}
              durationInFrames={scene.durationFrames}
            >
              <SectionContainer section={scene.section || "hook"}>
                <SceneRenderer scene={scene} />
              </SectionContainer>
            </Sequence>
          ))}
        </UniverseCamera>
      )}

      {/* 레이어 2: 인사 씬 (전체 화면, 우주 카메라 위) */}
      {greetingScenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationFrames}
        >
          <GreetingScene scene={scene} />
        </Sequence>
      ))}

      {/* 레이어 3: 섹션 제목 오버레이 (greeting 제외) */}
      <Sequence
        from={0}
        durationInFrames={timeline.totalFrames}
      >
        <SectionTitleOverlay
          scenes={timeline.scenes}
          rangeStart={0}
          excludeTypes={["greeting"]}
        />
      </Sequence>

      {/* 레이어 4: 자막은 YouTube SRT로 대체 (npm run srt) */}

      {/* Scene Audio (TTS) */}
      {timeline.scenes
        .filter((scene) => scene.audioSrc)
        .map((scene) => (
          <Sequence
            key={`audio-${scene.id}`}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            <Audio src={staticFile(scene.audioSrc!)} volume={scene.audioVolume ?? 1} />
          </Sequence>
        ))}

      {/* BGM Tracks with Fade In/Out */}
      {timeline.bgm?.map((bgm) => (
        <Sequence
          key={bgm.id}
          from={bgm.startFrame}
          durationInFrames={bgm.durationFrames}
        >
          <BgmAudio bgm={bgm} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// 씬 렌더러
const SceneRenderer: React.FC<{ scene: TimelineScene }> = ({ scene }) => {
  switch (scene.type) {
    case "narration":
      return <NarrationScene scene={scene} />;
    case "stats":
      return <StatsScene scene={scene} />;
    case "comparison":
      return <ComparisonScene scene={scene} />;
    case "quote":
      return <QuoteScene scene={scene} />;
    case "flow":
      return <FlowScene scene={scene} />;
    case "diagram":
      return <DiagramScene scene={scene} />;
    case "chart":
      return <ChartScene scene={scene} />;
    case "screenshot":
      return <ScreenshotScene scene={scene} />;
    case "greeting":
      return <GreetingScene scene={scene} />;
    default:
      return <NarrationScene scene={scene} />;
  }
};

// BGM 오디오 컴포넌트 (페이드 인/아웃 처리)
const BgmAudio: React.FC<{ bgm: BgmTrack }> = ({ bgm }) => {
  const frame = useCurrentFrame();
  const volume = interpolate(
    frame,
    [
      0,
      bgm.fadeInFrames,
      bgm.durationFrames - bgm.fadeOutFrames,
      bgm.durationFrames,
    ],
    [0, bgm.volume, bgm.volume, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return <Audio src={staticFile(bgm.src)} volume={volume} startFrom={bgm.startFromFrames ?? 0} />;
};
