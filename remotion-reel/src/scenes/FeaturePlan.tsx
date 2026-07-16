import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { COLORS, SceneShell, Title, Label, PhoneFrame, body, display } from "./_shared";

export const FeaturePlan: React.FC = () => {
  const frame = useCurrentFrame();
  const wIn = interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pIn = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneShell align="flex-start">
      <div style={{ marginTop: 40 }}><Label delay={0}>Feature · 03</Label></div>
      <Title delay={5} size={120}>Wetter &<br/>Wochenendplan.</Title>
      <div style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: 20 }}>
        <PhoneFrame delay={15}>
          <div style={{ padding: 40, fontFamily: body }}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: 56, color: COLORS.ink }}>Plan.</div>
            <div style={{
              marginTop: 24, background: COLORS.ink, color: COLORS.cream, borderRadius: 28, padding: 30,
              opacity: wIn, transform: `translateY(${interpolate(wIn, [0, 1], [20, 0])}px)`,
            }}>
              <div style={{ fontSize: 22, color: COLORS.yellow, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3 }}>Sonntag · Berlin</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 12 }}>
                <div style={{ fontFamily: display, fontSize: 130, fontWeight: 700, lineHeight: 1 }}>21°</div>
                <div style={{ fontSize: 32 }}>☀️</div>
              </div>
              <div style={{ fontSize: 24, color: "#bbb", marginTop: 8 }}>Sonnig · perfekt für draußen</div>
            </div>
            <div style={{ marginTop: 24, opacity: pIn, transform: `translateY(${interpolate(pIn, [0, 1], [20, 0])}px)` }}>
              <div style={{ fontSize: 22, color: COLORS.zinc, fontWeight: 600, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>In der Nähe</div>
              {[
                { t: "Café Kranzler", d: "Brunch · 0,4 km" },
                { t: "Tempelhofer Feld", d: "Park · 1,2 km" },
                { t: "Boxi Flohmarkt", d: "Sonntag · 2,0 km" },
              ].map((p, i) => (
                <div key={p.t} style={{
                  background: "#fff", borderRadius: 20, padding: 20, marginBottom: 10,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.ink }}>{p.t}</div>
                  <div style={{ fontSize: 20, color: COLORS.zinc, marginTop: 4 }}>{p.d}</div>
                </div>
              ))}
            </div>
          </div>
        </PhoneFrame>
      </div>
    </SceneShell>
  );
};