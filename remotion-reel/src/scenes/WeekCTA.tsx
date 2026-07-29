import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, staticFile, Img } from "remotion";
import { COLORS, body, display } from "../theme";
import { useIn } from "./_shared";

export const WeekCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame, fps, config: { damping: 12, stiffness: 140 } });
  const l1 = useIn(14, 22);
  const l2 = useIn(28, 22);
  const pill = useIn(46, 10);
  const drift = Math.sin(frame / 22) * 5;
  return (
    <AbsoluteFill style={{ background: COLORS.green, padding: 90, justifyContent: "center", alignItems: "center", gap: 30 }}>
      <div style={{ position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 20%, ${COLORS.yellow}44, transparent 60%)` }} />
      <div style={{ transform: `scale(${logo}) translateY(${drift}px)`, opacity: logo }}>
        <Img src={staticFile("logo.png")} style={{ width: 240, height: 240, borderRadius: 56, boxShadow: "0 30px 80px rgba(0,0,0,0.3)" }} />
      </div>
      <div style={{
        fontFamily: display, fontSize: 130, fontWeight: 700, color: COLORS.cream,
        letterSpacing: -4, lineHeight: 0.9, textAlign: "center",
        opacity: l1, transform: `translateY(${interpolate(l1, [0, 1], [24, 0])}px)`,
      }}>Hol dir den</div>
      <div style={{
        fontFamily: display, fontSize: 190, fontWeight: 700, color: COLORS.yellow,
        letterSpacing: -6, lineHeight: 0.85, textAlign: "center",
        opacity: l2, transform: `translateY(${interpolate(l2, [0, 1], [30, 0])}px)`,
      }}>Sonntag<br/>zurück.</div>
      <div style={{
        marginTop: 20, background: COLORS.cream, color: COLORS.ink,
        padding: "28px 52px", borderRadius: 999,
        fontFamily: body, fontSize: 40, fontWeight: 700,
        opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.8, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
      }}>Link in Bio · kostenlos</div>
    </AbsoluteFill>
  );
};