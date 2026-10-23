import AsyncStorage from '@react-native-async-storage/async-storage';
import { FOODS_BASE } from '../data/foods';
import type { Food } from '../types';

const CUSTOM_KEY = 'foods:custom';

export async function loadCustomFoods(): Promise<Food[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_KEY);
    if (raw) return JSON.parse(raw) as Food[];
  } catch (e) {
    console.warn('No se pudieron leer los alimentos propios', e);
  }
  return [];
}

async function writeCustomFoods(foods: Food[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_KEY, JSON.stringify(foods));
  } catch (e) {
    console.warn('No se pudieron guardar los alimentos', e);
  }
}

export async function saveCustomFood(food: Food): Promise<void> {
  const current = await loadCustomFoods();
  await writeCustomFoods([food, ...current]);
}

export async function updateCustomFood(food: Food): Promise<void> {
  const current = await loadCustomFoods();
  await writeCustomFoods(current.map((f) => (f.id === food.id ? food : f)));
}

export async function deleteCustomFood(id: string): Promise<void> {
  const current = await loadCustomFoods();
  await writeCustomFoods(current.filter((f) => f.id !== id));
}

// Tus alimentos propios aparecen antes que los de la base
export async function loadAllFoods(): Promise<Food[]> {
  const custom = await loadCustomFoods();
  return [...custom, ...FOODS_BASE];
}