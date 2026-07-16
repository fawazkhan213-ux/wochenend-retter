import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, display, body } from "../theme";

export const useIn = (delay = 0, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

export const Chip: React.FC<{ children: React.ReactNode; color?: string; bg?: string; delay?: number }> = ({ children, color = COLORS.ink, bg = "#fff", delay = 0 }) => {
  const s = useIn(delay);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12,
      background: bg, color, padding: "16px 28px", borderRadius: 999,
      fontFamily: body, fontWeight: 600, fontSize: 34,
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
      opacity: s,
    }}>{children}</div>
  );
};

export const PhoneFrame: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const s = useIn(delay);
  return (
    <div style={{
      width: 640, height: 1300, borderRadius: 72, background: COLORS.ink,
      padding: 18, boxShadow: "0 40px 100px rgba(0,0,0,0.25)",
      transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
      opacity: s,
    }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 56,
        background: COLORS.cream, overflow: "hidden", position: "relative",
      }}>{children}</div>
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const s = useIn(delay);
  return (
    <div style={{
      fontFamily: body, fontSize: 26, fontWeight: 600, letterSpacing: 4,
      textTransform: "uppercase", color: COLORS.zinc,
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
    }}>{children}</div>
  );
};

export const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number; color?: string; align?: "left" | "center" }> = ({ children, delay = 0, size = 140, color = COLORS.ink, align = "left" }) => {
  const frame = useCurrentFrame();
  const s = useIn(delay, 22);
  const drift = Math.sin((frame - delay) / 40) * 3;
  return (
    <div style={{
      fontFamily: display, fontWeight: 700, fontSize: size, lineHeight: 0.95,
      letterSpacing: -3, color, textAlign: align,
      opacity: s,
      transform: `translateY(${interpolate(s, [0, 1], [40, drift])}px)`,
    }}>{children}</div>
  );
};

export const SceneShell: React.FC<{ children: React.ReactNode; bg?: string; align?: "flex-start" | "center" }> = ({ children, bg = COLORS.cream, align = "center" }) => (
  <AbsoluteFill style={{ background: bg, padding: 80, display: "flex", flexDirection: "column", justifyContent: align, alignItems: "flex-start", gap: 40 }}>
    {children}
  </AbsoluteFill>
);

export { COLORS, display, body };