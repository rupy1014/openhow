/**
 * 섹션 전환 타이밍 정의
 * - Fade Through Black: fade out → 검은 화면 → fade in
 */

export const FADE_OUT_FRAMES = 8;
export const FADE_BLACK_FRAMES = 3;
export const FADE_IN_FRAMES = 8;
export const TRANSITION_FRAMES = FADE_OUT_FRAMES + FADE_BLACK_FRAMES + FADE_IN_FRAMES;

export interface SectionTransition {
  fromSection: string;
  toSection: string;
  transitionStartFrame: number;
  transitionEndFrame: number;
}

export function extractSectionTransitions(
  scenes: Array<{ section: string; startFrame: number }>,
): SectionTransition[] {
  const transitions: SectionTransition[] = [];
  let prevSection = "";

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    if (scene.section !== prevSection && prevSection !== "") {
      transitions.push({
        fromSection: prevSection,
        toSection: scene.section,
        transitionStartFrame: scene.startFrame - TRANSITION_FRAMES,
        transitionEndFrame: scene.startFrame,
      });
    }
    prevSection = scene.section;
  }

  return transitions;
}
