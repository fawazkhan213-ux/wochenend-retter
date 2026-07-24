import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Title, useIn, body, display } from "./_shared";

const StrikeItem: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const s = useIn(delay, 20);
  const strike = interpolate(frame - delay - 10, [0, 18], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 20,
      fontFamily: display, fontSize: 78, fontWeight: 500, color: COLORS.ink,
      opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
      position: "relative",
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, border: `4px solid ${COLORS.ink}` }} />
      <div style={{ position: "relative" }}>
        {text}
        <div style={{
          position: "absolute", left: 0, top: "52%", height: 6, background: COLORS.red,
          width: `${strike}%`,
        }} />
      </div>
    </div>
  );
};

export const NotifyProblem: React.FC = () => {
  const shake = useCurrentFrame();
  return (
    <AbsoluteFill style={{
      background: COLORS.green, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", gap: 28,
    }}>
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 600, letterSpacing: 4,
        textTransform: "uppercase", color: COLORS.yellow, opacity: useIn(0),
      }}>Samstag · 16:47</div>
      <Title delay={6} size={140} color={COLORS.cream}>Wieder</Title>
      <Title delay={14} size={140} color={COLORS.yellow}>vergessen?</Title>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 18, color: COLORS.cream }}>
        <StrikeItem text="Brot" delay={28} />
        <StrikeItem text="Milch" delay={38} />
        <StrikeItem text="Kaffee" delay={48} />
      </div>
      <div style={{ position: "absolute", bottom: 100, left: 90, fontFamily: body, fontSize: 34, color: COLORS.cream, opacity: 0.7,
        transform: `translateX(${Math.sin(shake / 6) * 2}px)` }}>
        Läden bis Sonntag zu.
      </div>
    </AbsoluteFill>
  );
};