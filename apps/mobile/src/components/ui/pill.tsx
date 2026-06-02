import { Platform, StyleSheet, Text } from 'react-native';

import { Fonts, ST } from '@/constants/theme';

type Props = {
  label: string;
  color?: string;
};

export function Pill({ label, color = ST.purpleLight }: Props) {
  return (
    <Text style={[styles.pill, { color, borderColor: ST.border }]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
});
