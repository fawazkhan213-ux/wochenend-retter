import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, Title, useIn, body, display } from "./_shared";

const Icon: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const s = useIn(delay, 14);
  const drift = Math.sin((frame - delay) / 30) * 6;
  return (
    <div style={{
      width: 260, height: 260, borderRadius: 60, background: COLORS.cream,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 30px 70px rgba(0,0,0,0.25)",
      transform: `scale(${interpolate(s, [0, 1], [0.6, 1])}) translateY(${drift}px)`,
      opacity: s,
    }}>
      <div style={{ position: "relative", width: 180, height: 180 }}>
        <div style={{
          position: "absolute", left: "50%", top: 30, width: 90, height: 90, marginLeft: -45,
          borderRadius: 999, background: COLORS.yellow,
          clipPath: "inset(0 0 50% 0)",
        }} />
        <div style={{
          position: "absolute", left: 10, bottom: 10, right: 10, height: 100,
          background: COLORS.green, borderRadius: "10px 10px 20px 20px",
        }} />
      </div>
    </div>
  );
};

export const NotifyCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const arrow = useIn(40);
  return (
    <AbsoluteFill style={{
      background: COLORS.green, padding: 90,
      display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 40,
    }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 20%, ${COLORS.yellow}33, transparent 60%)` }} />
      </AbsoluteFill>
      <Icon delay={0} />
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 600, letterSpacing: 4,
        textTransform: "uppercase", color: COLORS.yellow, opacity: useIn(12),
      }}>Wochenend-Retter</div>
      <Title delay={18} size={130} color={COLORS.cream} align="center">Aktiviere im</Title>
      <Title delay={28} size={160} color={COLORS.yellow} align="center">Konto.</Title>
      <div style={{
        marginTop: 20, fontFamily: body, fontSize: 34, color: COLORS.cream, opacity: arrow * 0.85,
        transform: `translateY(${interpolate(arrow, [0, 1], [20, Math.sin(frame / 8) * 4])}px)`,
      }}>iOS 16.4+ · Android · als App installieren</div>
    </AbsoluteFill>
  );
};