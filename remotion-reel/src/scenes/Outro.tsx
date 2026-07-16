import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, staticFile, Img } from "remotion";
import { COLORS, useIn, body, display } from "./_shared";

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const logo = useIn(0, 18);
  const name = useIn(20, 22);
  const cta = useIn(45, 20);
  const url = useIn(70, 20);
  return (
    <AbsoluteFill style={{
      background: COLORS.cream, padding: 90,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center", gap: 30,
    }}>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${COLORS.yellow}33, transparent 60%)`,
        }} />
      </AbsoluteFill>
      <div style={{
        transform: `scale(${logo}) rotate(${interpolate(logo, [0, 1], [-15, 0])}deg)`,
        opacity: logo,
      }}>
        <Img src={staticFile("logo.png")} style={{
          width: 380, height: 380, borderRadius: 72,
          boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
        }} />
      </div>
      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 140, lineHeight: 0.95,
        color: COLORS.ink, letterSpacing: -4, textAlign: "center",
        opacity: name, transform: `translateY(${interpolate(name, [0, 1], [30, 0])}px)`,
      }}>Wochenend-<br/>Retter</div>
      <div style={{
        fontFamily: body, fontSize: 42, color: COLORS.zinc, fontWeight: 500, textAlign: "center",
        opacity: cta, transform: `translateY(${interpolate(cta, [0, 1], [20, 0])}px)`,
      }}>Jetzt holen — kostenlos.</div>
      <div style={{
        marginTop: 20, background: COLORS.ink, color: COLORS.yellow,
        padding: "32px 60px", borderRadius: 999,
        fontFamily: body, fontSize: 44, fontWeight: 600,
        opacity: url, transform: `scale(${interpolate(url, [0, 1], [0.85, 1])})`,
        boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      }}>wochenend-retter.app</div>
    </AbsoluteFill>
  );
};