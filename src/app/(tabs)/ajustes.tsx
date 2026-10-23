import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, type Href } from 'expo-router';
import { ChevronRight, Sparkles, Target } from 'lucide-react-native';
import { useSettings } from '../../context/settings';
import { formatNumber } from '../../utils/format';
import { colors, fonts, radii } from '../../theme/tokens';

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
  const { settings } = useSettings();
  const g = settings.goals;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Ajustes</Text>

        <View style={styles.list}>
          <Row
            Icon={Target}
            label="Mis objetivos"
            detail={`${formatNumber(g.kcal)} kcal · P ${g.proteinas} g · C ${g.carbohidratos} g · G ${g.grasas} g`}
            onPress={() => router.push('/objetivos' as Href)}
          />
          <Row
            Icon={Sparkles}
            label="Ver la bienvenida otra vez"
            detail="Repite los pasos de inicio"
            onPress={() => router.push('/onboarding' as Href)}
          />
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
});