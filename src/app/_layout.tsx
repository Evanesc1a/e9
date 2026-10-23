import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { colors } from '../theme/tokens';
import { SettingsProvider, useSettings } from '../context/settings';
import { LoadingScreen } from '../components/LoadingScreen';

SplashScreen.preventAutoHideAsync();

// Tiempo mínimo (en milisegundos) que se ve la pantalla de carga. Pon 0 para quitarlo.
const MINIMO_CARGA: number = 800;

function Shell() {
  const { loaded } = useSettings();
  const [pasoElMinimo, setPasoElMinimo] = useState(MINIMO_CARGA === 0);

  useEffect(() => {
    if (MINIMO_CARGA === 0) return;
    const timer = setTimeout(() => setPasoElMinimo(true), MINIMO_CARGA);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded || !pasoElMinimo) return <LoadingScreen />;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="comida/nueva" options={{ presentation: 'modal' }} />
        <Stack.Screen name="objetivos" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // La pantalla de carga nativa se oculta enseguida: la nuestra la reemplaza sin saltos
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!fontsLoaded && !fontError) return <LoadingScreen />;

  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}