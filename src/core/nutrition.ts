import type { Nutrition } from './types';

// Health Canada daily values used for the % DV column.
export const DV = {
  FAT: 75,
  SAT_TRANS_FAT: 20,
  SODIUM: 2300,
  CARBS: 275,
  FIBRE: 28,
  SUGARS: 100,
  CHOLESTEROL: 300,
};

export const calculateDV = (value: number, limit: number): number =>
  Math.round((value / limit) * 100);

export const EMPTY: Nutrition = {
  weight: 0,
  calories: 0,
  fat: 0,
  saturatedFat: 0,
  transFat: 0,
  cholesterol: 0,
  sodium: 0,
  carbohydrates: 0,
  fibre: 0,
  sugars: 0,
  protein: 0,
};

export function add(a: Nutrition, b: Nutrition, mult = 1): Nutrition {
  return {
    weight: (a.weight ?? 0) + (b.weight ?? 0) * mult,
    calories: a.calories + b.calories * mult,
    fat: a.fat + b.fat * mult,
    saturatedFat: a.saturatedFat + b.saturatedFat * mult,
    transFat: a.transFat + b.transFat * mult,
    cholesterol: a.cholesterol + b.cholesterol * mult,
    sodium: a.sodium + b.sodium * mult,
    carbohydrates: a.carbohydrates + b.carbohydrates * mult,
    fibre: a.fibre + b.fibre * mult,
    sugars: a.sugars + b.sugars * mult,
    protein: a.protein + b.protein * mult,
  };
}

export function sum(parts: Nutrition[]): Nutrition {
  return parts.reduce((acc, p) => add(acc, p), { ...EMPTY });
}

export function scale(a: Nutrition, mult: number): Nutrition {
  return add({ ...EMPTY }, a, mult);
}

export interface WholeInfo {
  /** How many servings make up the whole item. */
  multiplier: number;
  /** What the whole unit is called, e.g. "pizza", "order", "sandwich". */
  noun: string;
}

/**
 * Nutrition guides list values per serving (a slice / a fraction of an order).
 * When the serving reads "1/N of pizza", "1/N order", etc., the whole item is N
 * servings. Returns null when the serving is already a unit ("2 pieces", "1 Dish").
 */
export function wholeInfo(serving: string | undefined | null): WholeInfo | null {
  if (!serving) return null;
  const m = serving.match(/1\/(\d+)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!n || n <= 1) return null;
  let noun = 'whole';
  if (/pizza/i.test(serving)) noun = 'pizza';
  else if (/order/i.test(serving)) noun = 'order';
  else {
    const last = serving.trim().split(/\s+/).pop();
    if (last && !/^\d|slices?|pieces?/i.test(last)) noun = last;
  }
  return { multiplier: n, noun };
}
