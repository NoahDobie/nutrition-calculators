import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info } from 'lucide-react';
import {
  sum,
  scale,
  EMPTY,
  wholeInfo,
  NutritionLabel,
  MenuSearch,
  OrderPanel,
  type MenuItem,
  type Nutrition,
  type OrderEntry,
} from '@nutrition/core';
import { MENU_CATEGORIES, MENU_ITEMS } from './data/menu';

// TODO: rename CHAIN. This is a plain searchable menu; for a customizable chain
// (Subway, Quesada) add a builder beside MenuSearch — see
// src/chains/dominos/components/PizzaBuilder.tsx as the reference.
const CHAIN = 'CHAIN';

// TODO: set this chain's brand colors (also used on the landing card via registry.ts).
const BRAND = {
  '--brand': '#16a34a',
  '--brand-accent': '#ea580c',
  '--brand-soft': '#dcfce7',
} as React.CSSProperties;

// TODO: map categories/items to Iconify icon names (icon-sets.iconify.design).
const categoryIcon = (_name: string) => 'mdi:silverware-fork-knife';
const iconForItem = (_item: MenuItem) => 'mdi:food-outline';

export function TemplateCalculator() {
  const [order, setOrder] = useState<OrderEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const addItem = (item: MenuItem) => {
    const { id: _id, name, category: _c, subcategory, serving, ...rest } = item;
    const detail = serving ? `${serving} · ${subcategory}` : subcategory;
    setOrder((prev) => [...prev, { id: nextId, label: name, detail, nutrition: rest as Nutrition, qty: 1 }]);
    setNextId((i) => i + 1);
    void wholeInfo; // available for serving-vs-whole flows (see Domino's AddChoiceModal)
  };

  const removeEntry = (id: number) => setOrder((prev) => prev.filter((e) => e.id !== id));
  const updateQty = (id: number, delta: number) =>
    setOrder((prev) => prev.map((e) => (e.id === id ? { ...e, qty: Math.max(1, e.qty + delta) } : e)));
  const clearAll = () => setOrder([]);

  const total = useMemo(
    () => (order.length ? sum(order.map((e) => scale(e.nutrition, e.qty))) : EMPTY),
    [order],
  );

  return (
    <div style={BRAND} className="min-h-screen flex flex-col bg-[#F6F7F9] text-slate-900 font-sans">
      <header className="text-white sticky top-0 z-30 shadow-md" style={{ background: 'var(--brand)' }}>
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-2">
          <Link to="/" className="flex items-center text-white/80 hover:text-white shrink-0" aria-label="All calculators">
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg sm:text-xl font-black tracking-tight">{CHAIN}</h1>
          <span className="hidden sm:inline-block bg-white/15 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1">
            Nutrition Calculator by Noah Dobie
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col h-[78vh] min-h-120 lg:h-[80vh]">
            <MenuSearch
              categories={MENU_CATEGORIES}
              allItems={MENU_ITEMS}
              onSelect={addItem}
              iconForItem={iconForItem}
              categoryIcon={categoryIcon}
              title={`${CHAIN} Menu`}
            />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <OrderPanel
              entries={order}
              total={total}
              onQty={updateQty}
              onRemove={removeEntry}
              onClear={clearAll}
              emptyText="Search the menu and tap items to add them to your order."
            />
            <div className="space-y-5 p-1">
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5" style={{ color: 'var(--brand)' }} /> Nutrition Facts
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Add items to your order to see their combined nutrition here.
                </p>
              </div>
              <div className="flex justify-center">
                <NutritionLabel
                  data={total}
                  servingLabel={order.length ? `${order.length} item${order.length === 1 ? '' : 's'}` : '1 serving'}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
