import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { WeekHook } from "./scenes/WeekHook";
import { Split } from "./scenes/Split";
import { LogoDrop } from "./scenes/LogoDrop";
import { Triptych } from "./scenes/Triptych";
import { WeekCTA } from "./scenes/WeekCTA";

// 15s @ 30fps = 450. Scenes 82+100+100+108+110 = 500; minus 5 * 10 (t=10) = 450.
const T = 10;
export const WEEK_DURATION = 450;
const spring10 = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const WeekVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={82}><WeekHook /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={spring10} />
      <TransitionSeries.Sequence durationInFrames={100}><Split /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={100}><LogoDrop /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spring10} />
      <TransitionSeries.Sequence durationInFrames={108}><Triptych /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spring10} />
      <TransitionSeries.Sequence durationInFrames={110}><WeekCTA /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);