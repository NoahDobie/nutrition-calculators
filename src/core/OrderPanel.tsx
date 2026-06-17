import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import type { Nutrition, OrderEntry } from './types';

export interface OrderPanelProps {
  entries: OrderEntry[];
  /** Totals to show in the macro strip (host decides; may include a live preview). */
  total: Nutrition;
  onQty: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
  emptyText: React.ReactNode;
  title?: string;
  titleIcon?: string;
  /** Leading icon per row; defaults to a brand dot. */
  renderEntryIcon?: (entry: OrderEntry) => React.ReactNode;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({
  entries,
  total,
  onQty,
  onRemove,
  onClear,
  emptyText,
  title = 'Your Order',
  titleIcon = 'mdi:basket-outline',
  renderEntryIcon,
}) => {
  const macros = [
    { label: 'Calories', value: Math.round(total.calories).toString() },
    { label: 'Fat', value: total.fat.toFixed(1) },
    { label: 'Carbs', value: total.carbohydrates.toFixed(1) },
    { label: 'Protein', value: total.protein.toFixed(1) },
  ];

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/60 border border-slate-100">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2 min-w-0">
          <Icon icon={titleIcon} className="w-6 h-6 shrink-0" style={{ color: 'var(--brand)' }} />
          <span className="truncate">{title}</span>
        </h2>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-slate-400 hover:text-[var(--brand-accent)] flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      <div className="min-h-24 max-h-72 overflow-y-auto pr-1 space-y-2 mb-4 scrollbar-thin">
        <AnimatePresence mode="popLayout" initial={false}>
          {entries.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, scale: 0.95, x: -12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: 12 }}
              className="p-3 bg-slate-50 border border-slate-100 rounded-xl group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  {renderEntryIcon ? (
                    renderEntryIcon(e)
                  ) : (
                    <span
                      className="w-2 h-2 mt-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--brand)' }}
                    />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 text-sm block leading-tight truncate">
                      {e.label}
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-snug">{e.detail}</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(e.id)}
                  className="p-1.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-[var(--brand-accent)] hover:bg-white rounded-lg transition-all shrink-0"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/70">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onQty(e.id, -1)}
                    disabled={e.qty <= 1}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[var(--brand)] hover:border-[var(--brand)]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-sm font-bold tabular-nums">{e.qty}</span>
                  <button
                    onClick={() => onQty(e.id, 1)}
                    style={{ background: 'var(--brand)' }}
                    className="w-6 h-6 rounded-md text-white flex items-center justify-center transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[11px] font-semibold tabular-nums" style={{ color: 'var(--brand)' }}>
                  {Math.round(e.nutrition.calories * e.qty)} cal
                  {e.qty > 1 && (
                    <span className="text-slate-400 font-normal"> ({Math.round(e.nutrition.calories)} ea)</span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-7 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            <p className="text-center italic px-4 text-sm">{emptyText}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 p-3 sm:p-4 bg-slate-900 rounded-2xl text-white">
        {macros.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center text-center px-1 ${i > 0 ? 'border-l border-slate-700' : ''}`}
          >
            <p className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-black tracking-wide leading-none mb-1.5">
              {stat.label}
            </p>
            <p className="text-base sm:text-xl font-bold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
