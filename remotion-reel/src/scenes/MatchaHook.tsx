import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

export const MatchaHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chip = spring({ frame, fps, config: { damping: 200 } });
  const l1 = spring({ frame: frame - 8, fps, config: { damping: 22 } });
  const l2 = spring({ frame: frame - 18, fps, config: { damping: 22 } });
  const cup = spring({ frame: frame - 34, fps, config: { damping: 10, stiffness: 150 } });
  const circle = spring({ frame: frame - 4, fps, config: { damping: 200 } });
  const drift = Math.sin(frame / 30) * 6;

  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", gap: 26 }}>
      <div style={{
        position: "absolute", right: -130, top: 90, width: 520, height: 520, borderRadius: "50%",
        background: COLORS.green,
        transform: `scale(${interpolate(circle, [0, 1], [0.6, 1])}) translateY(${drift}px)`,
        opacity: circle,
      }} />
      <div style={{
        position: "absolute", right: -140, bottom: -160, width: 460, height: 460, borderRadius: "50%",
        background: COLORS.yellow, opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateRight: "clamp" }),
      }} />

      <div style={{
        position: "relative", alignSelf: "flex-start", background: COLORS.yellow, color: COLORS.ink,
        padding: "16px 32px", borderRadius: 999, fontFamily: body, fontWeight: 700,
        fontSize: 32, letterSpacing: 2,
        opacity: chip, transform: `translateY(${interpolate(chip, [0, 1], [-24, 0])}px)`,
      }}>SONNTAG · 11:40</div>

      <div style={{
        position: "relative", fontFamily: display, fontWeight: 700, fontSize: 150, lineHeight: 0.92, letterSpacing: -5,
        color: COLORS.ink,
        opacity: l1, transform: `translateY(${interpolate(l1, [0, 1], [50, 0])}px)`,
      }}>LUST AUF</div>
      <div style={{
        position: "relative", fontFamily: display, fontWeight: 700, fontSize: 172, lineHeight: 0.9, letterSpacing: -6,
        color: COLORS.green,
        opacity: l2, transform: `translateY(${interpolate(l2, [0, 1], [60, 0])}px)`,
      }}>MATCHA?</div>

      {/* geometric matcha cup */}
      <div style={{
        marginTop: 24, position: "relative", width: 300, height: 215,
        opacity: cup, transform: `scale(${cup}) translateY(${drift * 0.5}px)`,
      }}>
        <div style={{
          position: "absolute", left: 40, top: 0, width: 260, height: 130, borderRadius: "50%",
          background: "#8FB08A",
        }} />
        <div style={{
          position: "absolute", left: 40, top: 55, width: 260, height: 175,
          background: COLORS.green, borderBottomLeftRadius: 130, borderBottomRightRadius: 130,
        }} />
        <div style={{
          position: "absolute", left: 118, top: 34, width: 104, height: 62, borderRadius: "50%",
          background: COLORS.cream, opacity: 0.85,
        }} />
      </div>

      <div style={{
        position: "relative", fontFamily: body, fontSize: 38, color: COLORS.zinc, marginTop: 10,
        opacity: interpolate(frame, [46, 66], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>Alles zu. Oder doch nicht?</div>
    </AbsoluteFill>
  );
};