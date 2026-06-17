import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Info, Sandwich, Search } from 'lucide-react';
import {
  EMPTY,
  scale,
  sum,
  NutritionLabel,
  MenuSearch,
  OrderPanel,
  type MenuItem,
  type Nutrition,
  type OrderEntry,
} from '@nutrition/core';
import type { SubSelection } from './types';
import { SubBuilder } from './components/SubBuilder';
import { SUB_COMPONENTS, MENU_CATEGORIES, MENU_ITEMS } from './data/subwayData';
import { subNutrition } from './lib/sub';
import { categoryIcon, iconForItem } from './lib/icons';

type Mode = 'build' | 'menu';

const BRAND = {
  '--brand': '#008c15',
  '--brand-accent': '#e11900',
  '--brand-soft': '#e3f3e6',
} as React.CSSProperties;

const initialSelection: SubSelection = {
  size: '6"',
  bread: 'Italian',
  protein: 'Turkey Breast',
  cheese: 'Cheddar, Processed',
  veggies: ['Lettuce', 'Tomatoes', 'Onions, Red'],
  sauces: [],
};

export function SubwayCalculator() {
  const [mode, setMode] = useState<Mode>('build');
  const [selection, setSelection] = useState<SubSelection>(initialSelection);
  const [order, setOrder] = useState<OrderEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const buildingNutrition = useMemo(() => subNutrition(SUB_COMPONENTS, selection), [selection]);

  const buildingLabel = useMemo(() => {
    const main = selection.protein ?? selection.bread;
    const bits = [
      selection.bread,
      selection.cheese ?? 'no cheese',
      selection.veggies.length ? `${selection.veggies.length} veg` : 'no veg',
      selection.sauces.length ? `${selection.sauces.length} sauce${selection.sauces.length === 1 ? '' : 's'}` : 'no sauce',
    ];
    return { title: `${selection.size} ${main} Sub`, detail: bits.join(' · ') };
  }, [selection]);

  const pushEntry = (entry: Omit<OrderEntry, 'id' | 'qty'>) => {
    setOrder((prev) => [...prev, { ...entry, id: nextId, qty: 1 }]);
    setNextId((i) => i + 1);
  };

  const addSub = () =>
    pushEntry({ kind: 'sub', label: buildingLabel.title, detail: buildingLabel.detail, nutrition: buildingNutrition });

  const addItem = (item: MenuItem) => {
    const { id: _id, name, category: _c, subcategory, serving, ...rest } = item;
    pushEntry({
      kind: 'item',
      label: name,
      detail: serving ? `${serving} · ${subcategory}` : subcategory,
      nutrition: rest as Nutrition,
    });
  };

  const removeEntry = (id: number) => setOrder((prev) => prev.filter((e) => e.id !== id));
  const updateQty = (id: number, delta: number) =>
    setOrder((prev) => prev.map((e) => (e.id === id ? { ...e, qty: Math.max(1, e.qty + delta) } : e)));
  const clearAll = () => setOrder([]);

  const orderTotal = useMemo(() => sum(order.map((e) => scale(e.nutrition, e.qty))), [order]);

  const showPreview = order.length === 0 && mode === 'build';
  const labelData: Nutrition = order.length > 0 ? orderTotal : showPreview ? buildingNutrition : EMPTY;
  const labelServing =
    order.length > 0
      ? `${order.length} item${order.length === 1 ? '' : 's'}`
      : showPreview
        ? '1 sandwich (building)'
        : '1 serving';

  return (
    <div style={BRAND} className="min-h-screen flex flex-col bg-[#F5F7F4] text-slate-900 font-sans">
      <header className="text-white sticky top-0 z-30 shadow-md" style={{ background: 'var(--brand)' }}>
        <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link to="/" className="flex items-center text-white/80 hover:text-white shrink-0" aria-label="All calculators">
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg sm:text-xl font-black tracking-tight shrink-0">SUBWAY</h1>
            <span className="hidden sm:inline-block bg-white/15 text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1 truncate">
              Nutrition Calculator by Noah Dobie
            </span>
          </div>
          <div className="flex bg-white/15 rounded-xl p-1 text-sm font-bold">
            <button
              onClick={() => setMode('build')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'build' ? 'bg-white text-[#008c15]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Sandwich className="w-4 h-4" /> <span className="hidden xs:inline">Build</span>
            </button>
            <button
              onClick={() => setMode('menu')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                mode === 'menu' ? 'bg-white text-[#008c15]' : 'text-white/80 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" /> <span className="hidden xs:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[88rem] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-7 flex flex-col h-[78vh] min-h-120 lg:h-[80vh]">
            {mode === 'build' ? (
              <SubBuilder selection={selection} components={SUB_COMPONENTS} onChange={setSelection} onAdd={addSub} />
            ) : (
              <MenuSearch
                categories={MENU_CATEGORIES}
                allItems={MENU_ITEMS}
                onSelect={addItem}
                iconForItem={iconForItem}
                categoryIcon={categoryIcon}
                title="Subway Menu"
              />
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <OrderPanel
              entries={order}
              total={labelData}
              onQty={updateQty}
              onRemove={removeEntry}
              onClear={clearAll}
              emptyText={
                mode === 'build'
                  ? 'Build your sub on the left — the label below updates live. Hit “Add to Order” to stack items.'
                  : 'Search the menu and tap items to add them to your order.'
              }
              renderEntryIcon={(e) =>
                e.kind === 'sub' ? (
                  <Sandwich className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--brand)' }} />
                ) : (
                  <span className="w-2 h-2 mt-1.5 shrink-0 rounded-full" style={{ background: 'var(--brand-accent)' }} />
                )
              }
            />

            <div className="space-y-5 p-1">
              <div className="space-y-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Info className="w-5 h-5" style={{ color: 'var(--brand)' }} /> Nutrition Facts
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {order.length > 0
                    ? 'Combined nutrition for everything in your order.'
                    : showPreview
                      ? 'This label previews the sub you’re building, ingredient by ingredient. Footlong doubles every component.'
                      : 'Add items to your order to see their combined nutrition here.'}
                </p>
                <div className="p-3 rounded-2xl text-xs flex gap-3" style={{ background: 'var(--brand-soft)', color: '#15602a' }}>
                  <Info className="w-6 h-6 shrink-0" style={{ color: 'var(--brand)' }} />
                  <p>
                    Numbers come from Subway Canada's nutrition guide (April 2026), per 6" serving.
                    Actual values vary by store, bread, and how your sub is made.
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
            Made by Noah Dobie to help people estimate what they're eating at Subway. Not affiliated
            with or endorsed by Subway. Nutrition data is transcribed from the publicly available
            Canadian nutrition guide and may not be 100% accurate — always check in-store or on the
            official website for the most up-to-date info.
          </p>
        </div>
      </footer>
    </div>
  );
}
