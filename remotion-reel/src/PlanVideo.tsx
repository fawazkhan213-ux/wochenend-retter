import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { Bored } from "./scenes/Bored";
import { Idea } from "./scenes/Idea";
import { PlanMap } from "./scenes/PlanMap";
import { PlaceCards } from "./scenes/PlaceCards";
import { OutroPlan } from "./scenes/OutroPlan";

// 15s @ 30fps = 450 frames.
// 78+90+120+110+100 = 498 minus 4 × 12 = 48 → 450.
const T = 12;
export const PLAN_DURATION = 450;
const spring12 = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const PlanVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={78}><Bored /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={90}><Idea /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={120}><PlanMap /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={110}><PlaceCards /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={100}><OutroPlan /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);