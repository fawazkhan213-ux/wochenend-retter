import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Label, useIn, body, display } from "./_shared";

const items = [
  { k: "01", t: "Offene Läden", d: "Live-Status in deiner Nähe." },
  { k: "02", t: "Einkaufslisten", d: "Teilen mit WG & Familie." },
  { k: "03", t: "Verkaufsoffene Sonntage", d: "NRW · Berlin · Hamburg." },
];

export const Features: React.FC = () => {
  const frame = useCurrentFrame();
  const l = useIn(0, 22);
  return (
    <AbsoluteFill style={{
      background: COLORS.green, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", gap: 30,
    }}>
      <div style={{
        fontFamily: body, fontSize: 26, fontWeight: 600, letterSpacing: 4,
        textTransform: "uppercase", color: COLORS.yellow,
        opacity: l, transform: `translateY(${interpolate(l, [0, 1], [16, 0])}px)`,
      }}>Alles in einer App</div>

      {items.map((it, i) => {
        const s = interpolate(frame, [15 + i * 18, 35 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            display: "flex", alignItems: "baseline", gap: 30,
            opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-50, 0])}px)`,
          }}>
            <div style={{
              fontFamily: display, fontSize: 60, fontWeight: 700, color: COLORS.yellow, minWidth: 100,
            }}>{it.k}</div>
            <div>
              <div style={{
                fontFamily: display, fontSize: 100, fontWeight: 700, color: COLORS.cream,
                letterSpacing: -2, lineHeight: 1,
              }}>{it.t}</div>
              <div style={{
                fontFamily: body, fontSize: 32, color: "#c9d6ce", marginTop: 10,
              }}>{it.d}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};