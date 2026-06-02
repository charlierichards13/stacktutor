import { Platform, StyleSheet, Text, View } from 'react-native';

import { Fonts, ST } from '@/constants/theme';

const CODE = [
  { n: 1, text: 'int sum = 0;', issue: false },
  { n: 2, text: 'for (int i = 0; i < arr.length - 1; i++) {', issue: true },
  { n: 3, text: '    sum += arr[i];', issue: false },
  { n: 4, text: '}', issue: false },
  { n: 5, text: 'return sum;', issue: false },
];

const mono = Platform.select({ android: 700 }) ?? 500;

export function CodePreviewCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.lang}>java</Text>
        <Text style={styles.mode}>find bugs</Text>
      </View>

      <View style={styles.codeBlock}>
        {CODE.map(({ n, text, issue }) => (
          <View key={n} style={[styles.codeLine, issue && styles.codeLineError]}>
            <Text style={styles.lineNum}>{n}</Text>
            <Text style={[styles.codeText, issue && styles.codeTextError]}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.issue}>
        <View style={styles.issueDot} />
        <View style={styles.issueBody}>
          <Text style={styles.issueTitle}>Off-by-one error — line 2</Text>
          <Text style={styles.issueDesc}>
            {'Loop condition skips the last element. '}
            <Text style={styles.issueCode}>arr.length - 1</Text>
            {' should be '}
            <Text style={styles.issueCode}>arr.length</Text>
            {'.'}
          </Text>
          <View style={styles.testCase}>
            <Text style={styles.testLabel}>test case</Text>
            <Text style={styles.testCode}>[1, 2, 3, 4, 5]  →  expected 15, got 10</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ST.card,
    borderWidth: 1,
    borderColor: ST.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: ST.border,
  },
  lang: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 11,
    color: ST.cyan,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  mode: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeBlock: {
    paddingVertical: 8,
  },
  codeLine: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 2,
    gap: 12,
  },
  codeLineError: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  lineNum: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 12,
    color: ST.textMuted,
    width: 16,
    textAlign: 'right',
  },
  codeText: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 12,
    color: ST.textSecondary,
    flex: 1,
  },
  codeTextError: {
    color: '#FCA5A5',
  },
  issue: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: ST.border,
    backgroundColor: ST.surface,
  },
  issueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ST.red,
    marginTop: 5,
    flexShrink: 0,
  },
  issueBody: {
    flex: 1,
    gap: 6,
  },
  issueTitle: {
    color: ST.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  issueDesc: {
    color: ST.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  issueCode: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 11,
    color: ST.amber,
  },
  testCase: {
    backgroundColor: ST.card,
    borderRadius: 6,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: ST.border,
  },
  testLabel: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 10,
    color: ST.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  testCode: {
    fontFamily: Fonts.mono,
    fontWeight: mono,
    fontSize: 11,
    color: ST.green,
  },
});
