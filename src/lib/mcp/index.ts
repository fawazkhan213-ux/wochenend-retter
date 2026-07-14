import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listDeletedListsTool from "./tools/list-deleted-lists";
import getProfileTool from "./tools/get-profile";
import findOpenStoresTool from "./tools/find-open-stores";

// The OAuth issuer MUST be the direct Supabase host. VITE_SUPABASE_PROJECT_ID
// is inlined by Vite at build time; the fallback keeps the URL well-formed
// during the throwaway manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "wochenend-retter-mcp",
  title: "Wochenend-Retter",
  version: "0.1.0",
  instructions:
    "Tools for the Wochenend-Retter app: check the signed-in user's profile, list recently deleted shopping lists (recoverable for 30 days), and find stores open right now near a location in Germany.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, listDeletedListsTool, findOpenStoresTool],
});