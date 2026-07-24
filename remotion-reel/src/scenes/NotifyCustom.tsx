import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Title, useIn, body, display } from "./_shared";

const Row: React.FC<{ label: string; value: string; delay: number; accent?: boolean }> = ({ label, value, delay, accent }) => {
  const s = useIn(delay);
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "24px 30px", borderRadius: 24,
      background: accent ? COLORS.yellow : "#fff",
      opacity: s, transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`,
      boxShadow: accent ? "0 12px 30px rgba(233,167,60,0.35)" : "0 8px 20px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontFamily: body, fontSize: 32, fontWeight: 600, color: COLORS.ink }}>{label}</div>
      <div style={{ fontFamily: display, fontSize: 36, fontWeight: 700, color: COLORS.ink }}>{value}</div>
    </div>
  );
};

export const NotifyCustom: React.FC = () => {
  return (
    <AbsoluteFill style={{
      background: COLORS.cream, padding: 90,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch", gap: 24,
    }}>
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 600, letterSpacing: 4,
        textTransform: "uppercase", color: COLORS.zinc, opacity: useIn(0),
      }}>Auch für deine Listen</div>
      <Title delay={6} size={130}>Dein Takt.</Title>
      <Title delay={16} size={130} color={COLORS.green}>Deine Zeit.</Title>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <Row label="Wocheneinkauf" value="Fr · 18:00" delay={30} accent />
        <Row label="Bio-Markt" value="Sa · 09:30" delay={42} />
        <Row label="Getränke" value="Do · 17:00" delay={54} />
      </div>
    </AbsoluteFill>
  );
};