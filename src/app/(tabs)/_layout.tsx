import { View } from 'react-native';
import { Redirect, Tabs, type Href } from 'expo-router';
import {
  BookOpen,
  ChartNoAxesCombined,
  Heart,
  Settings2,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../context/settings';
import { colors, fonts } from '../../theme/tokens';

function TabIcon  ({ Icon, focused }: { Icon: LucideIcon; focused: boolean }) {
  return (
    <View
      style={{
        width: 52,
        height: 29,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.border : 'transparent',
      }}
    >
      <Icon size={20} color={focused ? colors.rose : colors.textMuted} />
    </View>
  );
}

export default function TabsLayout() {
  const { loaded, settings } = useSettings();
  const { t } = useTranslation();

  // Primera vez: antes de ver el Diario, pasa por el onboarding
  if (!loaded) return null;
  if (!settings.onboarded) return <Redirect href={'/onboarding' as Href} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.rose,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.sansSemiBold, fontSize: 10 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.diary'),
          tabBarIcon: ({ focused }) => <TabIcon Icon={BookOpen} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progreso"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ focused }) => (
            <TabIcon Icon={ChartNoAxesCombined} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: t('tabs.favorites'),
          tabBarIcon: ({ focused }) => <TabIcon Icon={Heart} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused }) => <TabIcon Icon={Settings2} focused={focused} />,
        }}
      />
    </Tabs>
  );
}