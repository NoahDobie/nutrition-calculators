import { add, scale, EMPTY, type Nutrition } from '@nutrition/core';
import type { SubComponents, SubSelection } from '../types';

/** Total nutrition for a building sandwich. Components are per 6"; Footlong doubles. */
export function subNutrition(c: SubComponents, sel: SubSelection): Nutrition {
  let total: Nutrition = { ...EMPTY };
  const bread = c.breads.find((b) => b.name === sel.bread);
  if (bread) total = add(total, bread);
  if (sel.protein) {
    const p = c.proteins.find((x) => x.name === sel.protein);
    if (p) total = add(total, p);
  }
  if (sel.cheese) {
    const ch = c.cheeses.find((x) => x.name === sel.cheese);
    if (ch) total = add(total, ch);
  }
  for (const name of sel.veggies) {
    const v = c.veggies.find((x) => x.name === name);
    if (v) total = add(total, v);
  }
  for (const name of sel.sauces) {
    const s = c.sauces.find((x) => x.name === name);
    if (s) total = add(total, s);
  }
  return sel.size === 'Footlong' ? scale(total, 2) : total;
}
