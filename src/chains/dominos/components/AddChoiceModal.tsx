import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { wholeInfo, type MenuItem } from '@nutrition/core';

export type AddMode = 'serving' | 'whole';

interface Props {
  item: MenuItem | null;
  onCancel: () => void;
  onConfirm: (item: MenuItem, mode: AddMode) => void;
}

/**
 * Shown when a menu item's listed serving is a fraction of a whole (e.g. a
 * slice of pizza, 1/4 of an order of fries). Lets the user add just the listed
 * serving or the whole item.
 */
export const AddChoiceModal: React.FC<Props> = ({ item, onCancel, onConfirm }) => {
  const whole = item ? wholeInfo(item.serving) : null;

  return (
    <AnimatePresence>
      {item && whole && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#006491]">
                  How much?
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                  {item.name}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              <Choice
                title={`Just the serving`}
                sub={`${item.serving} · ${item.calories} cal`}
                onClick={() => onConfirm(item, 'serving')}
              />
              <Choice
                title={`Whole ${whole.noun}`}
                sub={`${whole.multiplier} servings · ${Math.round(item.calories * whole.multiplier)} cal`}
                primary
                onClick={() => onConfirm(item, 'whole')}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Choice: React.FC<{
  title: string;
  sub: string;
  primary?: boolean;
  onClick: () => void;
}> = ({ title, sub, primary, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
      primary
        ? 'bg-[#006491] border-[#006491] text-white hover:bg-[#00567c]'
        : 'bg-white border-slate-200 text-slate-800 hover:border-[#006491]/50'
    }`}
  >
    <div className="min-w-0">
      <div className="font-bold leading-tight">{title}</div>
      <div className={`text-xs ${primary ? 'text-sky-100' : 'text-slate-500'}`}>{sub}</div>
    </div>
    <ChevronRight className="w-5 h-5 shrink-0 opacity-70" />
  </button>
);
