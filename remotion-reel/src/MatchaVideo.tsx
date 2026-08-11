import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { COLORS } from "./theme";
import { MatchaHook } from "./scenes/MatchaHook";
import { MatchaSearch } from "./scenes/MatchaSearch";
import { MatchaRoute } from "./scenes/MatchaRoute";
import { MatchaCTA } from "./scenes/MatchaCTA";

// 10s @ 30fps = 300. Scenes 84+96+92+58 = 330; minus 3 * 10 transitions = 300.
const T = 10;
export const MATCHA_DURATION = 300;
const spring10 = springTiming({ config: { damping: 200 }, durationInFrames: T });

export const MatchaVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.cream }}>
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={84}><MatchaHook /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={wipe({ direction: "from-right" })} timing={spring10} />
      <TransitionSeries.Sequence durationInFrames={96}><MatchaSearch /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={spring10} />
      <TransitionSeries.Sequence durationInFrames={92}><MatchaRoute /></TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
      <TransitionSeries.Sequence durationInFrames={58}><MatchaCTA /></TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);