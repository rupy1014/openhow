/**
 * 섹션 컨테이너 — 씬을 뷰포트 크기로 배치
 */

import { useVideoConfig } from "remotion";

interface Props {
  section: string;
  children: React.ReactNode;
}

export const SectionContainer: React.FC<Props> = ({ children }) => {
  const { width, height } = useVideoConfig();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
      }}
    >
      {children}
    </div>
  );
};
