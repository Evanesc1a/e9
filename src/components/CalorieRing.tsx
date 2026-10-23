import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../theme/tokens';
import { formatNumber } from '../utils/format';

type Props = {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
};

export function CalorieRing({ consumed, goal, size = 148, strokeWidth = 10 }: Props) {
  const { t } = useTranslation();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.divider}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.wine}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </Svg>

      <View style={styles.center}>
        <Text style={styles.value}>{formatNumber(consumed)}</Text>
        <Text style={styles.unit}>{t('calorieRing.consumedUnit')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  value: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 32 },
  unit: { color: colors.inkMuted, fontFamily: fonts.sans, fontSize: 11 },
});