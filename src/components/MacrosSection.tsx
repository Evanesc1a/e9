import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MacroCard } from './MacroCard';
import { colors, fonts } from '../theme/tokens';

type Macro = { consumed: number; goal: number };

type Props = {
  proteins: Macro;
  carbs: Macro;
  fats: Macro;
};

export function MacrosSection({ proteins, carbs, fats }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('macrosSection.title')}</Text>
        <Text style={styles.detail}>{t('macrosSection.detail')}</Text>
      </View>

      <View style={styles.row}>
        <MacroCard name={t('macro.protein')} {...proteins} color={colors.rose} />
        <MacroCard name={t('macro.carbsFull')} {...carbs} color={colors.carbs} />
        <MacroCard name={t('macro.fat')} {...fats} color={colors.fat} />
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