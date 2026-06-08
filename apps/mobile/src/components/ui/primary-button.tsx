import { Pressable, StyleSheet, Text } from 'react-native';

import { ST } from '@/constants/theme';

type Props = {
  children: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function PrimaryButton({ children, onPress, variant = 'primary', disabled = false }: Props) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.label, !isPrimary && styles.ghostLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  primary: { backgroundColor: ST.purple },
  ghost: { borderWidth: 1, borderColor: ST.border },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.5 },
  label: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', letterSpacing: 0.1 },
  ghostLabel: { color: ST.textSecondary },
});
