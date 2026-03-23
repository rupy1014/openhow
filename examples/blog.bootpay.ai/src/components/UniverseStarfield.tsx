/**
 * 우주 배경 별 — 은은하게 반짝이는 별
 */

import { useCurrentFrame } from "remotion";

function seededRandom(seed: number): () => number {
  return () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

function generateStars(count: number, seed: number): Star[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: random() * 100,
    y: random() * 100,
    size: 0.5 + random() * 2.5,
    opacity: 0.2 + random() * 0.6,
    twinkleSpeed: 0.5 + random() * 2,
    twinklePhase: random() * Math.PI * 2,
  }));
}

const stars = generateStars(120, 42);

export const UniverseStarfield: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, #030308 0%, #0a0a1a 50%, #0f0f2d 100%)",
      }}
    >
      {stars.map((star, i) => {
        const twinkle =
          0.7 + 0.3 * Math.sin(frame * 0.05 * star.twinkleSpeed + star.twinklePhase);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: "50%",
              backgroundColor: `rgba(255, 255, 255, ${star.opacity * twinkle})`,
              boxShadow:
                star.size > 2
                  ? `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.4})`
                  : "none",
            }}
          />
        );
      })}
    </div>
  );
};
