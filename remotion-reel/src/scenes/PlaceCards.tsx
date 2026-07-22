import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const CARDS = [
  { icon: "🖼", t: "Kunstmuseum", d: "0.8 km · offen bis 18:00", tag: "Kultur", c: COLORS.green },
  { icon: "🌳", t: "Stadtpark", d: "1.2 km · Sonne pur", tag: "Draußen", c: COLORS.yellow },
  { icon: "☕", t: "Café Nord", d: "0.4 km · Frühstück", tag: "Chillen", c: COLORS.red },
];

export const PlaceCards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const title = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: COLORS.yellow, padding: 80, justifyContent: "center", gap: 34 }}>
      <div style={{
        fontFamily: body, fontSize: 28, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.ink, opacity: title,
      }}>Plan · in 3 Tap</div>
      <div style={{
        fontFamily: display, fontSize: 140, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -4, lineHeight: 0.9,
        opacity: title, transform: `translateY(${interpolate(title, [0, 1], [24, 0])}px)`,
      }}>Route<br/>starten.</div>

      {CARDS.map((c, i) => {
        const s = spring({ frame: frame - 18 - i * 9, fps, config: { damping: 12, stiffness: 140 } });
        return (
          <div key={i} style={{
            background: COLORS.cream, borderRadius: 32, padding: 28,
            display: "flex", alignItems: "center", gap: 24,
            boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
            opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`,
          }}>
            <div style={{
              width: 100, height: 100, borderRadius: 24, background: c.c,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52,
              boxShadow: `0 8px 24px ${c.c}55`,
            }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: display, fontSize: 56, fontWeight: 700, color: COLORS.ink, letterSpacing: -1, lineHeight: 1 }}>{c.t}</div>
              <div style={{ fontFamily: body, fontSize: 26, color: COLORS.zinc, marginTop: 6 }}>{c.d}</div>
            </div>
            <div style={{
              fontFamily: body, fontSize: 22, fontWeight: 700, color: c.c,
              border: `3px solid ${c.c}`, padding: "8px 16px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: 2,
            }}>{c.tag}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};