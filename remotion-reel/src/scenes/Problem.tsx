import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, Chip, useIn, body } from "./_shared";

const stores = ["REWE", "EDEKA", "ALDI", "LIDL", "DM", "PENNY"];

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell align="center">
      <Label delay={0}>In Deutschland</Label>
      <Title delay={6} size={170}>Alle Läden</Title>
      <Title delay={16} size={220} color={COLORS.red}>zu.</Title>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30 }}>
        {stores.map((n, i) => {
          const s = useIn(30 + i * 5, 22);
          const strike = interpolate(frame, [50 + i * 5, 65 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={n} style={{
              position: "relative", background: "#fff", color: COLORS.ink,
              padding: "18px 28px", borderRadius: 999,
              fontFamily: body, fontWeight: 600, fontSize: 34,
              opacity: s, transform: `scale(${s})`,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}>
              {n}
              <div style={{
                position: "absolute", left: 12, right: 12, top: "50%",
                height: 4, background: COLORS.red, transformOrigin: "left",
                transform: `translateY(-50%) scaleX(${strike})`,
                borderRadius: 2,
              }} />
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};