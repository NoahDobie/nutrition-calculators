/** Canonical per-serving nutrition shape shared by every calculator. */
export interface Nutrition {
  weight?: number;
  calories: number;
  fat: number;
  saturatedFat: number;
  transFat: number;
  cholesterol: number;
  sodium: number;
  carbohydrates: number;
  fibre: number;
  sugars: number;
  protein: number;
}

/**
 * A searchable menu item. Nutrition fields are flat on the item (it extends
 * Nutrition) so the search list can read `item.calories` directly; the full
 * object is also a valid `Nutrition` when adding to an order.
 */
export interface MenuItem extends Nutrition {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  serving?: string;
  /** Optional display helpers (e.g. Tim's "Coffee" + size "Large"). */
  size?: string;
  baseName?: string;
  /** Marks items that open a customization flow rather than adding directly. */
  customizable?: boolean;
}

export interface MenuSubcategory {
  name: string;
  items: MenuItem[];
}

/**
 * A category for the chip row. Provide `subcategories` for two-level chains
 * (Tim's) or a flat `items` list for one-level chains (Domino's menu tab).
 */
export interface MenuCategory {
  name: string;
  count: number;
  subcategories?: MenuSubcategory[];
  items?: MenuItem[];
}

/** A line in the order/meal list. `nutrition` is per-unit; multiply by `qty`. */
export interface OrderEntry {
  id: number;
  label: string;
  detail: string;
  nutrition: Nutrition;
  qty: number;
  /** Free-form tag the host app can use to pick a leading icon. */
  kind?: string;
}
