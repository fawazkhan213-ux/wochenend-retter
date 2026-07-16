import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, PhoneFrame, useIn, body, display } from "./_shared";

const stores = [
  { n: "REWE To Go", d: "Hauptbahnhof · 400 m", s: "offen", c: COLORS.green },
  { n: "Späti Kreuzberg", d: "0,8 km", s: "offen bis 24:00", c: COLORS.green },
  { n: "Rossmann Airport", d: "2,1 km", s: "schließt in 45 min", c: COLORS.yellow },
  { n: "Edeka Tankstelle", d: "1,5 km", s: "offen", c: COLORS.green },
];

export const FeatureOpen: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell align="flex-start">
      <div style={{ marginTop: 40 }}><Label delay={0}>Feature · 01</Label></div>
      <Title delay={5} size={120}>Offene Läden.<br/>Jetzt sofort.</Title>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 20 }}>
        <PhoneFrame delay={15}>
          <div style={{ padding: 40, fontFamily: body }}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 56, color: COLORS.ink, marginBottom: 8 }}>Offen</div>
            <div style={{ fontSize: 24, color: COLORS.zinc, marginBottom: 30 }}>4 Läden in deiner Nähe</div>
            {stores.map((st, i) => {
              const s = interpolate(frame, [40 + i * 8, 55 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={st.n} style={{
                  background: "#fff", borderRadius: 24, padding: 24, marginBottom: 14,
                  opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 28, fontWeight: 600, color: COLORS.ink }}>{st.n}</div>
                  <div style={{ fontSize: 22, color: COLORS.zinc, marginTop: 4 }}>{st.d}</div>
                  <div style={{
                    display: "inline-block", marginTop: 12, padding: "6px 14px", borderRadius: 999,
                    background: st.c, color: st.c === COLORS.yellow ? COLORS.ink : "#fff",
                    fontSize: 20, fontWeight: 600,
                  }}>{st.s}</div>
                </div>
              );
            })}
          </div>
        </PhoneFrame>
      </div>
    </SceneShell>
  );
};