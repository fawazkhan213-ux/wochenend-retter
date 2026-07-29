import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, body, display } from "../theme";
import { useIn } from "./_shared";

// Yellow heads-up: Freitag Abend, warm energy, big countdown number swap.
export const WeekHook: React.FC = () => {
  const frame = useCurrentFrame();
  const label = useIn(0);
  const big = useIn(8, 14);
  const sub = useIn(28);
  // Fake ticker: hours "til Ladenschluss" counting down 26 → 24
  const h = Math.max(24, 27 - Math.floor(frame / 10));
  const drift = Math.sin(frame / 22) * 4;
  return (
    <AbsoluteFill style={{ background: COLORS.yellow, padding: 90, justifyContent: "center", alignItems: "flex-start", gap: 20 }}>
      <div style={{ position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 100% 0%, #ffffff55, transparent 55%)` }} />
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.ink,
        opacity: label, transform: `translateY(${interpolate(label, [0, 1], [16, 0])}px)`,
      }}>Freitag · 17:00</div>
      <div style={{
        fontFamily: display, fontSize: 460, fontWeight: 700, color: COLORS.ink,
        lineHeight: 0.85, letterSpacing: -18,
        opacity: big, transform: `scale(${interpolate(big, [0, 1], [0.85, 1])}) translateY(${drift}px)`,
        transformOrigin: "left center",
      }}>{h}h</div>
      <div style={{
        fontFamily: display, fontSize: 88, fontWeight: 700, color: COLORS.ink,
        lineHeight: 0.95, letterSpacing: -2,
        opacity: sub, transform: `translateY(${interpolate(sub, [0, 1], [24, 0])}px)`,
      }}>bis alles zu ist.</div>
    </AbsoluteFill>
  );
};