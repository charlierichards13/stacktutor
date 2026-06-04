import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing, ST } from '@/constants/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ST.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: ST.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: ST.surface,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: 14,
    fontSize: 15,
    color: ST.textPrimary,
  },
});
