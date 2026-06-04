import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, Fonts, MaxContentWidth, Spacing, ST } from '@/constants/theme';

export default function HistoryScreen() {
  const safeAreaInsets = useSafeAreaInsets();
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

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>{"</>"}</Text>
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
      </View>
    </ScrollView>
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
