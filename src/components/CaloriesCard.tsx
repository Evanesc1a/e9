import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sparkles, Pencil } from 'lucide-react-native';
import { CalorieRing } from './CalorieRing';
import { colors, fonts, radii } from '../theme/tokens';
import { formatNumber } from '../utils/format';

type Props = {
  consumed: number;
  goal: number;
  onEditGoals?: () => void;
};

export function CaloriesCard({ consumed, goal, onEditGoals }: Props) {
  const remaining = Math.max(goal - consumed, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>La energía de tu día</Text>
        <Sparkles size={18} color={colors.wine} />
      </View>

      <View style={styles.balanceRow}>
        <CalorieRing consumed={consumed} goal={goal} />

        <View style={styles.balance}>
          <View style={{ gap: 2 }}>
            <Text style={styles.remaining}>{formatNumber(remaining)}</Text>
            <Text style={styles.muted12}>kcal por registrar</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.goalRow}>
            <Text style={styles.goal}>{formatNumber(goal)}</Text>
            <Text style={styles.muted10}>kcal de meta</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
                <Text style={styles.muted10}>Tus objetivos del día</Text>
        <Pressable onPress={onEditGoals} style={styles.edit} hitSlop={8}>
          <Text style={styles.editLabel}>Editar</Text>
          <Pencil size={12} color={colors.wine} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontFamily: fonts.serif, fontSize: 25 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  balance: { flex: 1, gap: 14 },
  remaining: { color: colors.wine, fontFamily: fonts.serif, fontSize: 38, lineHeight: 38 },
  muted12: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  muted10: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 10 },
  separator: { height: 1, backgroundColor: colors.divider },
  goalRow: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  goal: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 16 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 12,
  },
  edit: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editLabel: { color: colors.wine, fontFamily: fonts.sansSemiBold, fontSize: 11 },
});