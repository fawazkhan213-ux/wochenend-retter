import React from "react";
import { AbsoluteFill } from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { COLORS } from "./theme";
import { Hook } from "./scenes/Hook";
import { Keypoint } from "./scenes/Keypoint";
import { Features } from "./scenes/Features";
import { Outro } from "./scenes/Outro";

// 20s @ 30fps = 600 frames.
// 150 + 180 + 150 + 165 - 3*15 (transition overlap) = 600
const T = 15;
export const DURATION = 600;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.cream }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}><Hook /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={180}><Keypoint /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={150}><Features /></TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />
        <TransitionSeries.Sequence durationInFrames={165}><Outro /></TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};