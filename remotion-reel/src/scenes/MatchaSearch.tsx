import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const WORD = "matcha";
const ROWS = [
  { n: "Späti Kreuzberg", d: "350 m", s: "offen bis 22:00", c: COLORS.green },
  { n: "Bäckerei Kamps", d: "0,4 km", s: "schließt in 45 min", c: COLORS.yellow },
  { n: "Aldi Süd", d: "1,1 km", s: "geschlossen", c: COLORS.red },
];

export const MatchaSearch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 22 } });
  const bar = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 140 } });
  const chars = Math.max(0, Math.min(WORD.length, Math.floor((frame - 12) / 3)));
  const caret = Math.floor(frame / 8) % 2 === 0 ? 1 : 0;

  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 80, justifyContent: "center", gap: 34 }}>
      <div style={{ position: "absolute", left: -120, top: -120, width: 420, height: 420, borderRadius: "50%", background: COLORS.yellow, opacity: 0.9 }} />
      <div style={{ position: "absolute", right: -160, bottom: -160, width: 480, height: 480, borderRadius: "50%", background: COLORS.green, opacity: 0.9 }} />

      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 130, letterSpacing: -4, color: COLORS.ink,
        lineHeight: 0.95,
        opacity: head, transform: `translateY(${interpolate(head, [0, 1], [40, 0])}px)`,
      }}>EINFACH<br/>SUCHEN.</div>

      <div style={{
        background: "#fff", borderRadius: 999, padding: "34px 44px",
        display: "flex", alignItems: "center", gap: 26,
        boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
        opacity: bar, transform: `translateY(${interpolate(bar, [0, 1], [50, 0])}px) scale(${interpolate(bar, [0, 1], [0.94, 1])})`,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", border: `7px solid ${COLORS.ink}`,
          position: "relative", flexShrink: 0,
        }}>
          <div style={{ position: "absolute", right: -18, bottom: -12, width: 26, height: 7, background: COLORS.ink, borderRadius: 4, transform: "rotate(45deg)" }} />
        </div>
        <div style={{ fontFamily: body, fontSize: 54, fontWeight: 600, color: COLORS.ink }}>
          {WORD.slice(0, chars)}
          <span style={{ opacity: caret }}>|</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 10 }}>
        {ROWS.map((r, i) => {
          const s = spring({ frame: frame - 34 - i * 7, fps, config: { damping: 200 } });
          return (
            <div key={i} style={{
              background: "#fff", borderRadius: 28, padding: "26px 32px",
              display: "flex", alignItems: "center", gap: 22,
              boxShadow: "0 16px 40px rgba(0,0,0,0.07)",
              opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-60, 0])}px)`,
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 999, background: r.c, boxShadow: `0 0 0 8px ${r.c}22`, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: body, fontSize: 38, fontWeight: 700, color: COLORS.ink }}>{r.n}</div>
                <div style={{ fontFamily: body, fontSize: 26, color: COLORS.zinc, marginTop: 4 }}>{r.d}</div>
              </div>
              <div style={{ fontFamily: body, fontSize: 26, fontWeight: 700, color: r.c, textAlign: "right" }}>{r.s}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};