import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayLog, MealType } from '../types';

const keyFor = (fecha: string) => `diary:${fecha}`;

// Comidas guardadas antes de que "tipo" pasara a ser una clave estable
// (en español, tal como mostraba la interfaz en ese momento)
const TIPOS_LEGADO: Record<string, MealType> = {
  Desayuno: 'breakfast',
  Comida: 'lunch',
  Merienda: 'afternoonSnack',
  Cena: 'dinner',
  Snack: 'snack',
};

function migrarTipo(tipo: string): MealType {
  return (TIPOS_LEGADO[tipo] ?? tipo) as MealType;
}

export async function loadDay(fecha: string): Promise<DayLog> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(fecha));
    if (raw) {
      const day = JSON.parse(raw) as DayLog;
      return { ...day, comidas: day.comidas.map((m) => ({ ...m, tipo: migrarTipo(m.tipo) })) };
    }
  } catch (e) {
    console.warn('No se pudo leer el día', e);
  }
  return { fecha, comidas: [], aguaMl: 0 };
}

export async function saveDay(day: DayLog): Promise<void> {
  try {
    await AsyncStorage.setItem(keyFor(day.fecha), JSON.stringify(day));
  } catch (e) {
    console.warn('No se pudo guardar el día', e);
  }
}