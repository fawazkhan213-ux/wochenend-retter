import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

export const display = loadDisplay("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
export const body = loadBody("normal", { weights: ["400", "600"], subsets: ["latin"] }).fontFamily;

export const COLORS = {
  cream: "#F5EFE6",
  ink: "#141414",
  yellow: "#E9A73C",
  red: "#C0392B",
  green: "#1F4B33",
  zinc: "#6B6B6B",
};