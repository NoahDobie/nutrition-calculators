import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Check, Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { SubComponents, SubIngredient, SubSelection, SubSize } from '../types';
import { subNutrition } from '../lib/sub';
import { ingredientIcon } from '../lib/icons';

interface Props {
  selection: SubSelection;
  components: SubComponents;
  onChange: (sel: SubSelection) => void;
  onAdd: () => void;
}

const SIZES: SubSize[] = ['6"', 'Footlong'];

export const SubBuilder: React.FC<Props> = ({ selection, components, onChange, onAdd }) => {
  const mult = selection.size === 'Footlong' ? 2 : 1;
  const live = useMemo(() => subNutrition(components, selection), [components, selection]);

  const set = (patch: Partial<SubSelection>) => onChange({ ...selection, ...patch });
  const toggleIn = (list: string[], name: string) =>
    list.includes(name) ? list.filter((x) => x !== name) : [...list, name];

  const cal = (i: SubIngredient) => i.calories * mult;
  const extras = selection.veggies.length + selection.sauces.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/60">
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* SIZE */}
        <Section step={1} title="Choose a size">
          <div className="flex gap-2">
            {SIZES.map((size) => {
              const active = selection.size === size;
              return (
                <button
                  key={size}
                  onClick={() => set({ size })}
                  style={active ? { background: 'var(--brand)', borderColor: 'var(--brand)' } : undefined}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    active ? 'text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-[var(--brand)]/50'
                  }`}
                >
                  {size}
                  {size === 'Footlong' && <span className="ml-1 text-[10px] opacity-70">(2×)</span>}
                </button>
              );
            })}
          </div>
        </Section>

        {/* BREAD */}
        <Section step={2} title="Pick your bread">
          <ChipGrid
            items={components.breads}
            selected={[selection.bread]}
            onSelect={(name) => set({ bread: name })}
            calOf={cal}
          />
        </Section>

        {/* PROTEIN */}
        <Section step={3} title="Protein" hint="pick one">
          <ChipGrid
            items={components.proteins}
            selected={selection.protein ? [selection.protein] : []}
            onSelect={(name) => set({ protein: selection.protein === name ? null : name })}
            calOf={cal}
            allowNone
            noneSelected={!selection.protein}
            onNone={() => set({ protein: null })}
          />
        </Section>

        {/* CHEESE */}
        <Section step={4} title="Cheese" hint="pick one">
          <ChipGrid
            items={components.cheeses}
            selected={selection.cheese ? [selection.cheese] : []}
            onSelect={(name) => set({ cheese: selection.cheese === name ? null : name })}
            calOf={cal}
            allowNone
            noneSelected={!selection.cheese}
            onNone={() => set({ cheese: null })}
          />
        </Section>

        {/* VEGGIES */}
        <Section step={5} title="Veggies" hint={`${selection.veggies.length} added`}>
          <ChipGrid
            items={components.veggies}
            selected={selection.veggies}
            onSelect={(name) => set({ veggies: toggleIn(selection.veggies, name) })}
            calOf={cal}
            multi
          />
        </Section>

        {/* SAUCES */}
        <Section step={6} title="Sauces" hint={`${selection.sauces.length} added`}>
          <ChipGrid
            items={components.sauces}
            selected={selection.sauces}
            onSelect={(name) => set({ sauces: toggleIn(selection.sauces, name) })}
            calOf={cal}
            multi
          />
        </Section>
      </div>

      {/* Sticky add bar */}
      <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">
            {selection.size} sub · {extras} extra{extras === 1 ? '' : 's'}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tabular-nums">{Math.round(live.calories)}</span>
            <span className="text-xs text-slate-500">cal · {live.protein.toFixed(0)}g protein</span>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAdd}
          style={{ background: 'var(--brand)' }}
          className="px-5 py-3 rounded-xl text-white text-sm font-bold shadow-lg flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Add to Order
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

interface ChipGridProps {
  items: SubIngredient[];
  selected: string[];
  onSelect: (name: string) => void;
  calOf: (i: SubIngredient) => number;
  multi?: boolean;
  allowNone?: boolean;
  noneSelected?: boolean;
  onNone?: () => void;
}

const ChipGrid: React.FC<ChipGridProps> = ({
  items, selected, onSelect, calOf, multi, allowNone, noneSelected, onNone,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {allowNone && (
      <button
        onClick={onNone}
        style={noneSelected ? { background: 'var(--brand)', borderColor: 'var(--brand)' } : undefined}
        className={`px-3 py-2 rounded-xl border-2 text-left text-sm font-semibold transition-all ${
          noneSelected ? 'text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
      >
        None
      </button>
    )}
    {items.map((it) => {
      const active = selected.includes(it.name);
      return (
        <button
          key={it.name}
          onClick={() => onSelect(it.name)}
          style={active ? { borderColor: 'var(--brand)', background: 'var(--brand-soft)' } : undefined}
          className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border-2 text-left transition-all ${
            active ? '' : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center"
            style={active ? { background: 'var(--brand)', color: '#fff' } : { background: '#f1f5f9', color: '#64748b' }}
          >
            <Icon icon={ingredientIcon(it.name)} className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-800 leading-tight truncate">{it.name}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{calOf(it)} cal</div>
          </div>
          {multi && active && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--brand)' }} />}
        </button>
      );
    })}
  </div>
);

const Section: React.FC<{ step: number; title: string; hint?: string; children: React.ReactNode }> = ({
  step, title, hint, children,
}) => (
  <div className="px-4 sm:px-5 py-4 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-2 mb-3">
      <span
        className="w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center"
        style={{ background: 'var(--brand)' }}
      >
        {step}
      </span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      {hint && <span className="ml-auto text-[11px] text-slate-400 font-medium">{hint}</span>}
    </div>
    {children}
  </div>
);
