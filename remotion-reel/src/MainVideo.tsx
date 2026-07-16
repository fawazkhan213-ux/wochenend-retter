import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { Hook } from "./scenes/Hook";
import { Problem } from "./scenes/Problem";
import { AppReveal } from "./scenes/AppReveal";
import { FeatureOpen } from "./scenes/FeatureOpen";
import { FeatureShopping } from "./scenes/FeatureShopping";
import { FeaturePlan } from "./scenes/FeaturePlan";
import { FeatureSundays } from "./scenes/FeatureSundays";
import { CTA } from "./scenes/CTA";

const S = { d: 90, t: 15 };
// 8 scenes * 90 - 7 * 15 = 615
export const DURATION = 8 * S.d - 7 * S.t;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={S.d}><Hook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><Problem /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={linearTiming({ durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><AppReveal /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><FeatureOpen /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><FeatureShopping /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><FeaturePlan /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><FeatureSundays /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: S.t })} />
        <TransitionSeries.Sequence durationInFrames={S.d}><CTA /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};