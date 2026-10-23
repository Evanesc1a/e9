import { useCallback, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Background } from '../../components/Background';
import { loadAllFoods } from '../../storage/foods';
import { loadFavorites, toggleFavorite } from '../../storage/favorites';
import { colors, fonts, radii } from '../../theme/tokens';
import { foodDisplayName, macroSummary } from '../../utils/nutrition';
import type { Food } from '../../types';

export default function Favoritos() {
  const { t, i18n } = useTranslation();
  const [foods, setFoods] = useState<Food[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  // Recarga al entrar a la pestaña, por si marcaste favoritos en otra pantalla
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      Promise.all([loadAllFoods(), loadFavorites()]).then(([f, fav]) => {
        if (!activo) return;
        setFoods(f);
        setFavs(fav);
      });
      return () => {
        activo = false;
      };
    }, [])
  );

  const byId = new Map(foods.map((f) => [f.id, f]));
  const lista = favs.map((id) => byId.get(id)).filter((f): f is Food => f !== undefined);

  const quitar = async (id: string) => setFavs(await toggleFavorite(id));

  return (
    <View style={styles.root}>
      <Background />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('favoritos.title')}</Text>
          <Text style={styles.subtitle}>
            {lista.length === 0
              ? t('favoritos.subtitleEmpty')
              : t('favoritos.subtitleCount', { count: lista.length })}
          </Text>
        </View>

        <FlatList
          data={lista}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Star size={28} color={colors.rose} />
              <Text style={styles.emptyTitle}>{t('favoritos.emptyTitle')}</Text>
              <Text style={styles.emptyBody}>{t('favoritos.emptyBody')}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.name}>{foodDisplayName(item, i18n.language)}</Text>
                <Text style={styles.meta}>
                  {item.marca ? `${item.marca} · ` : ''}
                  {t('ingredientPicker.perHundred', { kcal: item.kcal100, unit: item.unidad ?? 'g' })}
                </Text>
                <Text style={styles.meta}>
                  {macroSummary(t, item.proteinas100, item.carbohidratos100, item.grasas100)}
                </Text>
              </View>
              <Pressable onPress={() => quitar(item.id)} hitSlop={12}>
                <Star size={20} color={colors.rose} fill={colors.rose} />
              </Pressable>
            </View>
          )}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8, gap: 4 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 36 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
  list: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 40, gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 16,
  },
  name: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 14 },
  meta: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  empty: { alignItems: 'center', gap: 10, paddingTop: 60, paddingHorizontal: 20 },
  emptyTitle: { color: colors.cream, fontFamily: fonts.serif, fontSize: 26 },
  emptyBody: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
});