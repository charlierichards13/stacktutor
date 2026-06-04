import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/ui/auth-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing, ST } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top + Spacing.four,
      paddingBottom: safeAreaInsets.bottom + Spacing.four,
    },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  return (
    <ScrollView
      style={styles.scroll}
      contentInset={safeAreaInsets}
      contentContainerStyle={[styles.content, contentPlatformStyle]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backButton, pressed && styles.dimmed]}>
            <Text style={styles.backText}>← Sign In</Text>
          </Pressable>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>
            {"Enter your email and we'll send you a link to reset your password."}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@university.edu"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.formActions}>
            <PrimaryButton variant="primary" onPress={() => {}}>
              Send Reset Link
            </PrimaryButton>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  subtitle: {
    color: ST.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  form: { gap: Spacing.three },
  formActions: { marginTop: Spacing.one },
});
