import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, body, display } from "../theme";

const STORES = ["ALDI", "REWE", "LIDL", "KAUFLAND", "EDEKA", "PENNY"];

export const Closed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const label = spring({ frame, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 90, justifyContent: "center", alignItems: "flex-start", gap: 12 }}>
      <div style={{
        fontFamily: body, fontSize: 30, fontWeight: 700, letterSpacing: 6,
        textTransform: "uppercase", color: COLORS.red,
        opacity: label, transform: `translateY(${interpolate(label, [0, 1], [12, 0])}px)`,
      }}>Alle. Zu.</div>
      {STORES.map((name, i) => {
        const start = 8 + i * 12;
        const s = spring({ frame: frame - start, fps, config: { damping: 200 } });
        const strike = interpolate(frame - start - 10, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={name} style={{
            display: "flex", alignItems: "center", gap: 28,
            opacity: s, transform: `translateX(${interpolate(s, [0, 1], [-80, 0])}px)`,
          }}>
            <div style={{
              fontFamily: display, fontSize: 140, fontWeight: 700,
              color: COLORS.ink, letterSpacing: -4, lineHeight: 1, position: "relative",
            }}>
              {name}
              <div style={{
                position: "absolute", left: -8, right: -8, top: "50%",
                height: 10, background: COLORS.red, transformOrigin: "left center",
                transform: `translateY(-4px) scaleX(${strike})`, borderRadius: 4,
              }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};