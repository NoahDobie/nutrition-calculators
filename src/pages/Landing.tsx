import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { ArrowRight } from 'lucide-react';
import { CHAINS } from '../chains/registry';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA] text-slate-900 font-sans">
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            by Noah Dobie
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Nutrition Calculators</h1>
          <p className="mt-3 text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            Estimate what you're really eating at your favourite spots. Build a meal,
            tweak the toppings and quantities, and see a live Canadian Nutrition Facts label.
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CHAINS.map((c) => {
            const live = c.status === 'live';
            const card = (
              <div
                className={`relative h-full rounded-3xl border bg-white p-5 sm:p-6 transition-all ${
                  live
                    ? 'border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-0.5 cursor-pointer'
                    : 'border-dashed border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                    style={{ background: c.brand }}
                  >
                    <Icon icon={c.icon} className="w-7 h-7" />
                  </div>
                  {live ? (
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                      style={{ background: c.brand }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                      Coming soon
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-bold">{c.name}</h2>
                <p className="mt-1 text-sm text-slate-500 leading-relaxed">{c.tagline}</p>
                {live && (
                  <p className="mt-3 text-xs font-mono text-slate-400">nutrition.noahdobie.com/{c.slug}</p>
                )}
              </div>
            );
            return live ? (
              <Link key={c.slug} to={`/${c.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded-3xl">
                {card}
              </Link>
            ) : (
              <div key={c.slug}>{card}</div>
            );
          })}
        </div>
      </main>

      <footer className="py-10 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] max-w-2xl mx-auto leading-tight">
            Made by Noah Dobie. Not affiliated with or endorsed by any of these restaurants. Nutrition
            data is transcribed from publicly available guides and may not be 100% accurate — always
            check in-store or on the official website for the most up-to-date info.
          </p>
        </div>
      </footer>
    </div>
  );
};
