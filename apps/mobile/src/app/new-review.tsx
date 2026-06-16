import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CodeInput } from '@/components/ui/code-input';
import { FormMessage } from '@/components/ui/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ReviewModeCard } from '@/components/ui/review-mode-card';
import { SelectChip } from '@/components/ui/select-chip';
import { Fonts, MaxContentWidth, Spacing, ST } from '@/constants/theme';
import {
  isReviewMode,
  MAX_CODE_LENGTH,
  REVIEW_LANGUAGES,
  REVIEW_MODES,
  type ReviewModeOption,
} from '@/constants/review-options';
import type { ReviewLanguage, ReviewMode } from '@/lib/database.types';

type FormErrors = {
  language?: string;
  reviewMode?: string;
  code?: string;
};

// Render the mode cards two-per-row, matching the home screen grid.
const MODE_ROWS: ReviewModeOption[][] = [];
for (let i = 0; i < REVIEW_MODES.length; i += 2) {
  MODE_ROWS.push(REVIEW_MODES.slice(i, i + 2));
}

export default function NewReviewScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { mode: modeParam } = useLocalSearchParams<{ mode?: string }>();

  const [language, setLanguage] = useState<ReviewLanguage | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode | null>(
    isReviewMode(modeParam) ? modeParam : null,
  );
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function clearNotice() {
    if (submitted) setSubmitted(false);
  }

  function handleSelectLanguage(value: ReviewLanguage) {
    setLanguage(value);
    setErrors((prev) => ({ ...prev, language: undefined }));
    clearNotice();
  }

  function handleSelectMode(value: ReviewMode) {
    setReviewMode(value);
    setErrors((prev) => ({ ...prev, reviewMode: undefined }));
    clearNotice();
  }

  function handleChangeCode(value: string) {
    setCode(value);
    if (value.trim().length > 0) setErrors((prev) => ({ ...prev, code: undefined }));
    clearNotice();
  }

  function handleSubmit() {
    const nextErrors: FormErrors = {};
    if (!language) nextErrors.language = 'Choose the language of your code.';
    if (!reviewMode) nextErrors.reviewMode = 'Pick what kind of review you want.';
    if (code.trim().length === 0) nextErrors.code = 'Paste some code to review.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setSubmitted(false);
      return;
    }

    // UI-only branch: validation passed, but AI review generation and saving
    // are intentionally not wired up yet. Show an honest informational state
    // instead of fabricating a result.
    setSubmitted(true);
  }

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top + Spacing.four,
      paddingBottom: safeAreaInsets.bottom + Spacing.four,
    },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentInset={safeAreaInsets}
        contentContainerStyle={[styles.content, contentPlatformStyle]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Back to home"
              style={({ pressed }) => [styles.backButton, pressed && styles.dimmed]}>
              <Text style={styles.backText}>← Home</Text>
            </Pressable>
            <Text style={styles.title}>Start a review</Text>
            <Text style={styles.subtitle}>
              Tell StackTutor what to look at, then paste your code.
            </Text>
          </View>

          {/* Language */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>language</Text>
            <View style={styles.chipRow}>
              {REVIEW_LANGUAGES.map((option) => (
                <SelectChip
                  key={option.value}
                  label={option.label}
                  selected={language === option.value}
                  onPress={() => handleSelectLanguage(option.value)}
                />
              ))}
            </View>
            {errors.language ? <Text style={styles.fieldError}>{errors.language}</Text> : null}
          </View>

          {/* Review mode */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>review mode</Text>
            <View style={styles.grid}>
              {MODE_ROWS.map((row) => (
                <View key={row[0].value} style={styles.gridRow}>
                  {row.map((option) => (
                    <ReviewModeCard
                      key={option.value}
                      label={option.label}
                      mono={option.mono}
                      description={option.description}
                      accent={option.accent}
                      selected={reviewMode === option.value}
                      onPress={() => handleSelectMode(option.value)}
                    />
                  ))}
                </View>
              ))}
            </View>
            {errors.reviewMode ? <Text style={styles.fieldError}>{errors.reviewMode}</Text> : null}
          </View>

          {/* Code */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>your code</Text>
            <CodeInput
              value={code}
              onChangeText={handleChangeCode}
              maxLength={MAX_CODE_LENGTH}
              placeholder={'// Paste the code you want reviewed'}
              hasError={!!errors.code}
            />
            {errors.code ? <Text style={styles.fieldError}>{errors.code}</Text> : null}
          </View>

          {/* Submit */}
          <View style={styles.actions}>
            <PrimaryButton variant="primary" onPress={handleSubmit}>
              Start Review
            </PrimaryButton>
            {submitted ? (
              <FormMessage tone="info">
                Looks good — your review request is valid. AI review generation isn’t connected
                yet; it lands in the next feature. Nothing was saved or generated.
              </FormMessage>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: ST.bg },
  scroll: { flex: 1, backgroundColor: ST.bg },
  content: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.five,
  },
  header: { gap: Spacing.two },
  backButton: { alignSelf: 'flex-start', paddingVertical: Spacing.one },
  dimmed: { opacity: 0.6 },
  backText: { color: ST.purpleLight, fontSize: 14, fontWeight: '500' },
  title: {
    color: ST.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: Spacing.two,
  },
  subtitle: { color: ST.textSecondary, fontSize: 15, lineHeight: 22 },
  section: { gap: Spacing.two },
  sectionLabel: {
    fontFamily: Fonts.mono,
    fontWeight: '500',
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  grid: { gap: Spacing.two },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  fieldError: {
    color: ST.red,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: { gap: Spacing.three },
});
