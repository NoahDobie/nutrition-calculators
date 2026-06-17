import { add, type Nutrition } from '@nutrition/core';
import type { PizzaConfig, PizzaSelection } from '../types';

/** Compute the total per-serving nutrition for a building pizza. */
export function pizzaNutrition(config: PizzaConfig, sel: PizzaSelection): Nutrition {
  let total: Nutrition = { ...config.crustNutrition };
  if (sel.sauce) {
    const sauce = config.sauces.find((s) => s.name === sel.sauce);
    if (sauce) total = add(total, sauce);
  }
  if (sel.cheese) {
    const cheese = config.cheeses.find((c) => c.name === sel.cheese);
    if (cheese) total = add(total, cheese);
  }
  for (const [name, qty] of Object.entries(sel.toppings)) {
    if (qty <= 0) continue;
    const top = config.toppings.find((t) => t.name === name);
    if (top) total = add(total, top, qty);
  }
  return total;
}
