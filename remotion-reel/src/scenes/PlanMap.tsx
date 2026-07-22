import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const PINS = [
  { x: 26, y: 28, c: COLORS.green, icon: "🖼", label: "Museum" },
  { x: 68, y: 22, c: COLORS.yellow, icon: "☕", label: "Café" },
  { x: 50, y: 52, c: COLORS.red, icon: "📍", label: "Du" },
  { x: 78, y: 62, c: COLORS.green, icon: "🌳", label: "Park" },
  { x: 30, y: 74, c: COLORS.green, icon: "🎬", label: "Kino" },
];

export const PlanMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const label = spring({ frame, fps, config: { damping: 200 } });
  const title = spring({ frame: frame - 8, fps, config: { damping: 200 } });
  const map = spring({ frame: frame - 20, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 80, justifyContent: "center", gap: 30 }}>
      <div style={{
        fontFamily: body, fontSize: 28, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.green, opacity: label,
      }}>In deiner Nähe · jetzt</div>
      <div style={{
        fontFamily: display, fontSize: 130, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -4, lineHeight: 0.9,
        opacity: title, transform: `translateY(${interpolate(title, [0, 1], [24, 0])}px)`,
      }}>Was du<br/><span style={{ color: COLORS.green }}>heute machst.</span></div>

      <div style={{
        position: "relative", width: "100%", height: 900, borderRadius: 44,
        background: "linear-gradient(135deg,#EDE4D3,#DFCFB8)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)", overflow: "hidden",
        opacity: map, transform: `translateY(${interpolate(map, [0, 1], [40, 0])}px)`,
      }}>
        {[18, 42, 68].map((y) => (
          <div key={"h" + y} style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, height: 6, background: "#fff9", borderRadius: 4 }} />
        ))}
        {[22, 55, 82].map((x) => (
          <div key={"v" + x} style={{ position: "absolute", top: 0, bottom: 0, left: `${x}%`, width: 6, background: "#fff9", borderRadius: 4 }} />
        ))}

        {/* animated route line from "Du" to Museum */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path
            d="M 50% 52% Q 38% 40% 26% 28%"
            stroke={COLORS.green}
            strokeWidth={8}
            strokeDasharray="14 14"
            fill="none"
            strokeLinecap="round"
            style={{
              strokeDashoffset: interpolate(frame, [30, 110], [400, 0], { extrapolateRight: "clamp" }),
              opacity: interpolate(frame, [30, 45], [0, 1], { extrapolateRight: "clamp" }),
            }}
          />
        </svg>

        {PINS.map((p, i) => {
          const pop = spring({ frame: frame - 30 - i * 7, fps, config: { damping: 10, stiffness: 140 } });
          const pulse = 1 + Math.sin((frame - i * 5) / 6) * 0.18;
          return (
            <div key={i} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              transform: `translate(-50%,-50%) scale(${pop})`, opacity: pop,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: 999, background: p.c,
                boxShadow: `0 0 0 ${18 * pulse}px ${p.c}33`,
                border: "5px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28,
              }}>{p.icon}</div>
              <div style={{
                fontFamily: body, fontSize: 20, fontWeight: 700, color: COLORS.ink,
                background: "#fff", padding: "4px 12px", borderRadius: 999,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}>{p.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};