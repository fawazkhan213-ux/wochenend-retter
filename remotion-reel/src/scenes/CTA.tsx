import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const line = spring({ frame: frame - 12, fps, config: { damping: 200 } });
  const pill = spring({ frame: frame - 30, fps, config: { damping: 10 } });
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "center", gap: 34 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 100%, ${COLORS.yellow}55, transparent 60%)`,
      }} />
      <div style={{ transform: `scale(${logo})`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 260, height: 260, borderRadius: 60, boxShadow: "0 30px 80px rgba(0,0,0,0.15)" }} />
      </div>
      <div style={{
        fontFamily: display, fontSize: 130, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -4, lineHeight: 0.95, textAlign: "center",
        opacity: line, transform: `translateY(${interpolate(line, [0, 1], [24, 0])}px)`,
      }}>Rette dein<br/>Wochenende.</div>
      <div style={{
        marginTop: 10, background: COLORS.ink, color: COLORS.yellow,
        padding: "30px 56px", borderRadius: 999,
        fontFamily: body, fontSize: 42, fontWeight: 700,
        opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.8, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>Link in Bio · kostenlos</div>
    </AbsoluteFill>
  );
};