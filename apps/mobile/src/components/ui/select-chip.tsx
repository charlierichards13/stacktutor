import { Pressable, StyleSheet, Text } from 'react-native';

import { ST } from '@/constants/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  accent?: string;
};

/** A single selectable pill — used for compact option groups like language. */
export function SelectChip({ label, selected, onPress, accent = ST.purpleLight }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        selected && { borderColor: accent, backgroundColor: 'rgba(124, 58, 237, 0.12)' },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.label, selected && { color: ST.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: ST.surface,
  },
  pressed: { opacity: 0.7 },
  label: {
    color: ST.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
