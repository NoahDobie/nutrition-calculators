import rawPizzas from './pizza_components.json';
import rawItems from './menu_items.json';
import type {
  Ingredient,
  MenuItem,
  Nutrition,
  PizzaConfig,
  Topping,
  ToppingGroup,
} from '../types';

interface RawNutrition {
  weight_g: number | null;
  calories_kcal: number | null;
  calories_from_fat: number | null;
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

function toNutrition(r: RawNutrition): Nutrition {
  return {
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
  };
}

// ---- Topping grouping (meat / cheese / veggie) ----
const MEATS = new Set([
  'Bacon Strip Crumble', 'Beef Crumble', 'Chicken', 'Ham', 'Pepperoni',
  'Extra-Large Pepperoni', 'Philly Steak', 'Salami', 'Sausage', 'Anchovies',
  'Donair Meat',
]);
const CHEESES = new Set([
  'White Processed Cheddar Cheese', 'Cheddar Cheese', 'Feta Cheese',
  'Provolone Cheese', 'Shredded Parmesan Asiago',
]);

function groupFor(name: string): ToppingGroup {
  if (MEATS.has(name)) return 'Meats';
  if (CHEESES.has(name)) return 'Cheeses';
  return 'Veggies';
}

// Normalize a couple of inconsistent topping names across pages.
function canonTopping(name: string): string {
  if (name === 'Green Olive') return 'Green Olives';
  return name;
}

interface RawPizza {
  size: string;
  crust: string;
  serving: string;
  crust_nutrition: RawNutrition;
  sauces: { name: string; raw?: string; nutrition: RawNutrition }[];
  cheeses: { name: string; nutrition: RawNutrition }[];
  toppings: { name: string; limited?: boolean; nutrition: RawNutrition }[];
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const PIZZAS: PizzaConfig[] = (rawPizzas as { pizzas: RawPizza[] }).pizzas.map(
  (p) => {
    const seen = new Set<string>();
    const toppings: Topping[] = [];
    for (const t of p.toppings) {
      const name = canonTopping(t.name);
      if (seen.has(name)) continue;
      seen.add(name);
      toppings.push({ ...toNutrition(t.nutrition), name, limited: t.limited, group: groupFor(name) });
    }
    const sauces: Ingredient[] = p.sauces.map((s) => ({
      ...toNutrition(s.nutrition),
      name: s.name,
      limited: (s.raw ?? s.name).includes('*'),
    }));
    const cheeses: Ingredient[] = p.cheeses.map((c) => ({
      ...toNutrition(c.nutrition),
      name: c.name,
    }));
    return {
      id: `${slug(p.size)}__${slug(p.crust)}`,
      size: p.size,
      crust: p.crust,
      serving: p.serving.replace(/^Size of\s*/i, ''),
      crustNutrition: toNutrition(p.crust_nutrition),
      sauces,
      cheeses,
      toppings,
    };
  },
);

// Size order + crust order for the builder selectors.
const SIZE_ORDER = ['6" Personal', 'Small', 'Medium', 'Large', 'X-Large'];
export const SIZES: string[] = [...new Set(PIZZAS.map((p) => p.size))].sort(
  (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
);

export function crustsForSize(size: string): PizzaConfig[] {
  const CRUST_ORDER = [
    'Hand Tossed', 'Crunchy Thin', 'Pan', 'New York Style',
    'Parmesan Stuffed Crust', 'Gluten Free',
  ];
  return PIZZAS.filter((p) => p.size === size).sort(
    (a, b) => CRUST_ORDER.indexOf(a.crust) - CRUST_ORDER.indexOf(b.crust),
  );
}

export function findPizza(size: string, crust: string): PizzaConfig | undefined {
  return PIZZAS.find((p) => p.size === size && p.crust === crust);
}

// ---- Standalone menu items ----
interface RawItem {
  name: string;
  category: string;
  subcategory: string;
  serving: string;
  nutrition: RawNutrition;
}

const CATEGORY_ORDER = [
  'Feast Pizzas', 'Breads', 'Chicken', 'Pasta', 'Desserts', 'Other',
];

export const MENU_ITEMS: MenuItem[] = (rawItems as { items: RawItem[] }).items.map(
  (it, i) => ({
    ...toNutrition(it.nutrition),
    id: `item-${i}`,
    name: it.name,
    category: it.category,
    subcategory: it.subcategory,
    serving: it.serving,
  }),
);

export interface MenuCategory {
  name: string;
  count: number;
  items: MenuItem[];
}

export const MENU_CATEGORIES: MenuCategory[] = [...
  MENU_ITEMS.reduce((map, item) => {
    if (!map.has(item.category)) map.set(item.category, []);
    map.get(item.category)!.push(item);
    return map;
  }, new Map<string, MenuItem[]>())
]
  .sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
  .map(([name, items]) => ({ name, count: items.length, items }));

export const TOTAL_MENU_ITEMS = MENU_ITEMS.length;
