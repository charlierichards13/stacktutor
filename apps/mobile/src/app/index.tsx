import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodePreviewCard } from '@/components/ui/code-preview-card';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ReviewModeCard } from '@/components/ui/review-mode-card';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing, ST } from '@/constants/theme';

const REVIEW_MODES = [
  {
    label: 'Find Bugs',
    mono: 'debug',
    description: 'Spot logic errors and edge cases',
    accent: ST.red,
  },
  {
    label: 'Generate Tests',
    mono: 'tests',
    description: 'Build test cases for your code',
    accent: ST.cyan,
  },
  {
    label: 'Explain Code',
    mono: 'explain',
    description: 'Understand what your code does',
    accent: ST.purpleLight,
  },
  {
    label: 'Security Review',
    mono: 'sec',
    description: 'Check for vulnerabilities',
    accent: ST.amber,
  },
] as const;

export default function HomeScreen() {
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
        {/* Brand header */}
        <View style={styles.header}>
          <Text style={styles.brand}>StackTutor</Text>
          <Text style={styles.tagline}>
            {"Learn to debug.\nDon’t just get the answer."}
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaStack}>
          <PrimaryButton variant="primary">Start a Review</PrimaryButton>
          <PrimaryButton variant="ghost">View History</PrimaryButton>
        </View>

        {/* Review modes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>review modes</Text>
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              {REVIEW_MODES.slice(0, 2).map((m) => (
                <ReviewModeCard key={m.label} {...m} />
              ))}
            </View>
            <View style={styles.gridRow}>
              {REVIEW_MODES.slice(2, 4).map((m) => (
                <ReviewModeCard key={m.label} {...m} />
              ))}
            </View>
          </View>
        </View>

        {/* Example review */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>example review</Text>
          <CodePreviewCard />
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
  brand: {
    color: ST.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    color: ST.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  ctaStack: {
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontWeight: 500,
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    gap: Spacing.two,
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
});
