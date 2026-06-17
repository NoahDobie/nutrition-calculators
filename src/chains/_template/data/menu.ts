import raw from './menu.json';
import type { MenuCategory, MenuItem, Nutrition } from '@nutrition/core';

// TODO: adjust to match the JSON your extract_*.py emits for this chain.
interface RawNutrition {
  weight_g?: number | null;
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
interface RawItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  serving?: string;
  nutrition: RawNutrition;
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

// TODO: set the order categories should appear in.
const CATEGORY_ORDER = ['Mains', 'Sweets'];

export const MENU_ITEMS: MenuItem[] = (raw as { items: RawItem[] }).items.map((it) => ({
  ...toNutrition(it.nutrition),
  id: it.id,
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
