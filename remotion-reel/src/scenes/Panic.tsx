import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, body, display } from "../theme";

// Cold open: full-red flash with a jumping clock. 60 frames = 2s.
export const Panic: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 4, 10], [1, 0.3, 0], { extrapolateRight: "clamp" });
  const shake = Math.sin(frame * 1.3) * (frame < 30 ? 6 : 0);
  const min = 47 + Math.floor(frame / 6);
  const clock = `11:${String(min % 60).padStart(2, "0")}`;
  const scale = interpolate(frame, [0, 20], [1.2, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: COLORS.red, padding: 90, justifyContent: "center", alignItems: "flex-start" }}>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
      <div style={{ transform: `translateX(${shake}px) scale(${scale})`, transformOrigin: "left center" }}>
        <div style={{ fontFamily: body, fontSize: 34, fontWeight: 700, letterSpacing: 6, textTransform: "uppercase", color: "#ffd7d1" }}>
          Sonntag · Bochum
        </div>
        <div style={{ fontFamily: display, fontSize: 420, fontWeight: 700, color: "#fff", lineHeight: 0.9, letterSpacing: -14, marginTop: 20 }}>
          {clock}
        </div>
        <div style={{ fontFamily: display, fontSize: 96, fontWeight: 700, color: "#fff", lineHeight: 1, letterSpacing: -3, marginTop: 20 }}>
          Kühlschrank<br/>leer.
        </div>
      </div>
    </AbsoluteFill>
  );
};