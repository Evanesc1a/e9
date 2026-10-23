import AsyncStorage from '@react-native-async-storage/async-storage';

const FAV_KEY = 'foods:favorites';
const RECENT_KEY = 'foods:recents';
const MAX_RECENTS = 8;

async function readList(key: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as string[];
  } catch (e) {
    console.warn('No se pudo leer la lista', key, e);
  }
  return [];
}

async function writeList(key: string, list: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.warn('No se pudo guardar la lista', key, e);
  }
}

export const loadFavorites = () => readList(FAV_KEY);
export const loadRecents = () => readList(RECENT_KEY);

// Marca o desmarca un favorito. Devuelve la lista nueva (el más reciente primero)
export async function toggleFavorite(id: string): Promise<string[]> {
  const current = await readList(FAV_KEY);
  const next = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  await writeList(FAV_KEY, next);
  return next;
}

export async function pushRecent(id: string): Promise<void> {
  const current = await readList(RECENT_KEY);
  const next = [id, ...current.filter((x) => x !== id)].slice(0, MAX_RECENTS);
  await writeList(RECENT_KEY, next);
}