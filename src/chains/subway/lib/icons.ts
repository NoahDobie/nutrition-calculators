import type { MenuItem } from '@nutrition/core';

export const categoryIcon = (name: string): string => {
  if (/cookie|dessert/i.test(name)) return 'mdi:cookie-outline';
  if (/side/i.test(name)) return 'mdi:bowl-mix-outline';
  if (/soup/i.test(name)) return 'mdi:pot-steam-outline';
  return 'mdi:silverware-fork-knife';
};

export const iconForItem = (item: MenuItem): string => {
  if (/cookie/i.test(item.name)) return 'mdi:cookie-outline';
  if (/soup|barley|broccoli|mushroom|potato|noodle/i.test(item.name)) return 'mdi:pot-steam-outline';
  if (/rings|beans|salad/i.test(item.name)) return 'mdi:bowl-mix-outline';
  return categoryIcon(item.category);
};

// Icons for build-your-own ingredients (by name keyword).
export const ingredientIcon = (name: string): string => {
  const n = name.toLowerCase();
  if (/bacon|brisket|steak|salami|b\.m\.t|cold cut/.test(n)) return 'mdi:food-steak';
  if (/chicken|rotisserie/.test(n)) return 'mdi:food-drumstick-outline';
  if (/ham|pepperoni|sausage/.test(n)) return 'mdi:pig';
  if (/meatball/.test(n)) return 'mdi:circle-multiple-outline';
  if (/tuna/.test(n)) return 'mdi:fish';
  if (/egg/.test(n)) return 'mdi:egg-outline';
  if (/turkey/.test(n)) return 'mdi:food-turkey';
  if (/veggie patty|beans|corn/.test(n)) return 'mdi:sprout';
  if (/cheddar|jack|parmesan|cheese/.test(n)) return 'mdi:cheese';
  if (/lettuce|spinach/.test(n)) return 'mdi:leaf';
  if (/tomato|salsa/.test(n)) return 'mdi:fruit-cherries';
  if (/onion/.test(n)) return 'mdi:circle-double';
  if (/pepper|jalapeno/.test(n)) return 'mdi:chili-mild';
  if (/olive/.test(n)) return 'mdi:circle-outline';
  if (/cucumber|pickle/.test(n)) return 'mdi:cucumber';
  if (/avocado/.test(n)) return 'mdi:fruit-pear';
  if (/mayo|aioli|ranch|sauce|honey|mustard|teriyaki|bbq|chipotle/.test(n)) return 'mdi:bottle-tonic-outline';
  return 'mdi:food-outline';
};
