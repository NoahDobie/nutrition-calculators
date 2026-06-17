import type { Nutrition, MenuCategory, MenuSubcategory } from '@nutrition/core';

export type { Nutrition, MenuItem, MenuCategory, MenuSubcategory, OrderEntry } from '@nutrition/core';

/** Back-compat aliases for the existing Tim's data/code. */
export type NutritionData = Nutrition;
export type Category = MenuCategory;
export type Subcategory = MenuSubcategory;

export type ExtraKind = 'cream' | 'milk' | 'sugar' | 'syrup';

export interface ExtraOption extends Nutrition {
  id: string;
  name: string;
  kind: ExtraKind;
  appliesTo: 'Coffee' | 'Iced Coffee' | 'Tea' | 'Any';
  size?: string;
}

export interface SelectedExtra {
  option: ExtraOption;
  qty: number;
}
