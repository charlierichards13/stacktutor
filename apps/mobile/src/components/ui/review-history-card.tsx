import { Platform, StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/ui/pill';
import { Fonts, Spacing, ST } from '@/constants/theme';
import type { ReviewLanguage, ReviewMode } from '@/lib/database.types';
import type { ReviewHistoryItem } from '@/lib/reviews';

// Accents match the review mode cards on the home screen.
const MODE_META: Record<ReviewMode, { label: string; accent: string }> = {
  find_bugs: { label: 'Find Bugs', accent: ST.red },
  generate_tests: { label: 'Generate Tests', accent: ST.cyan },
  explain_code: { label: 'Explain Code', accent: ST.purpleLight },
  check_complexity: { label: 'Check Complexity', accent: ST.green },
  security_review: { label: 'Security Review', accent: ST.amber },
  hint_mode: { label: 'Hint Mode', accent: ST.purpleLight },
};

const LANGUAGE_LABELS: Record<ReviewLanguage, string> = {
  java: 'java',
  python: 'python',
  cpp: 'c++',
  typescript: 'typescript',
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ReviewHistoryCard({ review }: { review: ReviewHistoryItem }) {
  const mode = MODE_META[review.review_mode];

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={[styles.mode, { color: mode.accent }]}>{mode.label}</Text>
        <Text style={styles.date}>{formatDate(review.created_at)}</Text>
      </View>
      <Text style={styles.summary} numberOfLines={2}>
        {review.summary ?? 'No summary recorded for this review.'}
      </Text>
      <Pill label={LANGUAGE_LABELS[review.language]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ST.card,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 10,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mode: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  date: {
    color: ST.textMuted,
    fontSize: 12,
  },
  summary: {
    color: ST.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
});
