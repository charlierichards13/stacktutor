import { useCallback, useEffect, useState } from 'react';

import { useSession } from '@/hooks/use-session';
import { fetchReviewHistory, type ReviewHistoryItem } from '@/lib/reviews';

type ReviewHistoryState =
  | { status: 'loading'; reviews: null }
  | { status: 'error'; reviews: null }
  | { status: 'ready'; reviews: ReviewHistoryItem[] };

/**
 * Loads the signed-in user's review history. Exposes a discriminated
 * status so screens can render loading / error / ready states without
 * juggling separate flags, plus a retry() for the error state.
 */
export function useReviewHistory() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;

  const [state, setState] = useState<ReviewHistoryState>({ status: 'loading', reviews: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Tabs render behind the signed-in route guard, so userId is only null
    // momentarily during sign-out — keep showing the loading state then.
    if (!userId) return;

    let cancelled = false;

    fetchReviewHistory(userId)
      .then((reviews) => {
        if (!cancelled) setState({ status: 'ready', reviews });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', reviews: null });
      });

    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  // Resetting to loading here (not in the effect) keeps the effect's
  // setState calls async-only, which the react-hooks lint rule requires.
  const retry = useCallback(() => {
    setState({ status: 'loading', reviews: null });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
