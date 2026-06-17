import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info, Pizza, Search } from 'lucide-react';
import {
  EMPTY,
  scale,
  sum,
  wholeInfo,
  NutritionLabel,
  MenuSearch,
  OrderPanel,
  type MenuItem,
  type Nutrition,
  type OrderEntry,
} from '@nutrition/core';
import type { PizzaSelection } from './types';
import { PizzaBuilder, type AddMode } from './components/PizzaBuilder';
import { AddChoiceModal } from './components/AddChoiceModal';
import {
  SIZES,
  crustsForSize,
  findPizza,
  MENU_CATEGORIES,
  MENU_ITEMS,
} from './data/dominosData';
import { pizzaNutrition } from './lib/pizza';
import { categoryIcon, categoryShort, iconForItem } from './lib/icons';

type Mode = 'build' | 'menu';

const defaultSize = SIZES.includes('Medium') ? 'Medium' : SIZES[0];
const initialSelection: PizzaSelection = {
  size: defaultSize,
  crust: crustsForSize(defaultSize)[0]?.crust ?? 'Hand Tossed',
  sauce: 'Pizza Sauce',
  cheese: 'Regular Cheese',
  toppings: {},
};

const BRAND = {
  '--brand': '#006491',
  '--brand-accent': '#e31837',
  '--brand-soft': '#e0f0f7',
} as React.CSSProperties;

