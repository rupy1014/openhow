import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { TimelineScene } from "../types";

interface Props {
  scene: TimelineScene;
}

const BAR_FILL = "rgba(59, 130, 246, 0.3)";
const BAR_STROKE = "rgba(59, 130, 246, 0.6)";
const HIGHLIGHT_FILL = "rgba(34, 211, 238, 0.4)";
const HIGHLIGHT_STROKE = "rgba(34, 211, 238, 0.8)";
const LINE_COLOR = "#3b82f6";
const DOT_COLOR = "#ffffff";

export const ChartScene: React.FC<Props> = ({ scene }) => {
  const frame = useCurrentFrame();
  const chartData = scene.chartData || [];

  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const barAnimationProgress = interpolate(
    frame,
    [15, 75],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const lineAnimationProgress = interpolate(
    frame,
    [60, 100],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const animatedData = chartData.map((item: { label: string; value: number; highlight?: boolean }, index: number) => {
    const barDelay = index * 0.12;
    const adjustedProgress = Math.max(0, Math.min(1, (barAnimationProgress - barDelay) / (1 - barDelay * 0.5)));
    const easedProgress = adjustedProgress === 1 ? 1 : 1 - Math.pow(2, -10 * adjustedProgress);

    const lineDelay = index / chartData.length;
    const lineVisible = lineAnimationProgress > lineDelay ? 1 : 0;

    return {
      ...item,
      animatedValue: item.value * easedProgress,
      lineValue: lineVisible ? item.value * easedProgress : null,
    };
  });

  const maxValue = Math.max(...chartData.map((d: { value: number }) => d.value));

  const CustomLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    if (value < 0.5) return null;

    const labelOpacity = interpolate(
      barAnimationProgress,
      [index * 0.12 + 0.5, index * 0.12 + 0.7],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const isHighlight = animatedData[index]?.highlight;

    return (
      <text
        x={x + width / 2}
        y={y - 15}
        fill={isHighlight ? "#22d3ee" : "#3b82f6"}
        textAnchor="middle"
        fontSize={40}
        fontWeight={700}
        fontFamily="Pretendard, sans-serif"
        style={{
          opacity: labelOpacity,
          filter: `drop-shadow(0 0 10px ${isHighlight ? "rgba(34, 211, 238, 0.8)" : "rgba(59, 130, 246, 0.6)"})`,
        }}
      >
        {Math.round(value)}
      </text>
    );
  };

  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    if (cx === undefined || cy === undefined) return null;

    const dotDelay = (index || 0) / chartData.length;
    const dotProgress = interpolate(
      lineAnimationProgress,
      [dotDelay, dotDelay + 0.2],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const isHighlight = animatedData[index]?.highlight;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={12 * dotProgress}
        fill={isHighlight ? HIGHLIGHT_STROKE : DOT_COLOR}
        stroke={isHighlight ? HIGHLIGHT_STROKE : LINE_COLOR}
        strokeWidth={3}
        style={{
          filter: `drop-shadow(0 0 ${8 * dotProgress}px ${isHighlight ? HIGHLIGHT_STROKE : LINE_COLOR})`,
        }}
      />
    );
  };

  return (
    <AbsoluteFill>
      {scene.chartTitle && (
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 80,
            color: "#ffffff",
            fontSize: 52,
            fontFamily: "Pretendard, sans-serif",
            fontWeight: 700,
            textShadow: "0 0 20px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0, 0, 0, 0.8)",
            letterSpacing: 1,
            opacity,
            zIndex: 10,
          }}
        >
          {scene.chartTitle}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          padding: "60px 100px",
          opacity,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1400,
            height: 500,
            borderRadius: 24,
            padding: "40px 60px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={animatedData}
              margin={{ top: 40, right: 40, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)" />
                  <stop offset="100%" stopColor="rgba(59, 130, 246, 0.1)" />
                </linearGradient>
                <linearGradient id="highlightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(34, 211, 238, 0.6)" />
                  <stop offset="100%" stopColor="rgba(34, 211, 238, 0.1)" />
                </linearGradient>
                <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <XAxis
                dataKey="label"
                tick={{ fill: "#e2e8f0", fontSize: 36, fontFamily: "Pretendard", fontWeight: 600 }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
                tickLine={{ stroke: "rgba(255, 255, 255, 0.2)" }}
              />
              <YAxis
                domain={[0, maxValue * 1.25]}
                tick={{ fill: "#94a3b8", fontSize: 28, fontFamily: "Pretendard" }}
                axisLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
                tickLine={{ stroke: "rgba(255, 255, 255, 0.1)" }}
              />

              <Bar
                dataKey="animatedValue"
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
                barSize={80}
              >
                {animatedData.map((entry: { highlight?: boolean }, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.highlight ? "url(#highlightGradient)" : "url(#barGradient)"}
                    stroke={entry.highlight ? HIGHLIGHT_STROKE : BAR_STROKE}
                    strokeWidth={2}
                  />
                ))}
                <LabelList dataKey="animatedValue" content={<CustomLabel />} />
              </Bar>

              <Line
                type="monotone"
                dataKey="animatedValue"
                stroke={LINE_COLOR}
                strokeWidth={4}
                dot={<CustomDot />}
                isAnimationActive={false}
                style={{ filter: "url(#lineGlow)" }}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {scene.source && (
          <div
            style={{
              color: "#64748b",
              fontSize: 28,
              fontFamily: "Pretendard, sans-serif",
              marginTop: 24,
              padding: "8px 20px",
              borderRadius: 8,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {scene.source}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
