import type { Database } from './database.types';
import { supabase } from './supabase';

export type CodeReviewRow = Database['public']['Tables']['code_reviews']['Row'];

/**
 * The columns the History list needs. code_input and ai_response are
 * deliberately excluded — they can be large and belong to a future
 * review-detail screen.
 */
export type ReviewHistoryItem = Pick<
  CodeReviewRow,
  'id' | 'language' | 'review_mode' | 'summary' | 'created_at'
>;

/**
 * Fetches the given user's saved code reviews, newest first.
 * RLS already scopes rows to the signed-in user; the explicit filter keeps
 * the query self-describing and hits the (user_id, created_at) index.
 */
export async function fetchReviewHistory(userId: string): Promise<ReviewHistoryItem[]> {
  const { data, error } = await supabase
    .from('code_reviews')
    .select('id, language, review_mode, summary, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
