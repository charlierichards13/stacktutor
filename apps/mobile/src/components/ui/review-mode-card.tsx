import { Platform, Pressable, StyleSheet, Text } from 'react-native';

import { Fonts, ST } from '@/constants/theme';

type Props = {
  label: string;
  mono: string;
  description: string;
  accent?: string;
  onPress?: () => void;
  selected?: boolean;
};

export function ReviewModeCard({
  label,
  mono,
  description,
  accent = ST.purpleLight,
  onPress,
  selected = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        selected && { borderColor: accent, backgroundColor: 'rgba(124, 58, 237, 0.1)' },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.mono, { color: accent }]}>{mono}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: ST.card,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },
  pressed: { opacity: 0.7 },
  mono: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  label: {
    color: ST.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    color: ST.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
});
