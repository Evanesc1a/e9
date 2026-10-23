import type { Food, Ingredient } from '../types';

export const round1 = (n: number) => Math.round(n * 10) / 10;

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

export function searchFoods(foods: Food[], query: string): Food[] {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  const list = foods.filter((f) => {
    const text = normalizeText(`${f.nombre} ${f.marca ?? ''}`);
    return tokens.every((t) => text.includes(t));
  });
  return list.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}