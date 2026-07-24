import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { NotifyHook } from "./scenes/NotifyHook";
import { NotifyProblem } from "./scenes/NotifyProblem";
import { NotifyPush } from "./scenes/NotifyPush";
import { NotifyCustom } from "./scenes/NotifyCustom";
import { NotifyCTA } from "./scenes/NotifyCTA";

// 15s @ 30fps = 450 frames.
// 76 + 84 + 130 + 100 + 108 = 498; minus 4 × 12 (transitions) = 450.
const T = 12;
export const NOTIFY_DURATION = 450;
const spring12 = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const NotifyVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={76}><NotifyHook /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={84}><NotifyProblem /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={130}><NotifyPush /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spring12} />
      <TransitionSeries.Sequence durationInFrames={100}><NotifyCustom /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={108}><NotifyCTA /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);