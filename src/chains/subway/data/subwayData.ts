import rawComponents from './components.json';
import rawItems from './menu_items.json';
import type { MenuCategory, MenuItem, Nutrition } from '@nutrition/core';
import type { SubComponents, SubIngredient } from '../types';

interface RawNutrition {
  weight_g: number | null;
  calories_kcal: number | null;
  fat_g: number | null;
  saturated_fat_g: number | null;
  trans_fat_g: number | null;
  cholesterol_mg: number | null;
  sodium_mg: number | null;
  carbohydrates_g: number | null;
  fibre_g: number | null;
  total_sugars_g: number | null;
  protein_g: number | null;
}

const n = (v: number | null | undefined) => (v == null ? 0 : v);
const toNutrition = (r: RawNutrition): Nutrition => ({
  weight: n(r.weight_g),
  calories: n(r.calories_kcal),
  fat: n(r.fat_g),
  saturatedFat: n(r.saturated_fat_g),
  transFat: n(r.trans_fat_g),
  cholesterol: n(r.cholesterol_mg),
  sodium: n(r.sodium_mg),
  carbohydrates: n(r.carbohydrates_g),
  fibre: n(r.fibre_g),
  sugars: n(r.total_sugars_g),
  protein: n(r.protein_g),
});

interface RawComp { name: string; nutrition: RawNutrition }
const toIngredients = (list: RawComp[]): SubIngredient[] =>
  list.map((c) => ({ ...toNutrition(c.nutrition), name: c.name }));

const raw = (rawComponents as { components: Record<string, RawComp[]> }).components;
export const SUB_COMPONENTS: SubComponents = {
  breads: toIngredients(raw.breads),
  proteins: toIngredients(raw.proteins),
  cheeses: toIngredients(raw.cheeses),
  veggies: toIngredients(raw.veggies),
  sauces: toIngredients(raw.sauces),
};

// ---- standalone menu items (cookies, sides, soups) ----
interface RawItem {
  name: string;
  category: string;
  subcategory: string;
  serving: string;
  nutrition: RawNutrition;
}

const CATEGORY_ORDER = ['Cookies & Desserts', 'Sides', 'Soups'];

export const MENU_ITEMS: MenuItem[] = (rawItems as { items: RawItem[] }).items.map((it, i) => ({
  ...toNutrition(it.nutrition),
  id: `item-${i}`,
  name: it.name,
  category: it.category,
  subcategory: it.subcategory,
  serving: it.serving,
}));

export const MENU_CATEGORIES: MenuCategory[] = [
  ...MENU_ITEMS.reduce((map, item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
    return map;
  }, new Map<string, MenuItem[]>()),
]
  .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
  .map(([name, items]) => ({ name, count: items.length, items }));
