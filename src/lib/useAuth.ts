import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Lightweight browser hook: subscribes to Supabase auth state and returns
// the current user + a "hydrated" flag so callers don't flicker before the
// session is known.
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Listener first, then fetch — recommended order.
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null);
      },
    );
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setHydrated(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, hydrated, isAuthenticated: !!user };
}