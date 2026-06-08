import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';

type SessionContextValue = {
  session: Session | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
});

/** Read the current Supabase session anywhere inside <SessionProvider />. */
export function useSession() {
  return useContext(SessionContext);
}

/**
 * Loads the existing Supabase session on mount and keeps it in sync with
 * auth changes (sign in, sign out, token refresh). Kept intentionally small —
 * screens trigger auth actions, this just reflects the resulting state.
 */
export function SessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading }}>{children}</SessionContext.Provider>
  );
}
