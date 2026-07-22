import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

export const OutroPlan: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const line = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const pill = spring({ frame: frame - 34, fps, config: { damping: 10 } });
  const drift = Math.sin(frame / 24) * 5;
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "center", gap: 30 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 100%, ${COLORS.green}44, transparent 55%)`,
      }} />
      <div style={{ transform: `scale(${logo}) translateY(${drift}px)`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 280, height: 280, borderRadius: 64, boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }} />
      </div>
      <div style={{
        fontFamily: display, fontSize: 140, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -4, lineHeight: 0.9, textAlign: "center",
        opacity: line, transform: `translateY(${interpolate(line, [0, 1], [24, 0])}px)`,
      }}>Nie wieder<br/><span style={{ color: COLORS.green }}>Sonntags-Koma.</span></div>
      <div style={{
        marginTop: 10, background: COLORS.green, color: COLORS.cream,
        padding: "28px 52px", borderRadius: 999,
        fontFamily: body, fontSize: 40, fontWeight: 700,
        opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.8, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>Wochenend-Retter · Link in Bio</div>
    </AbsoluteFill>
  );
};