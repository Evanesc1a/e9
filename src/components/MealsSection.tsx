import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MealRow } from './MealRow';
import { colors, fonts, radii } from '../theme/tokens';
import type { Meal } from '../types';

type Props = {
  meals: Meal[];
  onAddMeal?: () => void;
  onOpenMeal?: (meal: Meal) => void;
};

export function MealsSection({ meals, onAddMeal, onOpenMeal }: Props) {
  const { t } = useTranslation();
  const count = meals.length;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('meals.title')}</Text>
        <Text style={styles.count}>{t('meals.count', { count })}</Text>
      </View>

            <View>
        {meals.length === 0 && (
          <Text style={styles.empty}>{t('meals.empty')}</Text>
        )}
        {meals.map((meal) => (
          <MealRow key={meal.id} meal={meal} onPress={() => onOpenMeal?.(meal)} />
        ))}
      </View>

      <Pressable onPress={onAddMeal} style={styles.addButton}>
        <Plus size={18} color={colors.cream} />
        <Text style={styles.addLabel}>{t('meals.add')}</Text>
      </Pressable>

            <View style={styles.closing}>
        <Text style={styles.message}>{t('meals.closing')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 14 },
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 27 },
  count: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
    empty: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12, paddingVertical: 16 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 50,
    borderRadius: radii.tile,
    backgroundColor: colors.wine,
  },
  addLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
  closing: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ornament: { color: colors.rose, fontFamily: fonts.serif, fontSize: 14 },
  message: { color: colors.textMuted, fontFamily: fonts.serifItalic, fontSize: 16 },
});