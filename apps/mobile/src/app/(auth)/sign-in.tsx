import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/ui/auth-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing, ST } from '@/constants/theme';

export default function SignInScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.wordmark}>StackTutor</Text>
          <Text style={styles.subtitle}>AI code review trainer</Text>
          <Text style={styles.tagline}>{"Learn to debug.\nDon't just get the answer."}</Text>
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
          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />
          <View style={styles.formActions}>
            <PrimaryButton variant="primary" onPress={() => {}}>
              Sign In
            </PrimaryButton>
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={({ pressed }) => [styles.linkButton, pressed && styles.dimmed]}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>
          </View>
        </View>

        {/* Create account */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account?"}</Text>
          <PrimaryButton
            variant="ghost"
            onPress={() => router.push('/(auth)/create-account')}>
            Create Account
          </PrimaryButton>
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
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.five,
  },
  brand: { gap: Spacing.two },
  wordmark: {
    color: ST.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: ST.purpleLight,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagline: {
    color: ST.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: Spacing.one,
  },
  form: { gap: Spacing.three },
  formActions: { gap: Spacing.two, marginTop: Spacing.one },
  linkButton: { alignSelf: 'center', paddingVertical: Spacing.two },
  dimmed: { opacity: 0.6 },
  linkText: { color: ST.textMuted, fontSize: 14 },
  footer: {
    gap: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: ST.border,
    paddingTop: Spacing.four,
  },
  footerText: { color: ST.textMuted, fontSize: 14, textAlign: 'center' },
});
