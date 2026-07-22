import { Composition } from "remotion";
import { MainVideo, DURATION } from "./MainVideo";
import { PlanVideo, PLAN_DURATION } from "./PlanVideo";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="plan"
    component={PlanVideo}
    durationInFrames={PLAN_DURATION}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);