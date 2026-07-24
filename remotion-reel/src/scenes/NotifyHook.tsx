import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Label, Title, useIn, body } from "./_shared";

const Bell: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = useIn(delay, 12);
  const wobble = Math.sin((frame - delay) / 4) * (frame > delay + 15 && frame < delay + 55 ? 8 : 0);
  return (
    <div style={{
      width: 220, height: 220, borderRadius: 56, background: COLORS.red,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 24px 60px rgba(192,57,43,0.35)",
      transform: `scale(${interpolate(s, [0, 1], [0.4, 1])}) rotate(${wobble}deg)`,
      opacity: s,
    }}>
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
        <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" fill={COLORS.cream} />
        <path d="M10 19a2 2 0 0 0 4 0" stroke={COLORS.cream} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", top: -8, right: -8, width: 60, height: 60,
        borderRadius: 999, background: COLORS.yellow, color: COLORS.ink,
        fontFamily: body, fontWeight: 700, fontSize: 34,
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${useIn(delay + 12, 10)})`,
        border: `4px solid ${COLORS.cream}`,
      }}>3</div>
    </div>
  );
};

export const NotifyHook: React.FC = () => {
  return (
    <AbsoluteFill style={{
      background: COLORS.cream, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "flex-start", gap: 36,
    }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 85% 20%, ${COLORS.yellow}55, transparent 55%)`,
        }} />
      </AbsoluteFill>
      <Label delay={0}>Neu · Version 1.1</Label>
      <Bell delay={6} />
      <Title delay={20} size={180}>Nie mehr</Title>
      <Title delay={30} size={220} color={COLORS.red}>vergessen.</Title>
    </AbsoluteFill>
  );
};