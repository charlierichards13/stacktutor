import { StyleSheet, Text, View } from 'react-native';

import { Spacing, ST } from '@/constants/theme';

type Props = {
  tone: 'error' | 'success';
  children: string;
};

/** Small inline banner for auth form errors and success notices. */
export function FormMessage({ tone, children }: Props) {
  const isError = tone === 'error';
  return (
    <View style={[styles.container, isError ? styles.error : styles.success]}>
      <Text style={[styles.text, { color: isError ? ST.red : ST.green }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  error: { borderColor: ST.red, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  success: { borderColor: ST.green, backgroundColor: 'rgba(34, 197, 94, 0.08)' },
  text: { fontSize: 13, lineHeight: 19 },
});
