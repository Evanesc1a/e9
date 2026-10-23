import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii } from '../theme/tokens';
import {
  deleteCustomFood,
  loadAllFoods,
  saveCustomFood,
  updateCustomFood,
} from '../storage/foods';
import { loadFavorites, loadRecents, pushRecent, toggleFavorite } from '../storage/favorites';
import {
  foodDisplayName,
  ingredientFor,
  macroSummary,
  searchFoods,
  round1,
  unitLabel,
} from '../utils/nutrition';
import { CreateFoodForm } from './CreateFoodForm';
import type { Food, Ingredient } from '../types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onAdd: (ingredient: Ingredient) => void;
};

type Unit = { label: string; gramos: number };

type Row =
  | { type: 'header'; id: string; title: string }
  | { type: 'food'; id: string; food: Food };

const num = (v: string) => Number(v.replace(',', '.')) || 0;

export function IngredientPicker({ visible, onClose, onAdd }: Props) {
  const { t, i18n } = useTranslation();
  const [foods, setFoods] = useState<Food[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [recents, setRecents] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Food | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Food | null>(null);
  const [unitIndex, setUnitIndex] = useState(0);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (!visible) return;
    Promise.all([loadAllFoods(), loadFavorites(), loadRecents()]).then(([f, fav, rec]) => {
      setFoods(f);
      setFavs(fav);
      setRecents(rec);
    });
    setQuery('');
    setSelected(null);
    setCreating(false);
    setEditing(null);
  }, [visible]);

  const results = useMemo(
    () => searchFoods(foods, query, i18n.language),
    [foods, query, i18n.language]
  );

  // Sin búsqueda: Favoritos, Recientes y Todos. Con búsqueda: solo los resultados
  const rows = useMemo<Row[]>(() => {
    if (query.trim().length > 0) {
      return results.map((food) => ({ type: 'food', id: food.id, food }));
    }

    const byId = new Map(foods.map((f) => [f.id, f]));
    const favFoods = favs.map((id) => byId.get(id)).filter((f): f is Food => f !== undefined);
    const recentFoods = recents
      .filter((id) => !favs.includes(id))
      .map((id) => byId.get(id))
      .filter((f): f is Food => f !== undefined);

    const out: Row[] = [];
    if (favFoods.length > 0) {
      out.push({ type: 'header', id: 'h-fav', title: t('ingredientPicker.sectionFavorites') });
      favFoods.forEach((food) => out.push({ type: 'food', id: `fav-${food.id}`, food }));
    }
    if (recentFoods.length > 0) {
      out.push({ type: 'header', id: 'h-rec', title: t('ingredientPicker.sectionRecents') });
      recentFoods.forEach((food) => out.push({ type: 'food', id: `rec-${food.id}`, food }));
    }
    if (out.length > 0) out.push({ type: 'header', id: 'h-all', title: t('ingredientPicker.sectionAll') });
    results.forEach((food) => out.push({ type: 'food', id: `all-${food.id}`, food }));
    return out;
  }, [foods, favs, recents, query, results, t]);

  // Unidad base del alimento: gramos, o mililitros para las bebidas
  const base = selected?.unidad ?? 'g';

  // Porciones del alimento y, siempre, la unidad base
  const units: Unit[] = selected
    ? [
        ...(selected.porciones ?? []).map((p) => ({ label: unitLabel(p.etiqueta, t), gramos: p.gramos })),
        { label: base, gramos: 1 },
      ]
    : [];

  const unit: Unit = units[unitIndex] ?? { label: base, gramos: 1 };
  const gramos = num(amount) * unit.gramos;
  const preview = selected ? ingredientFor(selected, gramos) : null;

  const choose = (food: Food) => {
    setSelected(food);
    setUnitIndex(0);
    setAmount(food.porciones && food.porciones.length > 0 ? '1' : '100');
  };

  // Al cambiar de unidad se conserva la misma cantidad total
  const changeUnit = (index: number) => {
    const next = units[index];
    if (!next) return;
    setUnitIndex(index);
    setAmount(String(round1(gramos / next.gramos)));
  };

  const toggleFav = async (id: string) => {
    setFavs(await toggleFavorite(id));
  };

  const add = () => {
    if (!selected || gramos <= 0) return;
    const label =
      unit.label === base
        ? `${num(amount)} ${base}`
        : `${num(amount)} × ${unit.label}`;
    pushRecent(selected.id);
    onAdd(ingredientFor(selected, gramos, label));
    onClose();
  };

  const guardarNuevo = async (food: Food) => {
    await saveCustomFood(food);
    setFoods(await loadAllFoods());
    setCreating(false);
    choose(food);
  };

  const guardarEdicion = async (food: Food) => {
    await updateCustomFood(food);
    setFoods(await loadAllFoods());
    setEditing(null);
    choose(food);
  };

  const confirmarBorrado = () => {
    if (!selected) return;
    const food = selected;
    Alert.alert(
      t('ingredientPicker.deleteConfirmTitle'),
      t('ingredientPicker.deleteConfirmBody', { name: foodDisplayName(food, i18n.language) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteCustomFood(food.id);
            setFoods(await loadAllFoods());
            setSelected(null);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.sheet}>
        {creating ? (
          <CreateFoodForm
            initialName={query}
            onSave={guardarNuevo}
            onCancel={() => setCreating(false)}
          />
        ) : editing ? (
          <CreateFoodForm
            food={editing}
            onSave={guardarEdicion}
            onCancel={() => setEditing(null)}
          />
        ) : !selected ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>{t('ingredientPicker.title')}</Text>
              <Pressable onPress={onClose} hitSlop={10}>
                <X size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.searchBox}>
              <Search size={16} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('ingredientPicker.searchPlaceholder')}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                autoCorrect={false}
              />
            </View>

            <Pressable onPress={() => setCreating(true)} style={styles.createButton}>
              <Plus size={16} color={colors.rose} />
              <Text style={styles.createLabel}>{t('ingredientPicker.createNew')}</Text>
            </Pressable>

            <FlatList
              data={rows}
              keyExtractor={(r) => r.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <Text style={styles.empty}>{t('ingredientPicker.empty')}</Text>
              }
              renderItem={({ item }) => {
                if (item.type === 'header') {
                  return <Text style={styles.sectionTitle}>{item.title}</Text>;
                }
                const food = item.food;
                const esFavorito = favs.includes(food.id);
                return (
                  <Pressable onPress={() => choose(food)} style={styles.item}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.itemName}>{foodDisplayName(food, i18n.language)}</Text>
                      <Text style={styles.itemMeta}>
                        {food.propio ? `${t('ingredientPicker.ownTag')} · ` : ''}
                        {food.marca ? `${food.marca} · ` : ''}
                        {t('ingredientPicker.perHundred', { kcal: food.kcal100, unit: food.unidad ?? 'g' })}
                      </Text>
                    </View>
                    <Pressable onPress={() => toggleFav(food.id)} hitSlop={10}>
                      <Star
                        size={18}
                        color={esFavorito ? colors.rose : colors.textMuted}
                        fill={esFavorito ? colors.rose : 'none'}
                      />
                    </Pressable>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </Pressable>
                );
              }}
            />
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Pressable onPress={() => setSelected(null)} hitSlop={10} style={styles.back}>
                <ChevronLeft size={20} color={colors.textMuted} />
                <Text style={styles.backLabel}>{t('ingredientPicker.backSearch')}</Text>
              </Pressable>
              <View style={styles.headerRight}>
                <Pressable onPress={() => toggleFav(selected.id)} hitSlop={10}>
                  <Star
                    size={20}
                    color={colors.rose}
                    fill={favs.includes(selected.id) ? colors.rose : 'none'}
                  />
                </Pressable>
                <Pressable onPress={onClose} hitSlop={10}>
                  <X size={22} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Text style={styles.detailName}>{foodDisplayName(selected, i18n.language)}</Text>
            {selected.marca ? <Text style={styles.itemMeta}>{selected.marca}</Text> : null}
            <Text style={styles.itemMeta}>
              {t('ingredientPicker.perHundredDetail', { unit: base, kcal: selected.kcal100 })} ·{' '}
              {macroSummary(t, selected.proteinas100, selected.carbohidratos100, selected.grasas100)}
            </Text>

            {selected.propio && (
              <View style={styles.actions}>
                <Pressable onPress={() => setEditing(selected)} style={styles.action} hitSlop={8}>
                  <Pencil size={14} color={colors.rose} />
                  <Text style={styles.actionEdit}>{t('common.edit')}</Text>
                </Pressable>
                <Pressable onPress={confirmarBorrado} style={styles.action} hitSlop={8}>
                  <Trash2 size={14} color={colors.textMuted} />
                  <Text style={styles.actionDelete}>{t('common.delete')}</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>{t('ingredientPicker.amountLabel')}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.chips}>
              {units.map((u, i) => (
                <Pressable
                  key={u.label}
                  onPress={() => changeUnit(i)}
                  style={[styles.chip, i === unitIndex && styles.chipActive]}
                >
                  <Text style={[styles.chipText, i === unitIndex && styles.chipTextActive]}>
                    {u.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {unit.label !== base && (
              <Text style={styles.itemMeta}>
                {t('ingredientPicker.approx', { amount: round1(gramos), unit: base })}
              </Text>
            )}

            {preview && (
              <View style={styles.preview}>
                <Text style={styles.previewKcal}>{preview.kcal} kcal</Text>
                <Text style={styles.previewMacros}>
                  {macroSummary(t, preview.proteinas, preview.carbohidratos, preview.grasas)}
                </Text>
              </View>
            )}

            <Pressable
              onPress={add}
              disabled={gramos <= 0}
              style={[styles.addButton, gramos <= 0 && { opacity: 0.4 }]}
            >
              <Text style={styles.addLabel}>{t('ingredientPicker.addToMeal')}</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: colors.bg, padding: 24, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 28 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backLabel: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 42,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.rose,
    borderStyle: 'dashed',
  },
  createLabel: { color: colors.rose, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  sectionTitle: {
    color: colors.rose,
    fontFamily: fonts.sans,
    fontSize: 10,
    paddingTop: 16,
    paddingBottom: 4,
  },
  empty: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12, paddingVertical: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 14 },
  itemMeta: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  detailName: { color: colors.cream, fontFamily: fonts.serif, fontSize: 30 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionEdit: { color: colors.rose, fontFamily: fonts.sansSemiBold, fontSize: 12 },
  actionDelete: { color: colors.textMuted, fontFamily: fonts.sansSemiBold, fontSize: 12 },
  field: { gap: 6 },
  label: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 16,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.wine, borderColor: colors.wine },
  chipText: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
  chipTextActive: { color: colors.cream, fontFamily: fonts.sansSemiBold },
  preview: {
    backgroundColor: colors.cream,
    borderRadius: radii.tile,
    padding: 16,
    gap: 4,
  },
  previewKcal: { color: colors.wine, fontFamily: fonts.serif, fontSize: 30 },
  previewMacros: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  addButton: {
    marginTop: 4,
    height: 50,
    borderRadius: radii.tile,
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
});