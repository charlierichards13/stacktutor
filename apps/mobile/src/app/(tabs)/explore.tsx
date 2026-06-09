import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FormMessage } from '@/components/ui/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ReviewHistoryCard } from '@/components/ui/review-history-card';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing, ST } from '@/constants/theme';
import { useReviewHistory } from '@/hooks/use-review-history';

export default function HistoryScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const history = useReviewHistory();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentInset={insets}
      contentContainerStyle={[styles.content, contentPlatformStyle]}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Review History</Text>
          <Text style={styles.subtitle}>Your past code reviews will appear here.</Text>
        </View>

        {history.status === 'loading' && (
          <View style={styles.loadingState}>
            <ActivityIndicator color={ST.purpleLight} />
            <Text style={styles.loadingText}>Loading your reviews…</Text>
          </View>
        )}

        {history.status === 'error' && (
          <View style={styles.errorState}>
            <FormMessage tone="error">
              Couldn’t load your review history. Check your connection and try again.
            </FormMessage>
            <PrimaryButton variant="ghost" onPress={history.retry}>
              Try again
            </PrimaryButton>
          </View>
        )}

        {history.status === 'ready' &&
          (history.reviews.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={styles.list}>
              <Text style={styles.sectionLabel}>past reviews</Text>
              {history.reviews.map((review) => (
                <ReviewHistoryCard key={review.id} review={review} />
              ))}
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Text style={styles.emptyIconText}>{'</>'}</Text>
      </View>
      <Text style={styles.emptyTitle}>No reviews yet</Text>
      <Text style={styles.emptyDesc}>
        Submit code from the home screen to start your first review.
      </Text>
      <View style={styles.hint}>
        <Text style={styles.hintLabel}>supported languages</Text>
        <View style={styles.hintPills}>
          {['java', 'python', 'c++', 'typescript'].map((lang) => (
            <Text key={lang} style={styles.langPill}>{lang}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: ST.bg,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  title: {
    color: ST.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: ST.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  loadingState: {
    marginTop: Spacing.six,
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    color: ST.textMuted,
    fontSize: 13,
  },
  errorState: {
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontWeight: '500',
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    marginTop: Spacing.five,
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.six,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ST.surface,
    borderWidth: 1,
    borderColor: ST.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconText: {
    fontFamily: Fonts.mono,
    fontSize: 14,
    fontWeight: '600',
    color: ST.purpleLight,
  },
  emptyTitle: {
    color: ST.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyDesc: {
    color: ST.textMuted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Spacing.five,
  },
  hint: {
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  hintLabel: {
    fontFamily: Fonts.mono,
    fontWeight: '500',
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  hintPills: {
    flexDirection: 'row',
    gap: Spacing.one,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  langPill: {
    fontFamily: Fonts.mono,
    fontWeight: '500',
    fontSize: 11,
    color: ST.purpleLight,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
});
