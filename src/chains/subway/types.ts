import type { Nutrition } from '@nutrition/core';

export type { Nutrition, MenuItem, MenuCategory, OrderEntry } from '@nutrition/core';

export type SubSize = '6"' | 'Footlong';

/** A pickable build-your-own ingredient (bread / protein / cheese / veggie / sauce). */
export interface SubIngredient extends Nutrition {
  name: string;
}

export interface SubComponents {
  breads: SubIngredient[];
  proteins: SubIngredient[];
  cheeses: SubIngredient[];
  veggies: SubIngredient[];
  sauces: SubIngredient[];
}

/** Current state of the sandwich being built. Values are per 6"; Footlong doubles. */
export interface SubSelection {
  size: SubSize;
  bread: string;
  protein: string | null;
  cheese: string | null;
  veggies: string[];
  sauces: string[];
}
