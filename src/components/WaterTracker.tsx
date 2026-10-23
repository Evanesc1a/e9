import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Droplet, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, radii } from '../theme/tokens';
import { formatDecimal } from '../utils/format';

type Props = {
  ml: number;
  goalMl: number;
  glassMl?: number;
  onAdd?: () => void;
};

const SEGMENTS = 8;

const toLiters = (ml: number) => formatDecimal(ml / 1000);

export function WaterTracker({ ml, goalMl, glassMl = 250, onAdd }: Props) {
  const { t } = useTranslation();
  const filled = Math.min(Math.round((ml / goalMl) * SEGMENTS), SEGMENTS);
  const glasses = Math.round(ml / glassMl);

  return (
    <View style={styles.card}>
      <Droplet size={24} color={colors.rose} />

      <View style={styles.middle}>
        <View style={styles.summary}>
          <Text style={styles.title}>{t('water.title')}</Text>
          <Text style={styles.amount}>
            {toLiters(ml)} / {toLiters(goalMl)} L
          </Text>
        </View>

        <View style={styles.segments}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: i < filled ? colors.rose : colors.border },
              ]}
            />
          ))}
        </View>

        <Text style={styles.equiv}>{t('water.glass', { count: glasses, ml: glassMl })}</Text>
      </View>

      <Pressable onPress={onAdd} style={styles.add} hitSlop={6}>
        <Plus size={18} color={colors.cream} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.tile,
    padding: 16,
  },
  middle: { flex: 1, gap: 8 },
  summary: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  title: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 13 },
  amount: { color: colors.cream, fontFamily: fonts.sans, fontSize: 12 },
  segments: { flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 7, borderRadius: 2 },
  equiv: { color: colors.textMuted, fontFamily: fonts.sans, fontSize: 10 },
  add: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});