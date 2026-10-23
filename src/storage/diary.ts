import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DayLog } from '../types';

const keyFor = (fecha: string) => `diary:${fecha}`;

export async function loadDay(fecha: string): Promise<DayLog> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(fecha));
    if (raw) return JSON.parse(raw) as DayLog;
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