import type { MenuItem, Topping } from '../types';

// Iconify icons for menu categories.
export const CATEGORY_META: Record<string, { icon: string; short: string }> = {
  'Feast Pizzas': { icon: 'mdi:pizza', short: 'Feast Pizzas' },
  Breads: { icon: 'mdi:baguette', short: 'Breads' },
  Chicken: { icon: 'mdi:food-drumstick-outline', short: 'Chicken' },
  Pasta: { icon: 'mdi:pasta', short: 'Pasta' },
  Desserts: { icon: 'mdi:cupcake', short: 'Desserts' },
  Other: { icon: 'mdi:french-fries', short: 'Other' },
};

export const categoryIcon = (name: string) =>
  CATEGORY_META[name]?.icon ?? 'mdi:silverware-fork-knife';
export const categoryShort = (name: string) => CATEGORY_META[name]?.short ?? name;

const ITEM_ICON: Array<[RegExp, string]> = [
  [/fries/i, 'mdi:french-fries'],
  [/poutine/i, 'mdi:bowl-mix-outline'],
  [/wing|chicken|boneless/i, 'mdi:food-drumstick-outline'],
  [/cake|brownie/i, 'mdi:cupcake'],
  [/cinna/i, 'mdi:cookie-outline'],
  [/garlic finger|bread|stix|stuffed/i, 'mdi:baguette'],
  [/penne|pasta|alfredo|carbonara|marinara/i, 'mdi:pasta'],
  [/ketchup|pepper|butter/i, 'mdi:food-variant'],
];

export function iconForItem(item: MenuItem): string {
  if (item.category === 'Feast Pizzas') return 'mdi:pizza';
  for (const [re, icon] of ITEM_ICON) if (re.test(item.name)) return icon;
  return categoryIcon(item.category);
}

// Topping icons.
const TOPPING_ICON: Record<string, string> = {
  Pepperoni: 'mdi:circle-slice-8',
  'Extra-Large Pepperoni': 'mdi:circle-slice-8',
  Bacon: 'mdi:bacon',
  'Bacon Strip Crumble': 'mdi:bacon',
  'Beef Crumble': 'mdi:cow',
  Chicken: 'mdi:food-drumstick-outline',
  Ham: 'mdi:pig',
  Salami: 'mdi:circle-slice-8',
  Sausage: 'mdi:sausage',
  'Philly Steak': 'mdi:cow',
  Anchovies: 'mdi:fish',
  'Donair Meat': 'mdi:cow',
  Mushrooms: 'mdi:mushroom',
  Onions: 'mdi:circle-double',
  'Green Peppers': 'mdi:chili-mild',
  'Banana Peppers': 'mdi:chili-mild-outline',
  'Jalapeño Peppers': 'mdi:chili-hot',
  'Roasted Red Pepper': 'mdi:chili-mild',
  'Black Olives': 'mdi:circle-outline',
  'Green Olives': 'mdi:circle-outline',
  Pineapple: 'mdi:fruit-pineapple',
  Tomatoes: 'mdi:fruit-cherries',
  Spinach: 'mdi:leaf',
  'Feta Cheese': 'mdi:cheese',
  'Cheddar Cheese': 'mdi:cheese',
  'Provolone Cheese': 'mdi:cheese',
  'White Processed Cheddar Cheese': 'mdi:cheese',
  'Shredded Parmesan Asiago': 'mdi:cheese',
};

export const toppingIcon = (t: Topping) =>
  TOPPING_ICON[t.name] ??
  (t.group === 'Meats' ? 'mdi:food-steak' : t.group === 'Cheeses' ? 'mdi:cheese' : 'mdi:sprout');
