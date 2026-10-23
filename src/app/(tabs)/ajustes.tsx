import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { ChevronRight, Languages, Sparkles, Target } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/settings';
import { formatNumber } from '../../utils/format';
import { macroSummary } from '../../utils/nutrition';
import { colors, fonts, radii } from '../../theme/tokens';
import type { Idioma } from '../../types';

type RowProps = {
  Icon: typeof Target;
  label: string;
  detail: string;
  onPress: () => void;
};

function Row({ Icon, label, detail, onPress }: RowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <Icon size={20} color={colors.rose} />
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.detail}>{detail}</Text>
      </View>
      <ChevronRight size={16} color={colors.textMuted} />
    </Pressable>
  );
}

export default function Ajustes() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();
  const g = settings.goals;

  const elegirIdioma = (idioma: Idioma) => {
    if (idioma !== settings.idioma) update({ idioma });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('ajustes.title')}</Text>

        <View style={styles.list}>
          <Row
            Icon={Target}
            label={t('ajustes.goalsLabel')}
            detail={`${formatNumber(g.kcal)} kcal · ${macroSummary(t, g.proteinas, g.carbohidratos, g.grasas)}`}
            onPress={() => router.push('/objetivos' as Href)}
          />
          <Row
            Icon={Sparkles}
            label={t('ajustes.welcomeLabel')}
            detail={t('ajustes.welcomeDetail')}
            onPress={() => router.push('/onboarding' as Href)}
          />

          <View style={styles.languageRow}>
            <Languages size={20} color={colors.rose} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.label}>{t('ajustes.languageLabel')}</Text>
              <Text style={styles.detail}>{t('ajustes.languageDetail')}</Text>
            </View>
            <View style={styles.languageChips}>
              <Pressable
                onPress={() => elegirIdioma('es')}
                style={[styles.chip, settings.idioma === 'es' && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.idioma === 'es' && styles.chipTextActive]}>
                  {t('ajustes.languageSpanish')}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => elegirIdioma('en')}
                style={[styles.chip, settings.idioma === 'en' && styles.chipActive]}
              >
                <Text style={[styles.chipText, settings.idioma === 'en' && styles.chipTextActive]}>
                  {t('ajustes.languageEnglish')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 24, paddingTop: 16, gap: 20 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 36 },
  list: { gap: 10 },
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
  label: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 14 },
  detail: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 16,
  },
  languageChips: { flexDirection: 'row', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  chipActive: { backgroundColor: colors.wine, borderColor: colors.wine },
  chipText: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
  chipTextActive: { color: colors.cream, fontFamily: fonts.sansSemiBold },
});