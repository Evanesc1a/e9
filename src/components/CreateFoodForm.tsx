import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii } from '../theme/tokens';
import { macroSummary, round1 } from '../utils/nutrition';
import type { Food } from '../types';

type Props = {
  food?: Food; // si viene, el formulario edita ese alimento
  initialName?: string;
  onSave: (food: Food) => void;
  onCancel: () => void;
};

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
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        style={styles.input}
      />
    </View>
  );
}

export function CreateFoodForm({ food, initialName = '', onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const editing = food !== undefined;

  const [nombre, setNombre] = useState(food?.nombre ?? initialName);
  const [marca, setMarca] = useState(food?.marca ?? '');
  const [unidad, setUnidad] = useState<'g' | 'ml'>(food?.unidad ?? 'g');
  const [modo, setModo] = useState<'100' | 'porcion'>('100');
  const [tamano, setTamano] = useState('');
  const [kcal, setKcal] = useState(food ? String(food.kcal100) : '');
  const [prot, setProt] = useState(food ? String(food.proteinas100) : '');
  const [carb, setCarb] = useState(food ? String(food.carbohidratos100) : '');
  const [gras, setGras] = useState(food ? String(food.grasas100) : '');

  // Cantidad a la que corresponden los valores que escribes
  const basis = modo === '100' ? 100 : num(tamano);
  const factor = basis > 0 ? 100 / basis : 0;

  const p100 = round1(num(prot) * factor);
  const c100 = round1(num(carb) * factor);
  const g100 = round1(num(gras) * factor);
  // Si no escribes las kcal, se estiman con los macros (4-4-9)
  const kcalEscritas = kcal.trim().length > 0;
  const k100 = Math.round(
    kcalEscritas ? num(kcal) * factor : (num(prot) * 4 + num(carb) * 4 + num(gras) * 9) * factor
  );

  const hayValores = kcalEscritas || num(prot) > 0 || num(carb) > 0 || num(gras) > 0;
  const puedeGuardar = nombre.trim().length > 0 && basis > 0 && hayValores;

  const guardar = () => {
    if (!puedeGuardar) return;
    const result: Food = {
      id: food?.id ?? `custom-${Date.now()}`,
      nombre: nombre.trim(),
      marca: marca.trim() || undefined,
      unidad,
      kcal100: k100,
      proteinas100: p100,
      carbohidratos100: c100,
      grasas100: g100,
      // Si no cambias a "Porción", se conservan las porciones que ya tenía
      porciones:
        modo === 'porcion' ? [{ etiqueta: 'porción', gramos: basis }] : food?.porciones,
      propio: true,
    };
    onSave(result);
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} hitSlop={10} style={styles.back}>
          <ChevronLeft size={20} color={colors.textMuted} />
          <Text style={styles.backLabel}>
            {editing ? t('createFoodForm.backVolver') : t('createFoodForm.backBuscar')}
          </Text>
        </Pressable>
      </View>

            <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{editing ? t('createFoodForm.titleEdit') : t('createFoodForm.titleNew')}</Text>

        <Field label={t('createFoodForm.nameLabel')} value={nombre} onChangeText={setNombre} placeholder={t('createFoodForm.namePlaceholder')} />
        <Field label={t('createFoodForm.brandLabel')} value={marca} onChangeText={setMarca} placeholder={t('createFoodForm.brandPlaceholder')} />

        <View style={styles.field}>
          <Text style={styles.label}>{t('createFoodForm.measuredInLabel')}</Text>
          <View style={styles.chips}>
            {(['g', 'ml'] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnidad(u)}
                style={[styles.chip, unidad === u && styles.chipActive]}
              >
                <Text style={[styles.chipText, unidad === u && styles.chipTextActive]}>
                  {u === 'g' ? t('createFoodForm.gramsOption') : t('createFoodForm.mlOption')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('createFoodForm.valuesPerLabel')}</Text>
          <View style={styles.chips}>
            <Pressable
              onPress={() => setModo('100')}
              style={[styles.chip, modo === '100' && styles.chipActive]}
            >
              <Text style={[styles.chipText, modo === '100' && styles.chipTextActive]}>
                100 {unidad}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setModo('porcion')}
              style={[styles.chip, modo === 'porcion' && styles.chipActive]}
            >
              <Text style={[styles.chipText, modo === 'porcion' && styles.chipTextActive]}>
                {t('createFoodForm.servingOption')}
              </Text>
            </Pressable>
          </View>
        </View>

        {modo === 'porcion' && (
          <Field
            label={t('createFoodForm.servingSizeLabel', { unit: unidad })}
            value={tamano}
            onChangeText={setTamano}
            placeholder={t('createFoodForm.servingSizePlaceholder')}
            numeric
          />
        )}

        <Field label={t('createFoodForm.caloriesLabel')} value={kcal} onChangeText={setKcal} placeholder={t('common.optional')} numeric />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Field label={`${t('macro.protein')} (g)`} value={prot} onChangeText={setProt} placeholder="0" numeric />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={`${t('macro.carbsShort')} (g)`} value={carb} onChangeText={setCarb} placeholder="0" numeric />
          </View>
          <View style={{ flex: 1 }}>
            <Field label={`${t('macro.fat')} (g)`} value={gras} onChangeText={setGras} placeholder="0" numeric />
          </View>
        </View>

        {puedeGuardar && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>{t('createFoodForm.previewTitle', { unit: unidad })}</Text>
            <Text style={styles.previewKcal}>{k100} kcal</Text>
            <Text style={styles.previewMacros}>{macroSummary(t, p100, c100, g100)}</Text>
          </View>
        )}

        <Pressable
          onPress={guardar}
          disabled={!puedeGuardar}
          style={[styles.save, !puedeGuardar && { opacity: 0.4 }]}
        >
          <Text style={styles.saveLabel}>{editing ? t('createFoodForm.saveEdit') : t('createFoodForm.saveNew')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backLabel: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13 },
  content: { paddingTop: 14, paddingBottom: 40, gap: 14 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 30 },
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
  preview: {
    backgroundColor: colors.cream,
    borderRadius: radii.tile,
    padding: 16,
    gap: 4,
  },
  previewTitle: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 11 },
  previewKcal: { color: colors.wine, fontFamily: fonts.serif, fontSize: 30 },
  previewMacros: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  save: {
    height: 50,
    borderRadius: radii.tile,
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
});