import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { COLORS, Label, useIn, body, display } from "./_shared";

export const Keypoint: React.FC = () => {
  const frame = useCurrentFrame();
  const t1 = useIn(0, 22);
  const t2 = useIn(20, 22);
  const card = useIn(40, 20);
  return (
    <AbsoluteFill style={{
      background: COLORS.cream, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", gap: 24,
    }}>
      <div style={{ opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [20, 0])}px)` }}>
        <Label delay={0}>Die Lösung</Label>
      </div>
      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 140, lineHeight: 0.95, letterSpacing: -3,
        color: COLORS.ink,
        opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [40, 0])}px)`,
      }}>
        Findet, was<br/>
        <span style={{ color: COLORS.green }}>gerade offen</span> ist.
      </div>
      <div style={{
        marginTop: 10, fontFamily: body, fontSize: 36, color: COLORS.zinc,
        opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [20, 0])}px)`,
      }}>Tankstellen · Bäcker · Spätis · Bahnhofs­märkte.</div>

      <div style={{
        marginTop: 40, width: "100%",
        background: "#fff", borderRadius: 40, padding: 40,
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        opacity: card, transform: `translateY(${interpolate(card, [0, 1], [60, 0])}px)`,
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {[
          { n: "REWE To Go", d: "Hauptbahnhof", s: "offen bis 22:00", c: COLORS.green },
          { n: "Bäckerei Kamps", d: "0.4 km entfernt", s: "offen bis 14:00", c: COLORS.green },
          { n: "Aral Tankstelle", d: "1.1 km entfernt", s: "24/7 geöffnet", c: COLORS.green },
        ].map((it, i) => {
          const s = interpolate(frame, [50 + i * 8, 65 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 999, background: it.c,
                boxShadow: `0 0 0 6px ${it.c}22`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: body, fontSize: 40, fontWeight: 600, color: COLORS.ink }}>{it.n}</div>
                <div style={{ fontFamily: body, fontSize: 26, color: COLORS.zinc, marginTop: 4 }}>{it.d}</div>
              </div>
              <div style={{ fontFamily: body, fontSize: 26, color: it.c, fontWeight: 600 }}>{it.s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};