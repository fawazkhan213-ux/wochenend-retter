import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

export const Idea: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const t1 = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const t2 = spring({ frame: frame - 32, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: COLORS.green, padding: 90, justifyContent: "center", alignItems: "flex-start", gap: 30 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(circle at 80% 20%, ${COLORS.yellow}55, transparent 55%)`,
      }} />
      <div style={{ transform: `scale(${logo})`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 200, height: 200, borderRadius: 46, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }} />
      </div>
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.yellow,
        opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [20, 0])}px)`,
      }}>Deine Sonntagslösung</div>
      <div style={{
        fontFamily: display, fontSize: 180, fontWeight: 700, color: COLORS.cream,
        letterSpacing: -6, lineHeight: 0.9,
        opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [30, 0])}px)`,
      }}>Raus.<br/>Erleben.<br/><span style={{ color: COLORS.yellow }}>Sofort.</span></div>
    </AbsoluteFill>
  );
};