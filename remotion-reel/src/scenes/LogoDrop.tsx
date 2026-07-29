import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";

// Logo slams in on cream, ripples out, then name types-in.
export const LogoDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const drop = spring({ frame, fps, config: { damping: 8, stiffness: 180, mass: 1 } });
  const name = spring({ frame: frame - 22, fps, config: { damping: 200 } });
  const tag = spring({ frame: frame - 40, fps, config: { damping: 200 } });
  const rot = interpolate(drop, [0, 1], [-14, 0]);
  const rippleA = interpolate(frame, [10, 60], [0, 1], { extrapolateRight: "clamp" });
  const rippleB = interpolate(frame, [22, 72], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "center", gap: 40 }}>
      {/* Ripples */}
      <div style={{ position: "absolute", left: "50%", top: "42%", width: 800, height: 800,
        marginLeft: -400, marginTop: -400,
        borderRadius: "50%", border: `4px solid ${COLORS.green}`,
        transform: `scale(${interpolate(rippleA, [0, 1], [0.2, 1.4])})`,
        opacity: interpolate(rippleA, [0, 0.4, 1], [0, 0.6, 0]),
      }} />
      <div style={{ position: "absolute", left: "50%", top: "42%", width: 800, height: 800,
        marginLeft: -400, marginTop: -400,
        borderRadius: "50%", border: `4px solid ${COLORS.yellow}`,
        transform: `scale(${interpolate(rippleB, [0, 1], [0.2, 1.6])})`,
        opacity: interpolate(rippleB, [0, 0.4, 1], [0, 0.7, 0]),
      }} />
      <div style={{ transform: `scale(${drop}) rotate(${rot}deg)`, opacity: drop }}>
        <Img src={staticFile("logo.png")} style={{
          width: 440, height: 440, borderRadius: 88,
          boxShadow: "0 40px 100px rgba(0,0,0,0.2)",
        }} />
      </div>
      <div style={{
        fontFamily: display, fontSize: 160, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -5, lineHeight: 0.9, textAlign: "center",
        opacity: name, transform: `translateY(${interpolate(name, [0, 1], [28, 0])}px)`,
      }}>Wochenend-<br/><span style={{ color: COLORS.green }}>Retter</span>.</div>
      <div style={{
        fontFamily: body, fontSize: 34, fontWeight: 600, color: COLORS.zinc,
        letterSpacing: 2, textAlign: "center",
        opacity: tag, transform: `translateY(${interpolate(tag, [0, 1], [16, 0])}px)`,
      }}>Eine App. Dein ganzer Sonntag.</div>
    </AbsoluteFill>
  );
};