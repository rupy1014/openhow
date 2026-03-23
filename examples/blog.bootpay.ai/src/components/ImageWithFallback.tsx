import { Img, staticFile } from "remotion";
import React, { useState } from "react";

interface Props {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<Props> = ({
  src,
  alt = "Image",
  style,
  fallbackText,
}) => {
  const [hasError, setHasError] = useState(false);

  const normalizedSrc = src.startsWith("/") ? src.slice(1) : src;

  if (!src || hasError) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)",
          border: "2px dashed rgba(255, 255, 255, 0.3)",
          borderRadius: 16,
          padding: "40px 60px",
          minWidth: 400,
          minHeight: 250,
          ...style,
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
        <div
          style={{
            color: "#94a3b8",
            fontSize: 24,
            fontFamily: "Pretendard, sans-serif",
            textAlign: "center",
          }}
        >
          {fallbackText || src.split("/").pop()?.replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")}
        </div>
      </div>
    );
  }

  return (
    <Img
      src={staticFile(normalizedSrc)}
      alt={alt}
      style={style}
      onError={() => setHasError(true)}
    />
  );
};
