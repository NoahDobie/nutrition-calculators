import React, { useMemo, useState } from 'react';
import { Search, Plus, Sparkles } from 'lucide-react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'motion/react';
import type { MenuCategory, MenuItem } from './types';
import { useHorizontalWheel } from './useHorizontalWheel';

export interface MenuSearchProps {
  categories: MenuCategory[];
  allItems: MenuItem[];
  onSelect: (item: MenuItem) => void;
  /** Iconify icon name for a given item. */
  iconForItem: (item: MenuItem) => string;
  /** Iconify icon name for a category chip. */
  categoryIcon: (name: string) => string;
  categoryShort?: (name: string) => string;
  formatSize?: (size: string) => string;
  /** Custom subtitle for an item row. Defaults to serving · subcategory. */
  renderMeta?: (item: MenuItem) => React.ReactNode;
  placeholder?: string;
  title?: string;
  titleIcon?: string;
}

interface Group {
  name: string;
  items: MenuItem[];
}

export const MenuSearch: React.FC<MenuSearchProps> = ({
  categories,
  allItems,
  onSelect,
  iconForItem,
  categoryIcon,
  categoryShort = (n) => n,
  formatSize = (s) => s,
  renderMeta,
  placeholder,
  title = 'Add Items',
  titleIcon = 'mdi:plus-circle-outline',
}) => {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState(categories[0]?.name ?? '');
  const [activeSub, setActiveSub] = useState('All');

  const catRow = useHorizontalWheel<HTMLDivElement>();
  const subRow = useHorizontalWheel<HTMLDivElement>();

  const currentCat = useMemo(
    () => categories.find((c) => c.name === activeCat),
    [categories, activeCat],
  );

  const subChips = useMemo(() => {
    if (!currentCat?.subcategories?.length) return [];
    return ['All', ...currentCat.subcategories.map((s) => s.name)];
  }, [currentCat]);

  const catItems = (c: MenuCategory | undefined): MenuItem[] =>
    c ? (c.items ?? c.subcategories?.flatMap((s) => s.items) ?? []) : [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return allItems.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.subcategory.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      );
    }
    if (!currentCat) return [];
    if (activeSub !== 'All') {
      return currentCat.subcategories?.find((s) => s.name === activeSub)?.items ?? [];
    }
    return catItems(currentCat);
  }, [query, currentCat, activeSub, allItems]);

  const groups: Group[] = useMemo(() => {
    if (query.trim() || activeSub !== 'All' || !currentCat?.subcategories?.length) {
      return [{ name: '', items: filtered }];
    }
    return currentCat.subcategories.map((s) => ({ name: s.name, items: s.items }));
  }, [filtered, currentCat, query, activeSub]);

  const defaultMeta = (item: MenuItem) => (
    <span className="flex items-center gap-1.5 text-[11px] text-slate-500 min-w-0">
      <span className="truncate">
        {item.serving ? `${item.serving} · ` : ''}
        {item.subcategory}
      </span>
      {item.customizable && (
        <Sparkles className="w-2.5 h-2.5 shrink-0" style={{ color: 'var(--brand)' }} />
      )}
    </span>
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/60">
      <div className="p-4 sm:p-5 pb-3 bg-white border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-3">
          <Icon icon={titleIcon} className="w-6 h-6" style={{ color: 'var(--brand)' }} />
          {title}
        </h2>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder ?? `Search ${allItems.length} menu items…`}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl transition-all outline-none focus:ring-2 focus:ring-[var(--brand)]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {!query && (
          <>
            <div ref={catRow} className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {categories.map((cat) => {
                const active = activeCat === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      setActiveCat(cat.name);
                      setActiveSub('All');
                    }}
                    style={active ? { background: 'var(--brand)' } : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold transition-all shrink-0 ${
                      active ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Icon icon={categoryIcon(cat.name)} className="w-3.5 h-3.5" />
                    <span>{categoryShort(cat.name)}</span>
                    <span className={`text-[10px] tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {subChips.length > 0 && (
              <div ref={subRow} className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mt-1">
                {subChips.map((sub) => {
                  const active = activeSub === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setActiveSub(sub)}
                      className={`px-2.5 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all shrink-0 ${
                        active
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4 scrollbar-thin">
        {groups.map((group) => (
          <div key={group.name || 'all'} className="space-y-2">
            {group.name && (
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 sticky top-0 z-10 bg-slate-50 -mx-4 px-4 py-2">
                {group.name}
              </h3>
            )}
            <AnimatePresence mode="popLayout">
              {group.items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className="group flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md hover:border-[var(--brand)]/40"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-[var(--brand)] transition-colors">
                      <Icon icon={iconForItem(item)} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 leading-tight text-sm flex items-baseline min-w-0">
                        <span className="truncate">{item.baseName ?? item.name}</span>
                        {item.size && (
                          <span className="ml-1 mr-2 text-slate-500 font-normal shrink-0">
                            ({formatSize(item.size)})
                          </span>
                        )}
                      </h4>
                      {renderMeta ? renderMeta(item) : defaultMeta(item)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 text-sm leading-none">{item.calories}</p>
                      <p className="text-[10px] text-slate-400 leading-none">cal</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:text-white transition-all group-hover:bg-[var(--brand)]">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Search className="w-12 h-12 mb-2 opacity-20" />
            <p>No items match your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
