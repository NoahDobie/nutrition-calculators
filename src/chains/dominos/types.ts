import type { Nutrition } from '@nutrition/core';

export type { Nutrition, MenuItem, MenuCategory, OrderEntry } from '@nutrition/core';

/** A pickable pizza ingredient (crust / sauce / cheese tier / topping). */
export interface Ingredient extends Nutrition {
  name: string;
  limited?: boolean;
}

export type ToppingGroup = 'Meats' | 'Cheeses' | 'Veggies';

export interface Topping extends Ingredient {
  group: ToppingGroup;
}

/** One size+crust combination, with its own per-serving ingredient values. */
export interface PizzaConfig {
  id: string;
  size: string;
  crust: string;
  serving: string;
  crustNutrition: Nutrition;
  sauces: Ingredient[];
  cheeses: Ingredient[]; // Light / Regular / Extra / Double / Triple
  toppings: Topping[];
}

/** The current state of the pizza the user is building. */
export interface PizzaSelection {
  size: string;
  crust: string;
  sauce: string | null;
  cheese: string | null; // cheese tier name, or null for none
  /** topping name -> quantity (1 = normal, 2 = extra) */
  toppings: Record<string, number>;
}
