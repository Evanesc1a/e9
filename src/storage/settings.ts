import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Goals, Settings } from '../types';

const KEY = 'settings';

// Valores de ejemplo, no una recomendación
export const DEFAULT_GOALS: Goals = {
  kcal: 1920,
  proteinas: 120,
  carbohidratos: 225,
  grasas: 60,
  aguaMl: 2000,
};

export const DEFAULT_SETTINGS: Settings = {
  nombre: '',
  goals: DEFAULT_GOALS,
  onboarded: false,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        goals: { ...DEFAULT_GOALS, ...parsed.goals },
      };
    }
  } catch (e) {
    console.warn('No se pudieron leer los ajustes', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('No se pudieron guardar los ajustes', e);
  }
}