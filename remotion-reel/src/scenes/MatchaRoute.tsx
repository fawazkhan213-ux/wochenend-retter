import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const PINS = [
  { x: 24, y: 28, c: COLORS.green },
  { x: 66, y: 22, c: COLORS.yellow },
  { x: 50, y: 58, c: COLORS.green },
  { x: 80, y: 70, c: COLORS.red },
];

export const MatchaRoute: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const head = spring({ frame, fps, config: { damping: 22 } });
  const map = spring({ frame: frame - 10, fps, config: { damping: 200 } });
  const route = interpolate(frame, [40, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pill = spring({ frame: frame - 58, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 80, justifyContent: "center", gap: 32 }}>
      <div style={{
        fontFamily: display, fontWeight: 700, fontSize: 128, letterSpacing: -4, lineHeight: 0.95,
        color: COLORS.ink,
        opacity: head, transform: `translateY(${interpolate(head, [0, 1], [40, 0])}px)`,
      }}>WER HAT<br/><span style={{ color: COLORS.green }}>JETZT OFFEN?</span></div>

      <div style={{
        position: "relative", width: "100%", height: 780, borderRadius: 44, overflow: "hidden",
        background: "linear-gradient(135deg,#EDE4D3,#DFCFB8)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.10)",
        opacity: map, transform: `translateY(${interpolate(map, [0, 1], [50, 0])}px)`,
      }}>
        {[16, 42, 68, 88].map((y) => (
          <div key={"h" + y} style={{ position: "absolute", left: 0, right: 0, top: `${y}%`, height: 7, background: "#ffffffaa", borderRadius: 4 }} />
        ))}
        {[18, 52, 84].map((x) => (
          <div key={"v" + x} style={{ position: "absolute", top: 0, bottom: 0, left: `${x}%`, width: 7, background: "#ffffffaa", borderRadius: 4 }} />
        ))}

        {/* animated route */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <path
            d="M 50 58 L 50 42 L 24 42 L 24 28"
            fill="none" stroke={COLORS.green} strokeWidth={1.6} strokeLinecap="round"
            strokeDasharray={100} strokeDashoffset={100 - route * 100}
          />
        </svg>

        {PINS.map((p, i) => {
          const pop = spring({ frame: frame - 22 - i * 6, fps, config: { damping: 10, stiffness: 150 } });
          const pulse = 1 + Math.sin((frame - i * 6) / 6) * 0.18;
          return (
            <div key={i} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              transform: `translate(-50%,-50%) scale(${pop})`, opacity: pop,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 999, background: p.c,
                border: "5px solid #fff", boxShadow: `0 0 0 ${14 * pulse}px ${p.c}33`,
              }} />
            </div>
          );
        })}
      </div>

      <div style={{
        alignSelf: "center", background: COLORS.yellow, color: COLORS.ink,
        padding: "24px 46px", borderRadius: 999, fontFamily: body, fontWeight: 700, fontSize: 38,
        opacity: pill, transform: `scale(${interpolate(pill, [0, 1], [0.8, 1])})`,
      }}>Route in 1 Tap</div>
    </AbsoluteFill>
  );
};