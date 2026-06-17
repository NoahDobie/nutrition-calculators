import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Plus, Minus, Check, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { PizzaConfig, PizzaSelection, ToppingGroup } from '../types';
import { useHorizontalWheel, wholeInfo } from '@nutrition/core';
import { SIZES, crustsForSize } from '../data/dominosData';
import { pizzaNutrition } from '../lib/pizza';
import { toppingIcon } from '../lib/icons';

export type AddMode = 'serving' | 'whole';

interface Props {
  selection: PizzaSelection;
  config: PizzaConfig;
  onChange: (sel: PizzaSelection) => void;
  onAdd: (mode: AddMode) => void;
}

const GROUP_ORDER: ToppingGroup[] = ['Meats', 'Veggies', 'Cheeses'];
const GROUP_ICON: Record<ToppingGroup, string> = {
  Meats: 'mdi:food-steak',
  Veggies: 'mdi:sprout',
  Cheeses: 'mdi:cheese',
};

export const PizzaBuilder: React.FC<Props> = ({ selection, config, onChange, onAdd }) => {
  const sizeRow = useHorizontalWheel<HTMLDivElement>();
  const live = useMemo(() => pizzaNutrition(config, selection), [config, selection]);
  const whole = useMemo(() => wholeInfo(config.serving), [config.serving]);

  const crusts = useMemo(() => crustsForSize(selection.size), [selection.size]);

  const setSize = (size: string) => {
    const firstCrust = crustsForSize(size)[0]?.crust ?? selection.crust;
    onChange({ ...selection, size, crust: firstCrust });
  };
  const setCrust = (crust: string) => onChange({ ...selection, crust });
  const setSauce = (sauce: string | null) =>
    onChange({ ...selection, sauce: selection.sauce === sauce ? null : sauce });
  const setCheese = (cheese: string | null) =>
    onChange({ ...selection, cheese: selection.cheese === cheese ? null : cheese });

  const setTopping = (name: string, qty: number) => {
    const toppings = { ...selection.toppings };
    if (qty <= 0) delete toppings[name];
    else toppings[name] = Math.min(2, qty);
    onChange({ ...selection, toppings });
  };

  const toppingCount = Object.values(selection.toppings).reduce((a: number, b: number) => a + b, 0);

  const grouped = useMemo(() => {
    return GROUP_ORDER.map((g) => ({
      group: g,
      items: config.toppings.filter((t) => t.group === g),
    })).filter((g) => g.items.length > 0);
  }, [config]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/60">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* SIZE */}
        <Section step={1} title="Choose a size">
          <div ref={sizeRow} className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {SIZES.map((size) => {
              const active = selection.size === size;
              return (
                <button
                  key={size}
                  onClick={() => setSize(size)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    active
                      ? 'bg-[#006491] border-[#006491] text-white shadow-md shadow-sky-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#006491]/50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Section>

        {/* CRUST */}
        <Section step={2} title="Pick your crust">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {crusts.map((c) => {
              const active = selection.crust === c.crust;
              return (
                <button
                  key={c.crust}
                  onClick={() => setCrust(c.crust)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                    active
                      ? 'bg-sky-50 border-[#006491] text-[#006491]'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-sm font-bold leading-tight">{c.crust}</span>
                  <span className="text-[10px] text-slate-500">
                    {c.crustNutrition.calories} cal · {c.serving}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* SAUCE */}
        <Section step={3} title="Add a sauce" hint="tap to toggle">
          <div className="flex flex-wrap gap-2">
            {config.sauces.map((s) => {
              const active = selection.sauce === s.name;
              return (
                <button
                  key={s.name}
                  onClick={() => setSauce(s.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#E31837] border-[#E31837] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-[#E31837]/40'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {s.name}
                  {s.limited && <span className="opacity-60">*</span>}
                  <span className={active ? 'text-red-100' : 'text-slate-400'}>
                    {s.calories}c
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* CHEESE */}
        <Section step={4} title="Cheese" hint="amount">
          <div className="flex flex-wrap gap-2">
            {[{ name: 'None' }, ...config.cheeses].map((c) => {
              const isNone = c.name === 'None';
              const active = isNone ? !selection.cheese : selection.cheese === c.name;
              const cal = isNone ? 0 : (c as { calories: number }).calories;
              return (
                <button
                  key={c.name}
                  onClick={() => setCheese(isNone ? null : c.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-amber-400 border-amber-400 text-amber-950'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                >
                  {c.name.replace(' Cheese', '')}
                  {!isNone && (
                    <span className={active ? 'text-amber-800' : 'text-slate-400'}>+{cal}c</span>
                  )}
                </button>
              );
            })}
          </div>
        </Section>

        {/* TOPPINGS */}
        <Section step={5} title="Toppings" hint={`${toppingCount} added`}>
          <div className="space-y-4">
            {grouped.map(({ group, items }) => (
              <div key={group}>
                <h4 className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  <Icon icon={GROUP_ICON[group]} className="w-3.5 h-3.5" />
                  {group}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {items.map((t) => {
                    const qty = selection.toppings[t.name] ?? 0;
                    const active = qty > 0;
                    return (
                      <div
                        key={t.name}
                        className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                          active ? 'bg-sky-50 border-[#006491]' : 'bg-white border-slate-200'
                        }`}
                      >
                        <button
                          onClick={() => setTopping(t.name, active ? 0 : 1)}
                          className="flex items-center gap-2 min-w-0 flex-1 text-left"
                        >
                          <div
                            className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center ${
                              active ? 'bg-[#006491] text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Icon icon={toppingIcon(t)} className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-slate-800 leading-tight truncate">
                              {t.name}
                              {t.limited && <span className="text-slate-400">*</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 leading-tight">
                              +{t.calories} cal
                            </div>
                          </div>
                        </button>
                        {active ? (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => setTopping(t.name, qty - 1)}
                              className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#E31837]"
                              aria-label="Less"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-[10px] font-bold tabular-nums leading-tight">
                              {qty === 2 ? 'Extra' : '1x'}
                            </span>
                            <button
                              onClick={() => setTopping(t.name, qty + 1)}
                              disabled={qty >= 2}
                              className="w-6 h-6 rounded-md bg-[#006491] text-white flex items-center justify-center disabled:opacity-30"
                              aria-label="More"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setTopping(t.name, 1)}
                            className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#006491] hover:text-white transition-colors"
                            aria-label="Add"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Sticky add bar */}
      <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
        <div className="flex items-baseline justify-between gap-3 mb-2.5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
              Per serving ({config.serving})
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tabular-nums">
                {Math.round(live.calories)}
              </span>
              <span className="text-xs text-slate-500">cal · {live.protein.toFixed(0)}g protein</span>
            </div>
          </div>
          {whole && (
            <div className="text-right">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
                Whole {whole.noun} ({whole.multiplier}×)
              </div>
              <span className="text-base font-bold text-slate-500 tabular-nums">
                {Math.round(live.calories * whole.multiplier)} cal
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onAdd('serving')}
            className="flex-1 px-4 py-3 rounded-xl bg-[#006491] hover:bg-[#00567c] text-white text-sm font-bold shadow-lg shadow-sky-200 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Add {whole ? '1 slice' : 'to order'}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
          {whole && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onAdd('whole')}
              className="flex-1 px-4 py-3 rounded-xl bg-white border-2 border-[#006491] text-[#006491] hover:bg-sky-50 text-sm font-bold flex items-center justify-center gap-1.5"
            >
              Add whole {whole.noun}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{
  step: number;
  title: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ step, title, hint, children }) => (
  <div className="px-4 sm:px-5 py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-[#006491] text-white text-[11px] font-bold flex items-center justify-center">
        {step}
      </span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {hint && <span className="ml-auto text-[11px] text-slate-400 font-medium">{hint}</span>}
    </div>
    {children}
  </div>
);
