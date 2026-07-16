import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Label, Title, useIn, body } from "./_shared";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const sub = useIn(30, 22);
  return (
    <AbsoluteFill style={{
      background: COLORS.cream, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", gap: 24,
    }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 15% 15%, ${COLORS.yellow}44, transparent 55%)`,
        }} />
      </AbsoluteFill>
      <Label delay={0}>Sonntag in Deutschland</Label>
      <Title delay={8} size={200}>Alles</Title>
      <Title delay={18} size={280} color={COLORS.green}>zu.</Title>
      <div style={{
        marginTop: 20, fontFamily: body, fontSize: 40, color: COLORS.zinc, fontWeight: 400,
        opacity: sub, transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`,
      }}>Kein Brot. Kein Kaffee. Kein Plan.</div>
    </AbsoluteFill>
  );
};