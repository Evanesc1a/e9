import { useRef, useState } from 'react';
import {
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
import { Image } from 'expo-image';
import { Stack, router } from 'expo-router';
import { ArrowRight, BookOpen, Check, ChevronLeft, Droplet, Info } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/settings';
import i18n from '../i18n';
import { formatNumber } from '../utils/format';
import { colors, fonts, radii } from '../theme/tokens';
import { Background } from '../components/Background';

const TOTAL = 5;

type GoalKey = 'kcal' | 'prot' | 'carb' | 'gras';

const num = (v: string) => Number(v.replace(',', '.')) || 0;
const soloDigitos = (v: string) => v.replace(/[^0-9]/g, '');
const soloDecimal = (v: string) => v.replace(/[^0-9.,]/g, '');

// 2000 -> "2,0" / "2.0" · 2250 -> "2,25" / "2.25"
const litros = (ml: number) => {
  const l = ml / 1000;
  const texto = Number.isInteger(l * 10) ? l.toFixed(1) : l.toFixed(2);
  return i18n.language === 'en' ? texto : texto.replace('.', ',');
};

export default function Onboarding() {
  const { t } = useTranslation();
  const { settings, update } = useSettings();
  const yaConfigurado = settings.onboarded;
  const g = settings.goals;

  const ETAPAS = t('onboarding.stages', { returnObjects: true }) as string[];
  const BOTONES = t('onboarding.buttons', { returnObjects: true }) as string[];
  const PIES = t('onboarding.footers', { returnObjects: true }) as string[];

  const [step, setStep] = useState(0);
  const [nombre, setNombre] = useState(settings.nombre);
  const [kcal, setKcal] = useState(String(g.kcal));
  const [prot, setProt] = useState(String(g.proteinas));
  const [carb, setCarb] = useState(String(g.carbohidratos));
  const [gras, setGras] = useState(String(g.grasas));
  const [aguaL, setAguaL] = useState(litros(g.aguaMl));
  const [enfoque, setEnfoque] = useState<GoalKey | null>(null);

  const metas = {
    kcal: Math.round(num(kcal)),
    proteinas: Math.round(num(prot)),
    carbohidratos: Math.round(num(carb)),
    grasas: Math.round(num(gras)),
    aguaMl: Math.round(num(aguaL) * 1000),
  };

  const inicial = nombre.trim().charAt(0).toUpperCase() || '·';
  const vasos = Math.round(metas.aguaMl / 250);
  const segmentos = Math.min(Math.max(vasos, 1), 16);

  const puedeContinuar =
    step === 1
      ? nombre.trim().length > 0
      : step === 2
        ? [kcal, prot, carb, gras].every((v) => num(v) > 0)
        : step === 3
          ? metas.aguaMl > 0
          : true;

  const terminar = async () => {
    await update({ nombre: nombre.trim(), goals: metas, onboarded: true });
    router.replace('/');
  };

  const siguiente = () => {
    if (!puedeContinuar) return;
    if (step === TOTAL - 1) terminar();
    else setStep((s) => s + 1);
  };

  const atras = () => setStep((s) => Math.max(0, s - 1));

  const filas: { key: GoalKey; label: string; unit: string; value: string; set: (v: string) => void }[] = [
    { key: 'kcal', label: t('macro.calories'), unit: 'kcal', value: kcal, set: setKcal },
    { key: 'prot', label: t('macro.protein'), unit: 'g', value: prot, set: setProt },
    { key: 'carb', label: t('macro.carbsShort'), unit: 'g', value: carb, set: setCarb },
    { key: 'gras', label: t('macro.fat'), unit: 'g', value: gras, set: setGras },
  ];

  const IconoPrincipal = step === TOTAL - 1 ? BookOpen : ArrowRight;

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ gestureEnabled: yaConfigurado }} />

            <Background />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Cabecera: marca y progreso */}
          <View style={styles.header}>
            <View style={styles.identity}>
              <View style={styles.brandRow}>
                <Image
                  source={require('../../assets/images/logo-e9.png')}
                  style={styles.logo}
                  contentFit="contain"
                />
                <Text style={styles.brand}>e9</Text>
              </View>
              <Text style={styles.space}>{t('onboarding.spaceLabel')}</Text>
            </View>

            <View style={styles.progress}>
              <View style={styles.progressLabels}>
                <Text style={styles.stage}>{ETAPAS[step]}</Text>
                <Text style={styles.count}>
                  {t('onboarding.progressCount', { step: step + 1, total: TOTAL })}
                </Text>
              </View>
              <View style={styles.segments}>
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <View key={i} style={[styles.segment, i <= step && styles.segmentOn]} />
                ))}
              </View>
            </View>
          </View>

          {/* Contenido */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.content, step === 0 && styles.contentCentered]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {step === 0 && (
              <View style={styles.welcome}>
                <View style={styles.emblem}>
                  <Image
                    source={require('../../assets/images/emblema-bienvenida.png')}
                    style={styles.emblemImg}
                    contentFit="contain"
                  />
                </View>

                <View style={styles.welcomeText}>
                  <Text style={styles.eyebrow}>{t('onboarding.step0.eyebrow')}</Text>
                  <Text style={styles.welcomeTitle}>{t('onboarding.step0.title')}</Text>
                  <Text style={styles.welcomeBody}>{t('onboarding.step0.body')}</Text>
                </View>

                <View style={styles.invite}>
                  <Text style={styles.inviteStar}>✧</Text>
                  <Text style={styles.inviteText}>{t('onboarding.step0.invite')}</Text>
                </View>
              </View>
            )}

            {step === 1 && (
              <>
                <Intro
                  eyebrow={t('onboarding.step1.eyebrow')}
                  title={t('onboarding.step1.title')}
                  body={t('onboarding.step1.body')}
                />

                <View style={styles.entry}>
                  <Text style={styles.entryLabel}>{t('onboarding.step1.nameLabel')}</Text>
                  <TextInput
                    value={nombre}
                    onChangeText={setNombre}
                    placeholder={t('onboarding.step1.namePlaceholder')}
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                    selectionColor={colors.rose}
                    style={styles.nameInput}
                  />
                  <Text style={styles.entryHint}>{t('onboarding.step1.nameHint')}</Text>
                </View>

                <View style={styles.preview}>
                  <Text style={styles.previewLabel}>{t('onboarding.step1.previewLabel')}</Text>
                  <View style={styles.previewCard}>
                    <View style={styles.profile}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{inicial}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.hello} numberOfLines={1}>
                          {t('onboarding.step1.hello', {
                            name: nombre.trim() || t('onboarding.step1.helloFallback'),
                          })}
                        </Text>
                        <Text style={styles.helloSub}>{t('onboarding.step1.helloSub')}</Text>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.quote}>{t('onboarding.step1.quote')}</Text>
                  </View>
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <Intro
                  eyebrow={t('onboarding.step2.eyebrow')}
                  title={t('onboarding.step2.title')}
                  body={t('onboarding.step2.body')}
                />

                <View style={{ gap: 10 }}>
                  {filas.map((f) => (
                    <GoalRow
                      key={f.key}
                      label={f.label}
                      unit={f.unit}
                      value={f.value}
                      onChange={f.set}
                      focused={enfoque === f.key}
                      onFocus={() => setEnfoque(f.key)}
                      onBlur={() => setEnfoque((k) => (k === f.key ? null : k))}
                    />
                  ))}
                </View>

                <View style={styles.note}>
                  <Info size={16} color={colors.rose} />
                  <Text style={styles.noteText}>{t('onboarding.step2.note')}</Text>
                </View>
              </>
            )}

            {step === 3 && (
              <>
                <Intro
                  eyebrow={t('onboarding.step3.eyebrow')}
                  title={t('onboarding.step3.title')}
                  body={t('onboarding.step3.body')}
                />

                <View style={styles.waterCard}>
                  <View style={styles.waterHeader}>
                    <Text style={styles.waterTitle}>{t('onboarding.step3.waterTitle')}</Text>
                    <Droplet size={26} color={colors.wine} />
                  </View>

                  <View style={{ gap: 10 }}>
                    <Text style={styles.waterLabel}>{t('onboarding.step3.waterLabel')}</Text>
                    <View style={styles.waterField}>
                      <TextInput
                        value={aguaL}
                        onChangeText={(v) => setAguaL(soloDecimal(v))}
                        keyboardType="decimal-pad"
                        selectionColor={colors.wine}
                        style={styles.waterInput}
                      />
                      <Text style={styles.waterUnit}>{t('onboarding.step3.waterUnit')}</Text>
                    </View>
                  </View>

                  <View style={{ gap: 10 }}>
                    <View style={styles.glasses}>
                      {Array.from({ length: segmentos }).map((_, i) => (
                        <View key={i} style={styles.glass} />
                      ))}
                    </View>
                    <Text style={styles.waterEquiv}>
                      {t('onboarding.step3.waterEquiv', { count: vasos })}
                    </Text>
                  </View>
                </View>

                <View style={styles.personal}>
                  <Text style={styles.personalStar}>✧</Text>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.personalTitle}>{t('onboarding.step3.personalTitle')}</Text>
                    <Text style={styles.personalBody}>{t('onboarding.step3.personalBody')}</Text>
                  </View>
                </View>
              </>
            )}

            {step === 4 && (
              <>
                <Intro
                  eyebrow={t('onboarding.step4.eyebrow')}
                  title={
                    nombre.trim()
                      ? t('onboarding.step4.titleNamed', { name: nombre.trim() })
                      : t('onboarding.step4.titlePlain')
                  }
                  body={t('onboarding.step4.body')}
                />

                <View style={styles.summary}>
                  <View style={styles.summaryProfile}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{inicial}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.summaryName} numberOfLines={1}>
                        {nombre.trim() || t('onboarding.step4.summaryNameFallback')}
                      </Text>
                      <Text style={styles.summarySub}>{t('onboarding.step4.summarySub')}</Text>
                    </View>
                    <Check size={20} color={colors.wine} />
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.summaryTitle}>{t('onboarding.step4.summaryTitle')}</Text>
                  <View>
                    <SummaryRow label={t('macro.calories')} value={formatNumber(metas.kcal)} unit="kcal" />
                    <SummaryRow label={t('macro.protein')} value={String(metas.proteinas)} unit="g" />
                    <SummaryRow label={t('macro.carbsShort')} value={String(metas.carbohidratos)} unit="g" />
                    <SummaryRow label={t('macro.fat')} value={String(metas.grasas)} unit="g" />
                    <SummaryRow label={t('macro.water')} value={litros(metas.aguaMl)} unit="L" />
                  </View>
                </View>

                <Text style={styles.summaryNote}>{t('onboarding.step4.summaryNote')}</Text>
              </>
            )}
          </ScrollView>

          {/* Acciones */}
          <View style={styles.footer}>
            <View style={styles.controls}>
              {step > 0 && (
                <Pressable onPress={atras} style={styles.back}>
                  <ChevronLeft size={15} color={colors.textMuted} />
                  <Text style={styles.backLabel}>{t('onboarding.back')}</Text>
                </Pressable>
              )}

              <Pressable
                onPress={siguiente}
                disabled={!puedeContinuar}
                style={[styles.primary, !puedeContinuar && { opacity: 0.4 }]}
              >
                <Text style={styles.primaryLabel}>{BOTONES[step]}</Text>
                <IconoPrincipal size={18} color={colors.cream} />
              </Pressable>
            </View>

            <Text style={styles.caption}>{PIES[step]}</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Intro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <View style={styles.intro}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

