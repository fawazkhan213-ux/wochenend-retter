import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, body, display } from "../theme";

// 15s reel scene 1: Sonntag boredom hook. 78 frames.
export const Bored: React.FC = () => {
  const frame = useCurrentFrame();
  const label = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const q1 = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });
  const q2 = interpolate(frame, [24, 42], [0, 1], { extrapolateRight: "clamp" });
  const q3 = interpolate(frame, [38, 56], [0, 1], { extrapolateRight: "clamp" });
  const drift = Math.sin(frame / 22) * 4;
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "flex-start", gap: 22 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 20% 15%, ${COLORS.yellow}33, transparent 55%)`,
      }} />
      <div style={{
        fontFamily: body, fontSize: 32, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.zinc,
        opacity: label, transform: `translateY(${interpolate(label, [0, 1], [16, 0])}px)`,
      }}>Sonntag · 11:47</div>
      <div style={{
        fontFamily: display, fontSize: 240, fontWeight: 700, color: COLORS.ink,
        lineHeight: 0.9, letterSpacing: -8,
        opacity: q1, transform: `translate(${interpolate(q1, [0, 1], [-40, 0])}px, ${drift}px)`,
      }}>Was</div>
      <div style={{
        fontFamily: display, fontSize: 240, fontWeight: 700, color: COLORS.green,
        lineHeight: 0.9, letterSpacing: -8,
        opacity: q2, transform: `translateX(${interpolate(q2, [0, 1], [40, 0])}px)`,
      }}>machen</div>
      <div style={{
        fontFamily: display, fontSize: 280, fontWeight: 700, color: COLORS.red,
        lineHeight: 0.9, letterSpacing: -10,
        opacity: q3, transform: `translateX(${interpolate(q3, [0, 1], [-40, 0])}px)`,
      }}>wir?</div>
    </AbsoluteFill>
  );
};