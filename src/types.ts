export type Porcion = { etiqueta: string; gramos: number };

export type Food = {
  id: string;
  nombre: string;
  marca?: string;
  kcal100: number;
  proteinas100: number;
  carbohidratos100: number;
  grasas100: number;
  porciones?: Porcion[];
  propio?: boolean;
  unidad?: 'g' | 'ml';
};

// Un ingrediente guarda sus macros ya calculados, para que el historial
// no cambie si más adelante corriges el alimento.
export type Ingredient = {
  foodId: string;
  nombre: string;
  gramos: number;
  cantidadLabel?: string;
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
};

export type Meal = {
  id: string;
  tipo: string;
  hora: string;
  alimentos: string;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  kcal: number;
  fotoUri?: string;
  ingredientes?: Ingredient[];
};

export type DayLog = {
  fecha: string; // "2026-10-22"
  comidas: Meal[];
  aguaMl: number;
};
export type Goals = {
  kcal: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  aguaMl: number;
};

export type Settings = {
  nombre: string;
  goals: Goals;
  onboarded: boolean;
};