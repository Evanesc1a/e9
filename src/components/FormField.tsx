import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../theme/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
  suffix?: string;
};

export function FormField({ label, value, onChangeText, placeholder, numeric, suffix }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.box}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          style={styles.input}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  suffix: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
});