export function DominosCalculator() {
  const [mode, setMode] = useState<Mode>('build');
  const [selection, setSelection] = useState<PizzaSelection>(initialSelection);
  const [order, setOrder] = useState<OrderEntry[]>([]);
  const [nextId, setNextId] = useState(1);
  const [choiceItem, setChoiceItem] = useState<MenuItem | null>(null);

  const config = useMemo(
    () =>
      findPizza(selection.size, selection.crust) ??
      findPizza(selection.size, crustsForSize(selection.size)[0].crust)!,
    [selection.size, selection.crust],
  );

  const buildingNutrition = useMemo(() => pizzaNutrition(config, selection), [config, selection]);

  const buildingLabel = useMemo(() => {
    const tops = Object.entries(selection.toppings);
    const topText =
      tops.length === 0
        ? 'no toppings'
        : tops.map(([n, q]) => (q === 2 ? `extra ${n}` : n)).join(', ');
    const cheese = selection.cheese ? selection.cheese.replace(' Cheese', ' cheese') : 'no cheese';
    return {
      title: `${selection.size} ${selection.crust} Pizza`,
      detail: `${selection.sauce ?? 'no sauce'} · ${cheese} · ${topText}`,
    };
  }, [selection]);

  const pushEntry = (entry: Omit<OrderEntry, 'id' | 'qty'>) => {
    setOrder((prev) => [...prev, { ...entry, id: nextId, qty: 1 }]);
    setNextId((i) => i + 1);
  };

  const addPizza = (addMode: AddMode) => {
    const whole = wholeInfo(config.serving);
    const isWhole = addMode === 'whole' && !!whole;
    const mult = isWhole && whole ? whole.multiplier : 1;
    const qtyText = isWhole && whole ? `whole pizza (${mult} slices)` : '1 slice';
    pushEntry({
      kind: 'pizza',
      label: buildingLabel.title,
      detail: `${buildingLabel.detail} · ${qtyText}`,
      nutrition: isWhole ? scale(buildingNutrition, mult) : buildingNutrition,
    });
  };

  // From the menu: fraction servings prompt for serving vs whole; everything else adds directly.
  const addItem = (item: MenuItem) => {
    if (wholeInfo(item.serving)) setChoiceItem(item);
    else pushItem(item, 'serving');
  };

  const pushItem = (item: MenuItem, addMode: AddMode) => {
    const whole = wholeInfo(item.serving);
    const isWhole = addMode === 'whole' && !!whole;
    const mult = isWhole && whole ? whole.multiplier : 1;
    const { id: _id, name, category: _c, subcategory, serving, ...rest } = item;
    const base = rest as Nutrition;
    const detail =
      isWhole && whole
        ? `whole ${whole.noun} (${mult}×) · ${subcategory}`
        : serving
          ? `${serving} · ${subcategory}`
          : subcategory;
    pushEntry({ kind: 'item', label: name, detail, nutrition: isWhole ? scale(base, mult) : base });
    setChoiceItem(null);
  };

  const removeEntry = (id: number) => setOrder((prev) => prev.filter((e) => e.id !== id));
  const updateQty = (id: number, delta: number) =>
    setOrder((prev) => prev.map((e) => (e.id === id ? { ...e, qty: Math.max(1, e.qty + delta) } : e)));
  const clearAll = () => setOrder([]);

  const orderTotal = useMemo(() => sum(order.map((e) => scale(e.nutrition, e.qty))), [order]);

  // Label/macro strip shows the order total, or the live pizza preview when the order
  // is empty and we're in build mode.
  const showPreview = order.length === 0 && mode === 'build';
  const labelData: Nutrition = order.length > 0 ? orderTotal : showPreview ? buildingNutrition : EMPTY;
  const labelServing =
    order.length > 0
      ? `${order.length} item${order.length === 1 ? '' : 's'}`
      : showPreview
        ? '1 serving (building)'
        : '1 serving';

  return (
    <div style={BRAND} className="min-h-screen flex flex-col bg-[#F4F7FA] text-slate-900 font-sans selection:bg-sky-100 selection:text-[#006491]">
      <header className="bg-[#006491] text-white sticky top-0 z-30 shadow-md shadow-sky-900/10">
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center gap-1 text-white/80 hover:text-white shrink-0" aria-label="All calculators">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg sm:text-xl font-black tracking-tight shrink-0">Domino's</h1>
            <span className="hidden sm:inline-block bg-white/15 text-sky-50 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1 truncate">
              Nutrition Calculator by Noah Dobie
            </span>
          </div>
          <div className="flex bg-white/10 rounded-xl p-1 text-sm font-bold">
            <button
              onClick={() => setMode('build')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'build' ? 'bg-white text-[#006491]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Pizza className="w-4 h-4" /> <span className="hidden xs:inline">Build</span>
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'menu' ? 'bg-white text-[#006491]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" /> <span className="hidden xs:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          {/* TOOL */}
          <div className="lg:col-span-7 flex flex-col h-[78vh] min-h-120 lg:h-[80vh]">
            {mode === 'build' ? (
              <PizzaBuilder selection={selection} config={config} onChange={setSelection} onAdd={addPizza} />
            ) : (
              <MenuSearch
                categories={MENU_CATEGORIES}
                allItems={MENU_ITEMS}
                onSelect={addItem}
                iconForItem={iconForItem}
                categoryIcon={categoryIcon}
                categoryShort={categoryShort}
                title="Domino's Menu"
              />
            )}
          </div>

          {/* ORDER + LABEL */}
          <div className="lg:col-span-5 space-y-6">
            <OrderPanel
              entries={order}
              total={labelData}
              onQty={updateQty}
              onRemove={removeEntry}
              onClear={clearAll}
              emptyText={
                mode === 'build'
                  ? 'Build your pizza on the left — the label below updates live. Add a slice or whole pizza to stack items.'
                  : 'Search the menu and tap items to add them to your order.'
              }
              renderEntryIcon={(e) =>
                e.kind === 'pizza' ? (
                  <Pizza className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--brand)' }} />
                ) : (
                  <span
                    className="w-2 h-2 mt-1.5 shrink-0 rounded-full"
                    style={{ background: 'var(--brand-accent)' }}
                  />
                )
              }
            />

            <div className="space-y-5 p-1">
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#006491]" /> Nutrition Facts
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {order.length > 0
                    ? 'Combined nutrition for everything in your order.'
                    : showPreview
                      ? 'This label previews the pizza you’re building, ingredient by ingredient. Per-serving values use the slice size shown in the builder.'
                      : 'Add items to your order to see their combined nutrition here.'}
                </p>
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-2xl text-xs text-[#00567c] flex gap-3">
                  <Info className="w-6 h-6 shrink-0 text-[#006491]" />
                  <p>
                    Numbers come from Domino's Canada nutrition guide (Aug 2025) and are per serving (a
                    slice or portion). Actual values vary by store, size, and how your order is made.
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <NutritionLabel data={labelData} servingLabel={labelServing} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 py-10 border-t border-slate-200 bg-white">
        <div className="max-w-[88rem] mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] max-w-2xl mx-auto leading-tight">
            Made by Noah Dobie to help people estimate what they're eating at Domino's. Not affiliated
            with or endorsed by Domino's Pizza. Nutrition data is transcribed from the publicly available
            Canadian Nutrition Guide and may not be 100% accurate — always check in-store or on the
            official website for the most up-to-date info.
          </p>
        </div>
      </footer>

      <AddChoiceModal item={choiceItem} onCancel={() => setChoiceItem(null)} onConfirm={pushItem} />
    </div>
  );
}
