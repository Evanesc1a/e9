import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { DateSelector } from '../../components/DateSelector';
import { CaloriesCard } from '../../components/CaloriesCard';
import { MacrosSection } from '../../components/MacrosSection';
import { WaterTracker } from '../../components/WaterTracker';
import { MealsSection } from '../../components/MealsSection';
import { useSettings } from '../../context/settings';
import { loadDay, saveDay } from '../../storage/diary';
import { toDateKey, formatDayLabel, addDays, isToday } from '../../utils/dates';
import { colors, fonts } from '../../theme/tokens';
import type { DayLog } from '../../types';
import { Background } from '../../components/Background';

export default function Diario() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { goals } = settings;
  // Hasta que escribas tu nombre, el avatar muestra la "A" del diseño
  const inicial = settings.nombre.trim().charAt(0).toUpperCase() || 'A';

  const [date, setDate] = useState(new Date());
  const fecha = toDateKey(date);
  const [day, setDay] = useState<DayLog>({ fecha, comidas: [], aguaMl: 0 });

  // Recarga los datos al volver a esta pantalla y al cambiar de día
  useFocusEffect(
    useCallback(() => {
      let activo = true;
      loadDay(fecha).then((d) => {
        if (activo) setDay(d);
      });
      return () => {
        activo = false;
      };
    }, [fecha])
  );

  const agregarAgua = () => {
    const siguiente = { ...day, aguaMl: day.aguaMl + 250 };
    setDay(siguiente);
    saveDay(siguiente);
  };

  const totals = day.comidas.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      proteinas: acc.proteinas + m.proteinas,
      carbohidratos: acc.carbohidratos + m.carbohidratos,
      grasas: acc.grasas + m.grasas,
    }),
    { kcal: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
  );

  return (
    <View style={styles.root}>
            <Background />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Identidad */}
          <View style={styles.identity}>
            <View style={styles.brandRow}>
              <Image
                source={require('../../../assets/images/logo-e9.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <Text style={styles.brand}>e9</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{inicial}</Text>
            </View>
          </View>

          {/* Bienvenida */}
          <View style={styles.welcome}>
            <Text style={styles.title}>{t('diario.title')}</Text>
            <Text style={styles.subtitle}>{t('diario.subtitle')}</Text>
          </View>

          {/* Selector de fecha */}
          <DateSelector
            label={formatDayLabel(date)}
            onPrev={() => setDate((d) => addDays(d, -1))}
            onNext={() => setDate((d) => addDays(d, 1))}
            nextDisabled={isToday(date)}
          />

          {/* Resumen diario */}
          <CaloriesCard
            consumed={totals.kcal}
            goal={goals.kcal}
            onEditGoals={() => router.push('/objetivos' as Href)}
          />

          <MacrosSection
            proteins={{ consumed: totals.proteinas, goal: goals.proteinas }}
            carbs={{ consumed: totals.carbohidratos, goal: goals.carbohidratos }}
            fats={{ consumed: totals.grasas, goal: goals.grasas }}
          />

          <WaterTracker ml={day.aguaMl} goalMl={goals.aguaMl} onAdd={agregarAgua} />

          {/* Diario de comidas */}
          <MealsSection
            meals={day.comidas}
            onAddMeal={() =>
              router.push({ pathname: '/comida/nueva', params: { fecha } })
            }
            onOpenMeal={(meal) =>
              router.push({ pathname: '/comida/nueva', params: { fecha, id: meal.id } })
            }
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, aspectRatio: 440 / 956 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40, gap: 18 },
  identity: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 19, height: 19 },
  brand: { color: colors.cream, fontFamily: fonts.serif, fontSize: 25 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.rose, fontFamily: fonts.serifItalic, fontSize: 20 },
  welcome: { gap: 3 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 36, lineHeight: 38 },
  subtitle: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
});