type GoalRowProps = {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
};

function GoalRow({ label, unit, value, onChange, focused, onFocus, onBlur }: GoalRowProps) {
  const ref = useRef<TextInput>(null);
  // Con el campo activo se ve el número tal cual; si no, con separador de miles
  const display = focused || num(value) <= 0 ? value : formatNumber(num(value));

  return (
    <Pressable
      onPress={() => ref.current?.focus()}
      style={[styles.goalRow, focused && styles.goalRowActive]}
    >
      <Text style={[styles.goalLabel, focused && styles.goalMutedActive]}>{label}</Text>
      <TextInput
        ref={ref}
        value={display}
        onChangeText={(v) => onChange(soloDigitos(v))}
        onFocus={onFocus}
        onBlur={onBlur}
        keyboardType="number-pad"
        selectionColor={colors.wine}
        style={[styles.goalValue, focused && styles.goalValueActive]}
      />
      <Text style={[styles.goalUnit, focused && styles.goalMutedActive]}>{unit}</Text>
    </Pressable>
  );
}

function SummaryRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryRowLabel}>{label}</Text>
      <Text style={styles.summaryRowValue}>{value}</Text>
      <Text style={styles.summaryRowUnit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bg: { position: 'absolute', top: 0, left: 0, right: 0, aspectRatio: 440 / 956 },
  safe: { flex: 1 },

  // Cabecera
  header: { paddingHorizontal: 24 },
  identity: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 19, height: 19 },
  brand: { color: colors.cream, fontFamily: fonts.serif, fontSize: 25 },
  space: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  progress: { paddingTop: 8, paddingBottom: 12, gap: 10 },
  progressLabels: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stage: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  count: { color: colors.rose, fontFamily: fonts.sans, fontSize: 11 },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 3, borderRadius: 100, backgroundColor: colors.border },
  segmentOn: { backgroundColor: colors.rose },

  // Contenido
  content: { padding: 24, gap: 24 },
  contentCentered: { flexGrow: 1, justifyContent: 'center' },
  intro: { gap: 12 },
  eyebrow: { color: colors.rose, fontFamily: fonts.sans, fontSize: 11 },
  title: { color: colors.cream, fontFamily: fonts.serif, fontSize: 42, lineHeight: 43 },
  body: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 14, lineHeight: 22 },

  // Bienvenida
  welcome: { alignItems: 'center', gap: 26 },
  emblem: { width: 212, height: 212, alignSelf: 'center' },
  emblemImg: { width: 212, height: 212 },
  sparkle: {
    position: 'absolute',
    top: 184,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: colors.rose,
    fontFamily: fonts.serif,
    fontSize: 22,
  },
  welcomeText: { alignItems: 'center', gap: 16, alignSelf: 'stretch' },
  welcomeTitle: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 50,
    lineHeight: 51,
    textAlign: 'center',
  },
  welcomeBody: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 330,
  },
  invite: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inviteStar: { color: colors.rose, fontFamily: fonts.serif, fontSize: 16 },
  inviteText: { color: colors.textMuted, fontFamily: fonts.serifItalic, fontSize: 20 },

  // Tu nombre
  entry: { gap: 10 },
  entryLabel: { color: colors.cream, fontFamily: fonts.sans, fontSize: 12 },
  nameInput: {
    height: 64,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.rose,
    borderRadius: radii.tile,
    paddingHorizontal: 18,
    color: colors.cream,
    fontFamily: fonts.sans,
    fontSize: 20,
  },
  entryHint: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 11 },
  preview: { paddingTop: 16, gap: 12 },
  previewLabel: { color: colors.rose, fontFamily: fonts.sans, fontSize: 10 },
  previewCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    padding: 24,
    gap: 20,
  },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.rose, fontFamily: fonts.serifItalic, fontSize: 32 },
  hello: { color: colors.ink, fontFamily: fonts.serif, fontSize: 34 },
  helloSub: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  divider: { height: 1, backgroundColor: colors.divider },
  quote: { color: colors.inkMuted, fontFamily: fonts.serifItalic, fontSize: 22 },

  // Tus metas
  goalRow: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
  },
  goalRowActive: { backgroundColor: colors.cream, borderColor: colors.divider },
  goalLabel: { flex: 1, color: colors.textMuted, fontFamily: fonts.sans, fontSize: 14 },
  goalValue: {
    minWidth: 110,
    textAlign: 'right',
    color: colors.cream,
    fontFamily: fonts.sansMedium,
    fontSize: 28,
    padding: 0,
  },
  goalValueActive: { color: colors.ink },
  goalUnit: { width: 32, color: colors.textMuted, fontFamily: fonts.sans, fontSize: 12 },
  goalMutedActive: { color: colors.inkMuted },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  noteText: {
    flex: 1,
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 18,
  },

  // Tu agua
  waterCard: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    padding: 24,
    gap: 22,
  },
  waterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterTitle: { color: colors.ink, fontFamily: fonts.serif, fontSize: 28 },
  waterLabel: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 12 },
  waterField: {
    height: 84,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.wine,
    borderRadius: radii.tile,
    paddingHorizontal: 18,
  },
  waterInput: {
    flex: 1,
    color: colors.ink,
    fontFamily: fonts.sansMedium,
    fontSize: 36,
    padding: 0,
  },
  waterUnit: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 14 },
  glasses: { flexDirection: 'row', gap: 5 },
  glass: { flex: 1, height: 7, borderRadius: 2, backgroundColor: colors.wine, opacity: 0.65 },
  waterEquiv: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 11 },
  personal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 18,
  },
  personalStar: { color: colors.rose, fontFamily: fonts.serif, fontSize: 24 },
  personalTitle: { color: colors.cream, fontFamily: fonts.serif, fontSize: 23 },
  personalBody: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 18,
  },

  // Todo listo
  summary: {
    backgroundColor: colors.cream,
    borderRadius: radii.card,
    padding: 22,
    gap: 16,
  },
  summaryProfile: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryName: { color: colors.ink, fontFamily: fonts.serif, fontSize: 30 },
  summarySub: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 11 },
  summaryTitle: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 10 },
  summaryRow: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryRowLabel: { flex: 1, color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 13 },
  summaryRowValue: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 20 },
  summaryRowUnit: { width: 30, color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 11 },
  summaryNote: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },

  // Acciones
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12, gap: 14 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: {
    width: 100,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
  },
  backLabel: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 13 },
  primary: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.wine,
    borderRadius: radii.tile,
  },
  primaryLabel: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 14 },
  caption: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
  },
});