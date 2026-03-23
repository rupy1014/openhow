/**
 * 좌측 상단 섹션 제목 오버레이
 * - 결제 도메인 섹션명 기본 제공
 */

import { useCurrentFrame, interpolate } from "remotion";
import type { TimelineScene } from "../types";
import { useMemo } from "react";

interface Props {
  scenes: TimelineScene[];
  rangeStart: number;
  sectionTitles?: Record<string, string>;
  excludeTypes?: string[];
}

// 결제 도메인 기본 섹션 표시명
const DEFAULT_SECTION_TITLES: Record<string, string> = {
  hook: "시작",
  intro: "소개",
  pg: "PG사",
  fee: "수수료",
  billing: "구독결제",
  settlement: "정산",
  approval: "심사/승인",
  security: "보안",
  operation: "운영",
  comparison: "비교",
  checklist: "체크리스트",
  summary: "정리",
  outro: "마무리",
};

const FADE_FRAMES = 12;

export const SectionTitleOverlay: React.FC<Props> = ({
  scenes,
  rangeStart,
  sectionTitles,
  excludeTypes,
}) => {
  const localFrame = useCurrentFrame();
  const globalFrame = rangeStart + localFrame;

  const titles = sectionTitles || DEFAULT_SECTION_TITLES;

  const currentScene = useMemo(() => {
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (globalFrame >= scenes[i].startFrame) {
        return scenes[i];
      }
    }
    return scenes[0];
  }, [globalFrame, scenes]);

  const currentSection = currentScene?.section;

  const sectionStartFrame = useMemo(() => {
    if (!currentSection) return 0;
    for (let i = scenes.length - 1; i >= 0; i--) {
      if (
        scenes[i].section === currentSection &&
        (i === 0 || scenes[i - 1].section !== currentSection)
      ) {
        return scenes[i].startFrame;
      }
    }
    return scenes[0]?.startFrame || 0;
  }, [currentSection, scenes]);

  if (!currentScene) return null;
  if (excludeTypes?.includes(currentScene.type)) return null;

  const displayTitle = titles[currentSection || ""] || "";
  if (!displayTitle) return null;

  const framesIntoSection = globalFrame - sectionStartFrame;
  const opacity = interpolate(framesIntoSection, [0, FADE_FRAMES], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 48,
        opacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 3,
          height: 28,
          borderRadius: 2,
          background: "rgba(59, 130, 246, 0.6)", // 부트페이 블루 계열
        }}
      />
      <span
        style={{
          fontFamily: "Pretendard, sans-serif",
          fontSize: 28,
          fontWeight: 600,
          color: "rgba(255, 255, 255, 0.7)",
          letterSpacing: "-0.02em",
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
        }}
      >
        {displayTitle}
      </span>
    </div>
  );
};
