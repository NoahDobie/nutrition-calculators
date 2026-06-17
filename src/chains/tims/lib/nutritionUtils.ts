import { add, EMPTY, type Nutrition } from '@nutrition/core';
import type { SelectedExtra } from '../types';

export { DV, calculateDV, EMPTY, sum, scale } from '@nutrition/core';

/** Total nutrition for a menu item plus any selected extras (cream, syrups, …). */
export function entryNutrition(item: Nutrition, extras: SelectedExtra[] = []): Nutrition {
  let total = add({ ...EMPTY }, item);
  for (const ex of extras) total = add(total, ex.option, ex.qty);
  return total;
}
