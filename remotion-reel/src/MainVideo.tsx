import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { Panic } from "./scenes/Panic";
import { Closed } from "./scenes/Closed";
import { Reveal } from "./scenes/Reveal";
import { LiveMap } from "./scenes/LiveMap";
import { Chips } from "./scenes/Chips";
import { CTA } from "./scenes/CTA";

// 20s @ 30fps = 600 frames.
// sequences 60+130+130+160+100+80 = 660 minus 5 transitions × 12 = 60 → 600.
const T = 12;
export const DURATION = 600;

const spring12 = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60}><Panic /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={130}><Closed /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={130}><Reveal /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={160}><LiveMap /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={100}><Chips /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={80}><CTA /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);