import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import { FormField } from '../components/FormField';
import { useSettings } from '../context/settings';
import { colors, fonts, radii } from '../theme/tokens';

const num = (v: string) => Number(v.replace(',', '.')) || 0;

export default function Objetivos() {
  const { settings, update } = useSettings();

  const [nombre, setNombre] = useState(settings.nombre);
  const [kcal, setKcal] = useState(String(settings.goals.kcal));
  const [prot, setProt] = useState(String(settings.goals.proteinas));
  const [carb, setCarb] = useState(String(settings.goals.carbohidratos));
  const [gras, setGras] = useState(String(settings.goals.grasas));
  const [agua, setAgua] = useState(String(settings.goals.aguaMl));

  const valido =
    num(kcal) > 0 && num(prot) > 0 && num(carb) > 0 && num(gras) > 0 && num(agua) > 0;

  const guardar = async () => {
    if (!valido) return;
    await update({
      nombre: nombre.trim(),
      goals: {
        kcal: Math.round(num(kcal)),
        proteinas: Math.round(num(prot)),
        carbohidratos: Math.round(num(carb)),
        grasas: Math.round(num(gras)),
        aguaMl: Math.round(num(agua)),
      },
    });
    router.back();
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
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets
        >
          <View style={styles.header}>
            <Text style={styles.title}>Mis objetivos</Text>
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <X size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <Text style={styles.note}>
            Escribe los números que tú elijas, o los que te haya indicado un profesional de la
            salud. La app solo los guarda y calcula tu avance con ellos.
          </Text>

          <FormField label="Tu nombre" value={nombre} onChangeText={setNombre} placeholder="Cómo quieres que te llame" />

          <FormField label="Calorías al día" value={kcal} onChangeText={setKcal} suffix="kcal" numeric />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <FormField label="Proteínas" value={prot} onChangeText={setProt} suffix="g" numeric />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Carbos" value={carb} onChangeText={setCarb} suffix="g" numeric />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Grasas" value={gras} onChangeText={setGras} suffix="g" numeric />
            </View>
          </View>

          <FormField label="Agua al día" value={agua} onChangeText={setAgua} suffix="ml" numeric />

          <Pressable
            onPress={guardar}
            disabled={!valido}
            style={[styles.save, !valido && { opacity: 0.4 }]}
          >
            <Text style={styles.saveLabel}>Guardar objetivos</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingBottom: 80, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 30 },
  note: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 8 },
  save: {
    marginTop: 8,
    height: 50,
    borderRadius: radii.tile,
    backgroundColor: colors.wine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
});