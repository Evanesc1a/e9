import { useEffect, useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Trash2, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii } from '../../theme/tokens';
import { loadDay, saveDay } from '../../storage/diary';
import { toDateKey, currentTime, fromDateKey, formatDayLabel } from '../../utils/dates';
import { IngredientPicker } from '../../components/IngredientPicker';
import { macroSummary, round1 } from '../../utils/nutrition';
import type { Ingredient, Meal, MealType } from '../../types';

const TIPOS: MealType[] = ['breakfast', 'lunch', 'afternoonSnack', 'dinner', 'snack'];

const num = (v: string) => Number(v.replace(',', '.')) || 0;

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  numeric?: boolean;
};

function Field({ label, value, onChangeText, placeholder, numeric }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={numeric ? 'numeric' : 'default'}
        style={styles.input}
      />
    </View>
  );
}

export default function NuevaComida() {
  const { t } = useTranslation();
  const { fecha: fechaParam, id: idParam } = useLocalSearchParams<{
    fecha?: string;
    id?: string;
  }>();
  const fecha = fechaParam ?? toDateKey();
  const editando = Boolean(idParam);

  const [original, setOriginal] = useState<Meal | null>(null);
  const [tipo, setTipo] = useState<MealType>('breakfast');
  const [hora, setHora] = useState(currentTime());
  const [alimentos, setAlimentos] = useState('');
  const [proteinas, setProteinas] = useState('');
  const [carbohidratos, setCarbohidratos] = useState('');
  const [grasas, setGrasas] = useState('');
  const [kcal, setKcal] = useState('');
  const [ingredientes, setIngredientes] = useState<Ingredient[]>([]);
  const [pickerAbierto, setPickerAbierto] = useState(false);

  // Al editar, carga la comida y rellena el formulario
  useEffect(() => {
    if (!idParam) return;
    let activo = true;
    loadDay(fecha).then((day) => {
      const meal = day.comidas.find((m) => m.id === idParam);
      if (!meal || !activo) return;

      setOriginal(meal);
      setTipo(meal.tipo);
      setHora(meal.hora);

      const ings = meal.ingredientes ?? [];
      setIngredientes(ings);

      // Si el nombre era el automático (ingredientes unidos), se deja vacío
      const auto = ings.map((i) => i.nombre).join(', ');
      setAlimentos(ings.length > 0 && meal.alimentos === auto ? '' : meal.alimentos);

      if (ings.length === 0) {
        setProteinas(String(meal.proteinas));
        setCarbohidratos(String(meal.carbohidratos));
        setGrasas(String(meal.grasas));
        setKcal(String(meal.kcal));
      }
    });
    return () => {
      activo = false;
    };
  }, [idParam, fecha]);

  const usaIngredientes = ingredientes.length > 0;

  const totales = ingredientes.reduce(
    (acc, i) => ({
      kcal: acc.kcal + i.kcal,
      p: acc.p + i.proteinas,
      c: acc.c + i.carbohidratos,
      g: acc.g + i.grasas,
    }),
    { kcal: 0, p: 0, c: 0, g: 0 }
  );

  const cargando = editando && !original;
  const puedeGuardar = !cargando && (alimentos.trim().length > 0 || usaIngredientes);

  const quitarIngrediente = (index: number) =>
    setIngredientes((lista) => lista.filter((_, i) => i !== index));

  const guardar = async () => {
    if (!puedeGuardar) return;

    const p = usaIngredientes ? round1(totales.p) : num(proteinas);
    const c = usaIngredientes ? round1(totales.c) : num(carbohidratos);
    const g = usaIngredientes ? round1(totales.g) : num(grasas);
    const energia = usaIngredientes
      ? Math.round(totales.kcal)
      : kcal.trim()
        ? num(kcal)
        : Math.round(p * 4 + c * 4 + g * 9);

    const comida: Meal = {
      ...(original ?? {}),
      id: original?.id ?? Date.now().toString(),
      tipo,
      hora: hora.trim() || currentTime(),
      alimentos: alimentos.trim() || ingredientes.map((i) => i.nombre).join(', '),
      proteinas: p,
      carbohidratos: c,
      grasas: g,
      kcal: energia,
      ingredientes: usaIngredientes ? ingredientes : undefined,
    };

    const day = await loadDay(fecha);
    const comidas = original
      ? day.comidas.map((m) => (m.id === original.id ? comida : m))
      : [...day.comidas, comida];

    await saveDay({ ...day, comidas });
    router.back();
  };

  const eliminar = () => {
    if (!original) return;
    Alert.alert(t('comidaForm.deleteConfirmTitle'), t('comidaForm.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          const day = await loadDay(fecha);
          await saveDay({
            ...day,
            comidas: day.comidas.filter((m) => m.id !== original.id),
          });
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{editando ? t('comidaForm.titleEdit') : t('comidaForm.titleNew')}</Text>
              <Text style={styles.dayLabel}>
                {formatDayLabel(fechaParam ? fromDateKey(fechaParam) : new Date())}
              </Text>
            </View>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <X size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('comidaForm.momentLabel')}</Text>
            <View style={styles.chips}>
              {TIPOS.map((tipoOpcion) => (
                <Pressable
                  key={tipoOpcion}
                  onPress={() => setTipo(tipoOpcion)}
                  style={[styles.chip, tipo === tipoOpcion && styles.chipActive]}
                >
                  <Text style={[styles.chipText, tipo === tipoOpcion && styles.chipTextActive]}>
                    {t(`mealTypes.${tipoOpcion}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Field label={t('comidaForm.hourLabel')} value={hora} onChangeText={setHora} placeholder="08:30" />

          {/* Ingredientes */}
          <View style={styles.field}>
            <Text style={styles.label}>{t('comidaForm.ingredientsLabel')}</Text>

            {ingredientes.map((ing, index) => (
              <View key={`${ing.foodId}-${index}`} style={styles.ingRow}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.ingName}>{ing.nombre}</Text>
                  <Text style={styles.ingMeta}>
                    {ing.cantidadLabel ?? `${ing.gramos} g`} · {ing.kcal} kcal
                  </Text>
                </View>
                <Pressable onPress={() => quitarIngrediente(index)} hitSlop={10}>
                  <X size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}

            <Pressable onPress={() => setPickerAbierto(true)} style={styles.addIng}>
              <Plus size={16} color={colors.rose} />
              <Text style={styles.addIngLabel}>{t('comidaForm.addIngredient')}</Text>
            </Pressable>
          </View>

          <Field
            label={usaIngredientes ? t('comidaForm.nameLabelOptional') : t('comidaForm.nameLabelWhat')}
            value={alimentos}
            onChangeText={setAlimentos}
            placeholder={
              usaIngredientes
                ? t('comidaForm.namePlaceholderAuto')
                : t('comidaForm.namePlaceholderExample')
            }
          />

          {usaIngredientes ? (
            <View style={styles.summary}>
              <Text style={styles.summaryKcal}>{Math.round(totales.kcal)} kcal</Text>
              <Text style={styles.summaryMacros}>
                {macroSummary(t, round1(totales.p), round1(totales.c), round1(totales.g))}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label={`${t('macro.protein')} (g)`} value={proteinas} onChangeText={setProteinas} placeholder="0" numeric />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={`${t('macro.carbsShort')} (g)`} value={carbohidratos} onChangeText={setCarbohidratos} placeholder="0" numeric />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={`${t('macro.fat')} (g)`} value={grasas} onChangeText={setGrasas} placeholder="0" numeric />
                </View>
              </View>

              <Field
                label={t('comidaForm.caloriesLabel')}
                value={kcal}
                onChangeText={setKcal}
                placeholder={t('comidaForm.caloriesPlaceholder')}
                numeric
              />
            </>
          )}

          <Pressable
            onPress={guardar}
            disabled={!puedeGuardar}
            style={[styles.save, !puedeGuardar && { opacity: 0.4 }]}
          >
            <Text style={styles.saveLabel}>
              {editando ? t('comidaForm.saveEdit') : t('comidaForm.saveNew')}
            </Text>
          </Pressable>

          {editando && (
            <Pressable onPress={eliminar} disabled={!original} style={styles.delete}>
              <Trash2 size={16} color={colors.textMuted} />
              <Text style={styles.deleteLabel}>{t('comidaForm.delete')}</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <IngredientPicker
        visible={pickerAbierto}
        onClose={() => setPickerAbierto(false)}
        onAdd={(ing) => setIngredientes((lista) => [...lista, ing])}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 30 },
  dayLabel: { color: colors.rose, fontFamily: fonts.sans, fontSize: 12, marginTop: 2 },
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
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 8 },
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
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 12,
  },
  ingName: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 13 },
  ingMeta: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  addIng: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.rose,
    borderStyle: 'dashed',
  },
  addIngLabel: { color: colors.rose, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  summary: {
    backgroundColor: colors.cream,
    borderRadius: radii.tile,
    padding: 16,
    gap: 4,
  },
  summaryKcal: { color: colors.wine, fontFamily: fonts.serif, fontSize: 30 },
  summaryMacros: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  save: {
    marginTop: 8,
    height: 50,
    borderRadius: radii.tile,
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: radii.tile,
    borderWidth: 1,
    borderColor: colors.border,
  },
  deleteLabel: { color: colors.textMuted, fontFamily: fonts.sansSemiBold, fontSize: 13 },
});