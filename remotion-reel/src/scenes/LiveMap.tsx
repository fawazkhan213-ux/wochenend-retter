import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const PINS = [
  { x: 22, y: 30, c: COLORS.green, label: "REWE To Go" },
  { x: 65, y: 22, c: COLORS.yellow, label: "Bäckerei" },
  { x: 48, y: 55, c: COLORS.green, label: "Aral 24/7" },
  { x: 78, y: 68, c: COLORS.red, label: "Aldi" },
  { x: 30, y: 78, c: COLORS.green, label: "Späti" },
];

const ROWS = [
  { n: "REWE To Go", d: "Hbf · 350 m", s: "offen bis 22:00", c: COLORS.green },
  { n: "Bäckerei Kamps", d: "0.4 km", s: "schließt 14:00", c: COLORS.yellow },
  { n: "Aral Tankstelle", d: "1.1 km", s: "24/7 geöffnet", c: COLORS.green },
];

export const LiveMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const label = spring({ frame, fps, config: { damping: 200 } });
  const map = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const card = spring({ frame: frame - 55, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 70, justifyContent: "center", gap: 30 }}>
      <div style={{
        fontFamily: body, fontSize: 28, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.green,
        opacity: label,
      }}>Live · in deiner Nähe</div>
      <div style={{
        fontFamily: display, fontSize: 110, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -3, lineHeight: 0.95,
        opacity: label, transform: `translateY(${interpolate(label, [0, 1], [20, 0])}px)`,
      }}>Wer hat<br/><span style={{ color: COLORS.green }}>jetzt offen?</span></div>

      {/* faux map */}
      <div style={{
        position: "relative", width: "100%", height: 620, borderRadius: 40,
        background: "linear-gradient(135deg,#EDE4D3,#DFCFB8)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)", overflow: "hidden",
        opacity: map, transform: `translateY(${interpolate(map, [0, 1], [40, 0])}px)`,
      }}>
        {/* street lines */}
        {[15, 40, 70].map((y) => (
          <div key={"h" + y} style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, height: 6, background: "#fff8", borderRadius: 4 }} />
        ))}
        {[20, 55, 85].map((x) => (
          <div key={"v" + x} style={{ position: "absolute", top: 0, bottom: 0, left: `${x}%`, width: 6, background: "#fff8", borderRadius: 4 }} />
        ))}
        {PINS.map((p, i) => {
          const pop = spring({ frame: frame - 20 - i * 6, fps, config: { damping: 10, stiffness: 140 } });
          const pulse = 1 + Math.sin((frame - i * 5) / 6) * 0.15;
          return (
            <div key={i} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              transform: `translate(-50%,-50%) scale(${pop})`, opacity: pop,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 999, background: p.c,
                boxShadow: `0 0 0 ${14 * pulse}px ${p.c}33`,
                border: "4px solid #fff",
              }} />
            </div>
          );
        })}
      </div>

      {/* result card */}
      <div style={{
        background: "#fff", borderRadius: 32, padding: 30,
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        opacity: card, transform: `translateY(${interpolate(card, [0, 1], [40, 0])}px)`,
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        {ROWS.map((r, i) => {
          const s = spring({ frame: frame - 60 - i * 6, fps, config: { damping: 200 } });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
            }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, background: r.c, boxShadow: `0 0 0 5px ${r.c}22` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: body, fontSize: 34, fontWeight: 700, color: COLORS.ink }}>{r.n}</div>
                <div style={{ fontFamily: body, fontSize: 22, color: COLORS.zinc, marginTop: 2 }}>{r.d}</div>
              </div>
              <div style={{ fontFamily: body, fontSize: 22, color: r.c, fontWeight: 700 }}>{r.s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};