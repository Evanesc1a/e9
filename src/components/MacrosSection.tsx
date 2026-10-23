import { View, Text, StyleSheet } from 'react-native';
import { MacroCard } from './MacroCard';
import { colors, fonts } from '../theme/tokens';

type Macro = { consumed: number; goal: number };

type Props = {
  proteins: Macro;
  carbs: Macro;
  fats: Macro;
};

export function MacrosSection({ proteins, carbs, fats }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Tus macros</Text>
        <Text style={styles.detail}>CONSUMIDO / OBJETIVO</Text>
      </View>

      <View style={styles.row}>
        <MacroCard name="Proteínas" {...proteins} color={colors.rose} />
        <MacroCard name="Carbohidratos" {...carbs} color={colors.carbs} />
        <MacroCard name="Grasas" {...fats} color={colors.fat} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 25 },
  detail: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 10 },
  row: { flexDirection: 'row', gap: 8 },
});