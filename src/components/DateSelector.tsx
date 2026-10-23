import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, fonts } from '../theme/tokens';

type Props = {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  nextDisabled?: boolean;
};

export function DateSelector({ label, onPrev, onNext, nextDisabled }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} style={styles.arrow} hitSlop={8}>
        <ChevronLeft size={16} color={colors.textMuted} />
      </Pressable>

      <View style={styles.center}>
        <CalendarDays size={15} color={colors.rose} />
        <Text style={styles.label}>{label}</Text>
      </View>

      <Pressable
        onPress={nextDisabled ? undefined : onNext}
        style={[styles.arrow, nextDisabled && { opacity: 0.3 }]}
        hitSlop={8}
      >
        <ChevronRight size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  center: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 13 },
});