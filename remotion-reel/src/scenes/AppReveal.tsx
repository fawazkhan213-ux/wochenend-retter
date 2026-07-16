import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, useIn, display, body } from "./_shared";

export const AppReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useIn(0, 18);
  const s2 = useIn(20, 20);
  return (
    <AbsoluteFill style={{
      background: COLORS.ink, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 80, flexDirection: "column", gap: 30,
    }}>
      <div style={{
        width: 260, height: 260, borderRadius: 60,
        background: COLORS.yellow, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: display, fontWeight: 700, fontSize: 180, color: COLORS.ink,
        transform: `scale(${s}) rotate(${interpolate(s, [0, 1], [-20, 0])}deg)`,
        boxShadow: "0 30px 80px rgba(255,216,77,0.4)",
      }}>W</div>
      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 130, color: COLORS.cream,
        lineHeight: 0.95, letterSpacing: -3, textAlign: "center",
        opacity: s2, transform: `translateY(${interpolate(s2, [0, 1], [30, 0])}px)`,
      }}>Wochenend-<br/>Retter</div>
      <div style={{
        fontFamily: body, fontSize: 36, color: COLORS.yellow, fontWeight: 600, letterSpacing: 2,
        textTransform: "uppercase",
        opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
      }}>Die App für den Sonntag</div>
    </AbsoluteFill>
  );
};