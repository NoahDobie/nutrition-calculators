import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import {
  sum,
  scale,
  EMPTY,
  NutritionLabel,
  MenuSearch,
  OrderPanel,
  type MenuItem,
  type Nutrition,
  type OrderEntry,
} from '@nutrition/core';
import type { SelectedExtra } from './types';
import { ExtrasModal } from './components/ExtrasModal';
import { entryNutrition } from './lib/nutritionUtils';
import { MENU_DATA, ALL_ITEMS, formatSize } from './data/menuData';
import { categoryIcon, categoryShortName, iconForItem } from './lib/emoji';

const BRAND = {
  '--brand': '#da291c',
  '--brand-accent': '#da291c',
  '--brand-soft': '#fee2e2',
} as React.CSSProperties;

export function TimsCalculator() {
  const [order, setOrder] = useState<OrderEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  const pushEntry = (label: string, detail: string, nutrition: Nutrition) => {
    setOrder((prev) => [...prev, { id: nextId, label, detail, nutrition, qty: 1 }]);
    setNextId((i) => i + 1);
  };

  const handleSelectItem = (item: MenuItem) => {
    if (item.customizable) {
      setPendingItem(item);
    } else {
      pushEntry(item.name, item.subcategory, entryNutrition(item));
    }
  };

  const handleConfirmExtras = (item: MenuItem, extras: SelectedExtra[]) => {
    const detail =
      extras.length === 0
        ? item.subcategory
        : extras
            .map((e) => `${e.qty}× ${e.option.name.replace(' Flavoured Syrup', '').replace(' Syrup', '')}`)
            .join(', ');
    pushEntry(item.name, detail, entryNutrition(item, extras));
    setPendingItem(null);
  };

  const removeEntry = (id: number) => setOrder((prev) => prev.filter((e) => e.id !== id));
  const updateQty = (id: number, delta: number) =>
    setOrder((prev) => prev.map((e) => (e.id === id ? { ...e, qty: Math.max(1, e.qty + delta) } : e)));
  const clearAll = () => setOrder([]);

  const mealTotal = useMemo(
    () => (order.length ? sum(order.map((e) => scale(e.nutrition, e.qty))) : EMPTY),
    [order],
  );

  return (
    <div style={BRAND} className="min-h-screen flex flex-col bg-[#FDFCFB] text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center text-slate-400 hover:text-red-700 shrink-0" aria-label="All calculators">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg sm:text-xl font-black italic tracking-tighter text-red-700 shrink-0">
              Tim Hortons
            </h1>
            <span className="bg-slate-100 text-slate-500 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1 truncate">
              Nutrition Calculator by Noah Dobie
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col h-[70vh] min-h-105 max-h-160 lg:h-[80vh] lg:max-h-none">
            <MenuSearch
              categories={MENU_DATA}
              allItems={ALL_ITEMS}
              onSelect={handleSelectItem}
              iconForItem={iconForItem}
              categoryIcon={categoryIcon}
              categoryShort={categoryShortName}
              formatSize={formatSize}
              title="Add Items"
            />
          </div>

          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <OrderPanel
              title="Your Meal"
              entries={order}
              total={mealTotal}
              onQty={updateQty}
              onRemove={removeEntry}
              onClear={clearAll}
              emptyText="Select items from the menu to calculate your meal's nutrition. Beverages can be customized with cream, milk, sugar, and syrups."
            />

            <div className="space-y-5 p-1">
              <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-red-600 shrink-0" />
                  Nutrition Facts
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Add items from the menu and see the combined nutrition for your whole meal —
                  including any extras or customizations you've added.
                </p>
                <div className="p-3 sm:p-4 bg-pink-50 border border-pink-100 rounded-2xl text-xs text-pink-900 flex gap-3">
                  <Info className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-pink-500" />
                  <p>
                    Heads up — numbers are based on standard recipes and might not be spot-on. Actual
                    nutrition can vary by location, substitutions, or how your order is made.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <NutritionLabel
                  data={mealTotal}
                  servingLabel={
                    order.length > 0 ? `${order.length} item${order.length === 1 ? '' : 's'}` : 'Select an item'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 sm:mt-12 py-8 sm:py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-300 text-[10px] max-w-2xl mx-auto leading-tight">
            Made by Noah Dobie to help people get a rough idea of what they're eating at Tim Hortons.
            This tool is not affiliated with or endorsed by Tim Hortons. Nutrition data is based on
            publicly available standard formulations and may not be 100% accurate — always check
            in-store or on the official website for the most up-to-date info.
          </p>
        </div>
      </footer>

      <ExtrasModal
        item={pendingItem}
        onCancel={() => setPendingItem(null)}
        onConfirm={handleConfirmExtras}
      />
    </div>
  );
}
