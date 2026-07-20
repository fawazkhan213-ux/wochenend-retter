import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const name = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  const sub = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const drift = Math.sin(frame / 30) * 6;
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "center", gap: 30 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 50% 45%, ${COLORS.yellow}55, transparent 55%)`,
      }} />
      <div style={{
        transform: `scale(${logo}) rotate(${interpolate(logo, [0, 1], [-25, 0])}deg) translateY(${drift}px)`,
        opacity: logo,
      }}>
        <Img src={staticFile("logo.png")} style={{
          width: 420, height: 420, borderRadius: 80,
          boxShadow: "0 40px 100px rgba(0,0,0,0.18)",
        }} />
      </div>
      <div style={{
        fontFamily: display, fontSize: 150, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -4, lineHeight: 0.95, textAlign: "center",
        opacity: name, transform: `translateY(${interpolate(name, [0, 1], [30, 0])}px)`,
      }}>Wochenend-<br/>Retter</div>
      <div style={{
        fontFamily: body, fontSize: 38, color: COLORS.zinc, fontWeight: 500, textAlign: "center",
        opacity: sub, transform: `translateY(${interpolate(sub, [0, 1], [16, 0])}px)`,
      }}>Die App, die deinen Sonntag rettet.</div>
    </AbsoluteFill>
  );
};