import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight, Utensils } from 'lucide-react-native';
import { colors, fonts, radii } from '../theme/tokens';
import type { Meal } from '../types';

type Props = {
  meal: Meal;
  onPress?: () => void;
};

export function MealRow({ meal, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      {meal.fotoUri ? (
        <Image source={{ uri: meal.fotoUri }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.placeholder]}>
          <Utensils size={20} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.detail}>
        <Text style={styles.name} numberOfLines={2}>
          {meal.alimentos || meal.tipo}
        </Text>
        <Text style={styles.moment}>
          {meal.tipo} · {meal.hora}
        </Text>
        <Text style={styles.macros}>
          P {meal.proteinas} g · C {meal.carbohidratos} g · G {meal.grasas} g
        </Text>
      </View>

      <View style={styles.energy}>
        <Text style={styles.kcal}>{meal.kcal}</Text>
        <Text style={styles.kcalUnit}>kcal</Text>
      </View>

      <ChevronRight size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  thumb: { width: 52, height: 58, borderRadius: radii.thumb },
  placeholder: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: { flex: 1, gap: 4 },
  name: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 15 },
  moment: { color: colors.rose, fontFamily: fonts.sans, fontSize: 10 },
  macros: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 10 },
  energy: { alignItems: 'flex-end', gap: 3 },
  kcal: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 17 },
  kcalUnit: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 10 },
});