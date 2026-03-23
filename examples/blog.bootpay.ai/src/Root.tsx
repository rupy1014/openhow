import { Composition } from "remotion";
import { EpisodeVideo } from "./compositions/EpisodeVideo";
import type { TimelineData } from "./types";

// 타임라인 JSON 로드
import paymentPractical from "./data/payment-practical.json";

const timeline = paymentPractical as TimelineData;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EpisodeVideoAny = EpisodeVideo as React.FC<any>;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EpisodeVideo"
        component={EpisodeVideoAny}
        durationInFrames={timeline.totalFrames}
        fps={timeline.meta.fps}
        width={timeline.meta.width}
        height={timeline.meta.height}
        defaultProps={{
          timeline,
        }}
      />
    </>
  );
};
