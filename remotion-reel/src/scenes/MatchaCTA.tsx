import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

export const MatchaCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 11, stiffness: 150 } });
  const line = spring({ frame: frame - 14, fps, config: { damping: 200 } });
  const pill = spring({ frame: frame - 32, fps, config: { damping: 11 } });
  const ripple = interpolate(frame, [6, 60], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "center", gap: 36 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${COLORS.yellow}66, transparent 62%)` }} />
      <div style={{
        position: "absolute", left: "50%", top: "30%", width: 700, height: 700, marginLeft: -350, marginTop: -350,
        borderRadius: "50%", border: `5px solid ${COLORS.green}`,
        transform: `scale(${interpolate(ripple, [0, 1], [0.2, 1.6])})`,
        opacity: interpolate(ripple, [0, 0.35, 1], [0, 0.45, 0]),
      }} />
      <div style={{ position: "relative", transform: `scale(${logo})`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 300, height: 300, borderRadius: 66, boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }} />
      </div>
      <div style={{
        position: "relative", fontFamily: display, fontWeight: 700, fontSize: 104, letterSpacing: -3, lineHeight: 0.98,
        color: COLORS.ink, textAlign: "center",
        opacity: line, transform: `translateY(${interpolate(line, [0, 1], [28, 0])}px)`,
      }}>Matcha gefunden.<br/><span style={{ color: COLORS.green }}>Sonntag gerettet.</span></div>
      <div style={{
        position: "relative", background: COLORS.ink, color: COLORS.yellow, padding: "28px 54px", borderRadius: 999,
        fontFamily: body, fontWeight: 700, fontSize: 40,
        opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.82, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
      }}>Wochenend-Retter · kostenlos</div>
    </AbsoluteFill>
  );
};