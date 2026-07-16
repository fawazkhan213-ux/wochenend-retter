import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, useIn, display, body } from "./_shared";

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const s1 = useIn(0, 20);
  const s2 = useIn(20, 22);
  const s3 = useIn(45, 20);
  return (
    <AbsoluteFill style={{
      background: COLORS.yellow, padding: 80,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", gap: 30,
    }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 80% 90%, ${COLORS.ink}22, transparent 55%)`,
        }} />
      </AbsoluteFill>
      <div style={{
        fontFamily: body, fontSize: 34, fontWeight: 600, color: COLORS.ink,
        letterSpacing: 4, textTransform: "uppercase",
        opacity: s1, transform: `translateY(${interpolate(s1, [0, 1], [20, 0])}px)`,
      }}>Für Studis · Pendler · alle</div>
      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 180, lineHeight: 0.9,
        letterSpacing: -5, color: COLORS.ink, textAlign: "center",
        opacity: s2, transform: `translateY(${interpolate(s2, [0, 1], [40, 0])}px)`,
      }}>Nie wieder<br/>hungrig am<br/>Sonntag.</div>
      <div style={{
        marginTop: 40, background: COLORS.ink, color: COLORS.yellow,
        padding: "34px 60px", borderRadius: 999,
        fontFamily: body, fontSize: 42, fontWeight: 600,
        opacity: s3, transform: `scale(${interpolate(s3, [0, 1], [0.8, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>wochenend-retter.app</div>
    </AbsoluteFill>
  );
};