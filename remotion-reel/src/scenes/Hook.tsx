import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, useIn, display, body } from "./_shared";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useIn(20, 20);
  return (
    <SceneShell align="center">
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 20% 10%, ${COLORS.yellow}55, transparent 55%)`,
        }} />
      </AbsoluteFill>
      <Label delay={0}>Sonntag · 10:47</Label>
      <Title delay={8} size={150}>Kühlschrank.</Title>
      <Title delay={20} size={220} color={COLORS.red}>Leer.</Title>
      <div style={{ height: 40 }} />
      <div style={{
        fontFamily: body, fontSize: 42, fontWeight: 400, color: COLORS.zinc,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
      }}>Kennst du das?</div>
    </SceneShell>
  );
};