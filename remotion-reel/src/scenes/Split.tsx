import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, body, display } from "../theme";
import { useIn } from "./_shared";

// Split-screen: left = closed shutters (red), right = empty basket (cream).
// Bold two-panel Bauhaus divide. Message: der Tag, an dem nichts geht.
export const Split: React.FC = () => {
  const frame = useCurrentFrame();
  const wipe = useIn(0, 200);
  const lbl = useIn(20);
  const big = useIn(30, 20);
  const shake = frame < 40 ? Math.sin(frame * 1.4) * 2 : 0;
  return (
    <AbsoluteFill>
      {/* Left panel */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: "50%",
        background: COLORS.red,
        transform: `translateX(${interpolate(wipe, [0, 1], [-100, 0])}%)`,
      }}>
        {/* Shutter slats */}
        <div style={{ position: "absolute", inset: 60, borderRadius: 24, overflow: "hidden", border: `4px solid ${COLORS.cream}` }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", left: 0, right: 0, height: 44,
              top: i * 60 + 10,
              background: `#8b2418`,
              borderTop: `2px solid #6b1a11`,
              borderBottom: `2px solid #6b1a11`,
              opacity: interpolate(useIn(6 + i * 2), [0, 1], [0, 1]),
            }} />
          ))}
          <div style={{
            position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%) rotate(-8deg)",
            padding: "18px 34px", background: COLORS.cream, color: COLORS.red,
            fontFamily: display, fontWeight: 700, fontSize: 56, letterSpacing: -1,
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            opacity: useIn(24),
          }}>GESCHLOSSEN</div>
        </div>
      </div>
      {/* Right panel */}
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: "50%",
        background: COLORS.cream,
        transform: `translateX(${interpolate(wipe, [0, 1], [100, 0])}%)`,
      }}>
        {/* Empty basket outline */}
        <div style={{ position: "absolute", inset: 60, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            width: 380, height: 260, borderRadius: "12px 12px 24px 24px",
            border: `10px solid ${COLORS.ink}`,
            position: "relative",
            transform: `rotate(${shake}deg)`,
          }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                position: "absolute", top: 20, bottom: 20, left: 40 + i * 60,
                width: 8, background: COLORS.ink, borderRadius: 4,
              }} />
            ))}
            <div style={{
              position: "absolute", left: -20, top: -60, width: 100, height: 60,
              borderTop: `10px solid ${COLORS.ink}`, borderLeft: `10px solid ${COLORS.ink}`, borderRight: `10px solid ${COLORS.ink}`,
              borderRadius: "50px 50px 0 0",
            }} />
            <div style={{
              position: "absolute", right: -20, top: -60, width: 100, height: 60,
              borderTop: `10px solid ${COLORS.ink}`, borderLeft: `10px solid ${COLORS.ink}`, borderRight: `10px solid ${COLORS.ink}`,
              borderRadius: "50px 50px 0 0",
            }} />
          </div>
        </div>
      </div>
      {/* Overlaid caption */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 120,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}>
        <div style={{
          fontFamily: body, fontSize: 26, fontWeight: 700, letterSpacing: 6,
          textTransform: "uppercase", color: COLORS.cream,
          background: COLORS.ink, padding: "12px 24px",
          opacity: lbl, transform: `translateY(${interpolate(lbl, [0, 1], [16, 0])}px)`,
        }}>Sonntag in Deutschland</div>
        <div style={{
          fontFamily: display, fontSize: 120, fontWeight: 700, color: COLORS.ink,
          letterSpacing: -4, lineHeight: 0.95, textAlign: "center",
          background: COLORS.yellow, padding: "10px 34px",
          opacity: big, transform: `translateY(${interpolate(big, [0, 1], [30, 0])}px)`,
        }}>Alles dicht.</div>
      </div>
    </AbsoluteFill>
  );
};