import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, PhoneFrame, body, display } from "./_shared";

const items = [
  { t: "Sonntagsbrötchen", d: true },
  { t: "Eier", d: true },
  { t: "Kaffee", d: true },
  { t: "Butter", d: false },
  { t: "Orangensaft", d: false },
  { t: "Nutella", d: false },
];

export const FeatureShopping: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell align="flex-start">
      <div style={{ marginTop: 40 }}><Label delay={0}>Feature · 02</Label></div>
      <Title delay={5} size={120}>Listen, die<br/>mitdenken.</Title>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 20 }}>
        <PhoneFrame delay={15}>
          <div style={{ padding: 40, fontFamily: body }}>
            <div style={{ fontSize: 24, color: COLORS.zinc, textTransform: "uppercase", letterSpacing: 3, fontWeight: 600 }}>Wocheneinkauf</div>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 52, color: COLORS.ink, marginTop: 6, marginBottom: 30, lineHeight: 1 }}>Brunch für 4.</div>
            <div style={{ background: "#fff", borderRadius: 28, padding: 20, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
              {items.map((it, i) => {
                const s = interpolate(frame, [30 + i * 6, 45 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={it.t} style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "18px 12px",
                    borderBottom: i < items.length - 1 ? "1px solid #eee" : "none",
                    opacity: s, transform: `translateX(${interpolate(s, [0, 1], [20, 0])}px)`,
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 6, border: `2px solid ${it.d ? COLORS.ink : "#ccc"}`,
                      background: it.d ? COLORS.ink : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 20, fontWeight: 700,
                    }}>{it.d ? "✓" : ""}</div>
                    <div style={{
                      fontSize: 28, fontWeight: 500, color: it.d ? "#bbb" : COLORS.ink,
                      textDecoration: it.d ? "line-through" : "none", flex: 1,
                    }}>{it.t}</div>
                  </div>
                );
              })}
            </div>
            <div style={{
              marginTop: 20, background: COLORS.yellow, borderRadius: 20, padding: "18px 22px",
              fontSize: 24, fontWeight: 600, color: COLORS.ink,
              opacity: interpolate(frame, [72, 84], [0, 1], { extrapolateRight: "clamp" }),
            }}>+ KI-Vorschlag: Ahornsirup</div>
          </div>
        </PhoneFrame>
      </div>
    </SceneShell>
  );
};