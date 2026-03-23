/**
 * 섹션 전환 시 Fade Through Black 효과
 * - 현재 콘텐츠 fade out (8f) → 검은 화면 (3f) → 다음 콘텐츠 fade in (8f)
 */

import { AbsoluteFill, interpolate } from "remotion";
import type { TimelineScene } from "../types";
import {
  extractSectionTransitions,
  TRANSITION_FRAMES,
  FADE_OUT_FRAMES,
  FADE_BLACK_FRAMES,
} from "../lib/universe-coordinates";
import { UniverseStarfield } from "./UniverseStarfield";
import { useMemo } from "react";
import { useCurrentFrame } from "remotion";

interface Props {
  scenes: TimelineScene[];
  children: React.ReactNode;
}

export const UniverseCamera: React.FC<Props> = ({ scenes, children }) => {
  const frame = useCurrentFrame();

  const transitions = useMemo(() => {
    const sceneData = scenes.map((s) => ({
      section: s.section || "hook",
      startFrame: s.startFrame,
      durationFrames: s.durationFrames,
    }));
    return extractSectionTransitions(sceneData);
  }, [scenes]);

  const contentOpacity = useMemo(() => {
    for (const t of transitions) {
      if (frame >= t.transitionStartFrame && frame < t.transitionEndFrame) {
        const localFrame = frame - t.transitionStartFrame;

        if (localFrame < FADE_OUT_FRAMES) {
          return interpolate(localFrame, [0, FADE_OUT_FRAMES], [1, 0], {
            extrapolateRight: "clamp",
          });
        }
        if (localFrame < FADE_OUT_FRAMES + FADE_BLACK_FRAMES) {
          return 0;
        }
        return interpolate(
          localFrame,
          [FADE_OUT_FRAMES + FADE_BLACK_FRAMES, TRANSITION_FRAMES],
          [0, 1],
          { extrapolateLeft: "clamp" },
        );
      }
    }
    return 1;
  }, [frame, transitions]);

  return (
    <AbsoluteFill style={{ background: "#000000" }}>
      <UniverseStarfield />
      <div style={{ position: "absolute", inset: 0, opacity: contentOpacity }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
