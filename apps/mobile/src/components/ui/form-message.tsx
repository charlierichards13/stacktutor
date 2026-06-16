import { StyleSheet, Text, View } from 'react-native';

import { Spacing, ST } from '@/constants/theme';

type Tone = 'error' | 'success' | 'info';

type Props = {
  tone: Tone;
  children: string;
};

const TONE_STYLES: Record<Tone, { container: object; color: string }> = {
  error: { container: { borderColor: ST.red, backgroundColor: 'rgba(239, 68, 68, 0.08)' }, color: ST.red },
  success: { container: { borderColor: ST.green, backgroundColor: 'rgba(34, 197, 94, 0.08)' }, color: ST.green },
  info: { container: { borderColor: ST.cyan, backgroundColor: 'rgba(34, 211, 238, 0.08)' }, color: ST.cyan },
};

/** Small inline banner for form errors, success notices, and info states. */
export function FormMessage({ tone, children }: Props) {
  const toneStyle = TONE_STYLES[tone];
  return (
    <View style={[styles.container, toneStyle.container]}>
      <Text style={[styles.text, { color: toneStyle.color }]}>{children}</Text>
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
  text: { fontSize: 13, lineHeight: 19 },
});
