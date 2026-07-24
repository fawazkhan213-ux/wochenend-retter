import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, useIn, body, display } from "./_shared";

const PushCard: React.FC<{ delay: number; time: string; title: string; msg: string; tint?: string }> = ({ delay, time, title, msg, tint = COLORS.red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{
      width: 820, background: "rgba(255,255,255,0.96)", borderRadius: 40,
      padding: "28px 34px", display: "flex", gap: 24, alignItems: "flex-start",
      boxShadow: "0 30px 70px rgba(0,0,0,0.22)",
      backdropFilter: undefined,
      transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`,
      opacity: s,
      border: `1px solid rgba(0,0,0,0.06)`,
    }}>
      <div style={{
        width: 84, height: 84, borderRadius: 22, background: tint,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
          <path d="M12 3a6 6 0 0 0-6 6v4l-2 3h16l-2-3V9a6 6 0 0 0-6-6z" fill={COLORS.cream} />
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: body, fontSize: 26, fontWeight: 700, color: COLORS.ink, letterSpacing: 1 }}>WOCHENEND-RETTER</div>
          <div style={{ fontFamily: body, fontSize: 24, color: COLORS.zinc }}>{time}</div>
        </div>
        <div style={{ fontFamily: display, fontSize: 40, fontWeight: 700, color: COLORS.ink, marginTop: 6 }}>{title}</div>
        <div style={{ fontFamily: body, fontSize: 30, color: COLORS.zinc, marginTop: 4, lineHeight: 1.25 }}>{msg}</div>
      </div>
    </div>
  );
};

export const NotifyPush: React.FC = () => {
  const t = useIn(0);
  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${COLORS.ink} 0%, #2a2a2a 100%)`,
      padding: 80, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 24,
    }}>
      <div style={{
        fontFamily: body, fontSize: 28, fontWeight: 600, letterSpacing: 4,
        textTransform: "uppercase", color: COLORS.yellow, opacity: t, marginBottom: 20,
      }}>Push · direkt aufs Handy</div>
      <PushCard delay={4}  time="Fr · 18:00" title="Wochenende in Sicht" msg="Denk an deine Einkaufsliste." tint={COLORS.yellow} />
      <PushCard delay={22} time="Sa · 15:00" title="Läden schließen bald" msg="Nur noch 3 Stunden — nichts vergessen?" tint={COLORS.red} />
      <PushCard delay={40} time="So · 10:00" title="Sonntagsplan?" msg="Museen und Cafés in deiner Nähe." tint={COLORS.green} />
    </AbsoluteFill>
  );
};