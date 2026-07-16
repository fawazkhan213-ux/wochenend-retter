import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, useIn, body, display } from "./_shared";

const dates = [
  { d: "So · 3. Nov", c: "Köln", r: "NRW" },
  { d: "So · 10. Nov", c: "Berlin", r: "Mitte" },
  { d: "So · 17. Nov", c: "Hamburg", r: "HH" },
  { d: "So · 1. Dez", c: "Düsseldorf", r: "NRW" },
];

export const FeatureSundays: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell align="flex-start" bg={COLORS.ink}>
      <div style={{ marginTop: 20 }}><Label delay={0}>Feature · 04</Label></div>
      <Title delay={5} size={130} color={COLORS.cream}>Verkaufsoffene<br/>Sonntage.</Title>
      <div style={{
        fontFamily: body, fontSize: 34, color: COLORS.yellow, fontWeight: 500, marginTop: 10,
        opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
      }}>Wann & wo — alles auf einen Blick.</div>
      <div style={{ width: "100%", marginTop: 30 }}>
        {dates.map((it, i) => {
          const s = interpolate(frame, [30 + i * 8, 45 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 24,
              background: "#222", borderRadius: 28, padding: "28px 32px", marginBottom: 16,
              opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
              border: `1px solid #333`,
            }}>
              <div style={{
                fontFamily: display, fontSize: 40, fontWeight: 700,
                color: COLORS.yellow, minWidth: 240,
              }}>{it.d}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 34, fontWeight: 600, color: COLORS.cream, fontFamily: body }}>{it.c}</div>
                <div style={{ fontSize: 22, color: "#888", fontFamily: body }}>{it.r}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneShell>
  );
};