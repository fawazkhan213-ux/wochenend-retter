import { useEffect, useState } from "react";

// True after the first client-side render. Use to gate any UI whose value
// depends on `Date.now()`, `Math.random()`, `navigator`, or `localStorage`
// so SSR + first client render stay identical (no hydration mismatch).
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}