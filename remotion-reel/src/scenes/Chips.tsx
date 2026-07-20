import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const CHIPS = [
  { k: "01", t: "Listen teilen", d: "WG, Familie, Mitbewohner." },
  { k: "02", t: "Panik-Score", d: "Was fehlt für den Sonntag?" },
  { k: "03", t: "Route starten", d: "Direkt in Google Maps." },
];

export const Chips: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: COLORS.green, padding: 90, justifyContent: "center", gap: 40 }}>
      <div style={{
        fontFamily: body, fontSize: 28, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.yellow,
      }}>Alles drin</div>
      {CHIPS.map((c, i) => {
        const s = spring({ frame: frame - i * 10, fps, config: { damping: 12, stiffness: 140 } });
        return (
          <div key={i} style={{
            display: "flex", alignItems: "baseline", gap: 30,
            opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`,
          }}>
            <div style={{ fontFamily: display, fontSize: 70, fontWeight: 700, color: COLORS.yellow }}>{c.k}</div>
            <div>
              <div style={{ fontFamily: display, fontSize: 96, fontWeight: 700, color: COLORS.cream, letterSpacing: -3, lineHeight: 1 }}>{c.t}</div>
              <div style={{ fontFamily: body, fontSize: 30, color: "#c9d6ce", marginTop: 8 }}>{c.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};