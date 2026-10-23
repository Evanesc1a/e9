import type { TFunction } from 'i18next';
import { FOOD_NAME_EN } from '../data/foods';
import i18n from '../i18n';
import type { Food, Ingredient } from '../types';

export const round1 = (n: number) => Math.round(n * 10) / 10;

// Nombre a mostrar según el idioma activo. Los alimentos propios (sin
// traducción) siempre muestran lo que escribió el usuario.
export function foodDisplayName(food: Food, lang: string = i18n.language): string {
  if (lang === 'en') return FOOD_NAME_EN[food.id] ?? food.nombre;
  return food.nombre;
}

// Etiqueta de una porción (unidad, taza, cucharada...) traducida si se
// reconoce; si no (porciones de alimentos propios), se muestra tal cual.
export function unitLabel(etiqueta: string, t: TFunction): string {
  const key = `units.${etiqueta}`;
  const translated = t(key);
  return translated === key ? etiqueta : translated;
}

// "P {p} g · C {c} g · G/F {g} g", con las iniciales en el idioma activo
export function macroSummary(t: TFunction, proteinas: number, carbohidratos: number, grasas: number): string {
  const p = t('macroAbbrev.protein');
  const c = t('macroAbbrev.carbs');
  const f = t('macroAbbrev.fat');
  return `${p} ${proteinas} g · ${c} ${carbohidratos} g · ${f} ${grasas} g`;
}

export function ingredientFor(
  food: Food,
  gramos: number,
  cantidadLabel?: string
): Ingredient {
  const f = gramos / 100;
  return {
    foodId: food.id,
    nombre: food.marca ? `${food.nombre} (${food.marca})` : food.nombre,
    gramos: round1(gramos),
    cantidadLabel,
    kcal: Math.round(food.kcal100 * f),
    proteinas: round1(food.proteinas100 * f),
    carbohidratos: round1(food.carbohidratos100 * f),
    grasas: round1(food.grasas100 * f),
  };
}

// Quita tildes y mayúsculas: "Atún" coincide con "atun"
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function searchFoods(foods: Food[], query: string, lang: string = i18n.language): Food[] {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  const list = foods.filter((f) => {
    const text = normalizeText(`${f.nombre} ${FOOD_NAME_EN[f.id] ?? ''} ${f.marca ?? ''}`);
    return tokens.every((t) => text.includes(t));
  });
  return list.sort((a, b) =>
    foodDisplayName(a, lang).localeCompare(foodDisplayName(b, lang), lang)
  );
}