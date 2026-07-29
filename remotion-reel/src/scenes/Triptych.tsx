import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, body, display } from "../theme";
import { useIn } from "./_shared";

const Card: React.FC<{ delay: number; tag: string; title: string; sub: string; bg: string; fg: string; accent: string; glyph: React.ReactNode; }> = ({ delay, tag, title, sub, bg, fg, accent, glyph }) => {
  const s = useIn(delay, 18);
  const frame = useCurrentFrame();
  const drift = Math.sin((frame - delay) / 26) * 3;
  return (
    <div style={{
      width: 820, background: bg, color: fg, borderRadius: 32,
      padding: 40, display: "flex", alignItems: "center", gap: 28,
      boxShadow: "0 30px 60px rgba(0,0,0,0.15)",
      opacity: s,
      transform: `translateX(${interpolate(s, [0, 1], [-120, 0])}px) translateY(${drift}px)`,
    }}>
      <div style={{
        width: 140, height: 140, borderRadius: 28, background: accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>{glyph}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontFamily: body, fontSize: 24, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", opacity: 0.7 }}>{tag}</div>
        <div style={{ fontFamily: display, fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{title}</div>
        <div style={{ fontFamily: body, fontSize: 28, fontWeight: 500, opacity: 0.75 }}>{sub}</div>
      </div>
    </div>
  );
};

// Three feature cards stagger in from the left over cream.
export const Triptych: React.FC = () => {
  const head = useIn(0);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: COLORS.cream, padding: 70, justifyContent: "center", alignItems: "center", gap: 34 }}>
      <div style={{ position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 100%, ${COLORS.green}22, transparent 55%)` }} />
      <div style={{
        alignSelf: "flex-start",
        fontFamily: display, fontSize: 100, fontWeight: 700, color: COLORS.ink,
        letterSpacing: -3, lineHeight: 0.95,
        opacity: head, transform: `translateY(${interpolate(head, [0, 1], [24, 0])}px)`,
      }}>So funktioniert's.</div>
      <Card
        delay={10}
        tag="Einkauf"
        title="Liste + Panik-Score"
        sub="Sa 19:59 → nichts vergessen."
        bg={COLORS.ink} fg={COLORS.cream} accent={COLORS.yellow}
        glyph={<div style={{ color: COLORS.ink, fontFamily: display, fontSize: 90, fontWeight: 700 }}>✓</div>}
      />
      <Card
        delay={22}
        tag="Offen"
        title="Was jetzt auf hat"
        sub="Spätis, Bäcker, Tankstellen."
        bg={COLORS.green} fg={COLORS.cream} accent={COLORS.yellow}
        glyph={<div style={{ width: 60, height: 80, background: COLORS.ink, borderRadius: "30px 30px 30px 0", transform: "rotate(-8deg)" }} />}
      />
      <Card
        delay={34}
        tag="Plan"
        title="Raus. Sofort."
        sub="Museen · Parks · Kinos."
        bg={COLORS.yellow} fg={COLORS.ink} accent={COLORS.green}
        glyph={<div style={{ width: 90, height: 90, borderRadius: "50%", background: COLORS.cream, position: "relative" }}>
          <div style={{ position: "absolute", inset: 22, borderRadius: "50%", background: COLORS.yellow }} />
        </div>}
      />
    </AbsoluteFill>
  );
};