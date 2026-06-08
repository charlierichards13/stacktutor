import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthInput } from '@/components/ui/auth-input';
import { FormMessage } from '@/components/ui/form-message';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing, ST } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: safeAreaInsets.top + Spacing.four,
      paddingBottom: safeAreaInsets.bottom + Spacing.four,
    },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  async function handleUpdatePassword() {
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setDone(true);
    setLoading(false);
  }

  async function handleBackToSignIn() {
    // Drop the temporary recovery session so the user re-authenticates with
    // their new password, then return to the signed-out sign-in screen.
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentInset={safeAreaInsets}
      contentContainerStyle={[styles.content, contentPlatformStyle]}
      keyboardShouldPersistTaps="handled">
      <View style={styles.inner}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Set a new password</Text>
          <Text style={styles.subtitle}>
            Choose a new password for your StackTutor account.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {done ? (
            <>
              <FormMessage tone="success">
                Your password has been updated. Sign in with your new password to continue.
              </FormMessage>
              <View style={styles.formActions}>
                <PrimaryButton variant="primary" onPress={handleBackToSignIn}>
                  Back to Sign In
                </PrimaryButton>
              </View>
            </>
          ) : (
            <>
              <AuthInput
                label="New password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
              />
              <AuthInput
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                secureTextEntry
              />
              {error ? <FormMessage tone="error">{error}</FormMessage> : null}
              <View style={styles.formActions}>
                <PrimaryButton
                  variant="primary"
                  onPress={handleUpdatePassword}
                  disabled={loading}>
                  {loading ? 'Updating…' : 'Update Password'}
                </PrimaryButton>
              </View>
            </>
          )}
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
