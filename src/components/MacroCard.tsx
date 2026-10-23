import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radii } from '../theme/tokens';

type Props = {
  name: string;
  consumed: number;
  goal: number;
  color: string;
};

export function MacroCard({ name, consumed, goal, color }: Props) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1) * 100 : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.grams}>
        <Text style={styles.value}>{Math.round(consumed)}</Text>
        <Text style={styles.unit}>g</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>

      <Text style={styles.goal}>de {goal} g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 12,
    gap: 9,
  },
  name: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  grams: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  value: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 22 },
  unit: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  track: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: { height: 4, borderRadius: radii.pill },
  goal: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 10 },
});