import { Platform, StyleSheet, Text, TextInput, View, type TextStyle } from 'react-native';

import { Fonts, Spacing, ST } from '@/constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength: number;
  placeholder?: string;
  hasError?: boolean;
};

const mono: TextStyle['fontWeight'] = Platform.select({ android: 700 }) ?? 500;

/**
 * Editor-style multiline input for pasting code, with a live line/character
 * count. `maxLength` hard-caps input so an oversized paste can't bloat state.
 */
export function CodeInput({ value, onChangeText, maxLength, placeholder, hasError = false }: Props) {
  const lineCount = value.length === 0 ? 0 : value.split('\n').length;
  const nearLimit = value.length >= maxLength * 0.9;

  return (
    <View style={[styles.container, hasError && styles.containerError]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={ST.textMuted}
        multiline
        maxLength={maxLength}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        textAlignVertical="top"
        style={styles.input}
      />
      <View style={styles.footer}>
        <Text style={styles.count}>
          {lineCount} {lineCount === 1 ? 'line' : 'lines'}
        </Text>
        <Text style={[styles.count, nearLimit && styles.countNearLimit]}>
          {value.length.toLocaleString()} / {maxLength.toLocaleString()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: ST.surface,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  containerError: {
    borderColor: ST.red,
  },
  input: {
    minHeight: 200,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 13,
    lineHeight: 20,
    color: ST.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: ST.border,
    backgroundColor: ST.card,
  },
  count: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 11,
    color: ST.textMuted,
    letterSpacing: 0.3,
  },
  countNearLimit: {
    color: ST.amber,
  },
});
