import React from "react";

function isCJK(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return (
    (code >= 0xAC00 && code <= 0xD7AF) ||
    (code >= 0x3130 && code <= 0x318F) ||
    (code >= 0x3000 && code <= 0x9FFF) ||
    (code >= 0xF900 && code <= 0xFAFF)
  );
}

function visualWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    w += isCJK(ch) ? 2 : 1;
  }
  return w;
}

function cumulativeVisualWidths(text: string): number[] {
  const cumVW = [0];
  for (let i = 0; i < text.length; i++) {
    cumVW.push(cumVW[i] + (isCJK(text[i]) ? 2 : 1));
  }
  return cumVW;
}

export function formatDisplayText(
  text: string,
  maxVW: number = 36,
): React.ReactNode {
  if (!text || visualWidth(text) <= maxVW) return text;

  const splitPos = findBestSplit(text);
  if (splitPos === -1) return text;

  const line1 = text.slice(0, splitPos).trimEnd();
  const line2 = text.slice(splitPos).trimStart();

  if (visualWidth(line2) > maxVW) {
    return (
      <>
        {line1}
        <br />
        {formatDisplayText(line2, maxVW)}
      </>
    );
  }

  return (
    <>
      {line1}
      <br />
      {line2}
    </>
  );
}

function findBestSplit(text: string): number {
  const cumVW = cumulativeVisualWidths(text);
  const totalVW = cumVW[text.length];
  const targetHalf = totalVW / 2;

  let bestPos = -1;
  let bestScore = Infinity;

  for (let i = 1; i < text.length - 1; i++) {
    let pos = -1;
    let priority = Infinity;

    if (text[i] === ",") {
      pos = i + 1;
      priority = 0;
    } else if (text.slice(i, i + 3) === " — ") {
      pos = i;
      priority = 1;
    } else if (text.slice(i, i + 3) === " → ") {
      pos = i;
      priority = 1;
    } else if (text.slice(i, i + 3) === " - ") {
      pos = i;
      priority = 1;
    } else if (text[i] === "." && i + 1 < text.length && text[i + 1] === " ") {
      pos = i + 1;
      priority = 1;
    } else if (text[i] === " ") {
      pos = i;
      priority = 2;
    }

    if (pos !== -1) {
      const leftVW = cumVW[pos];
      const rightVW = totalVW - leftVW;

      if (priority > 0) {
        const minVW = totalVW * 0.3;
        if (leftVW < minVW || rightVW < minVW) continue;
      }

      const dist = Math.abs(leftVW - targetHalf);
      const score = dist + priority * totalVW;
      if (score < bestScore) {
        bestScore = score;
        bestPos = pos;
      }
    }
  }

  return bestPos;
}
