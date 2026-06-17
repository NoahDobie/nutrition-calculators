import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export interface ChainDef {
  slug: string;
  name: string;
  tagline: string;
  brand: string;
  icon: string; // Iconify name
  status: 'live' | 'soon';
  /** Lazily loaded so the landing page (and other chains) don't bundle this chain. */
  Component?: LazyExoticComponent<ComponentType> | ComponentType;
}

/** The single source of truth for routes (main.tsx) and the landing cards. */
export const CHAINS: ChainDef[] = [
  {
    slug: 'dominos',
    name: "Domino's",
    tagline: 'Build a pizza slice by slice, or browse the menu.',
    brand: '#006491',
    icon: 'mdi:pizza',
    status: 'live',
    Component: lazy(() =>
      import('./dominos/DominosCalculator').then((m) => ({ default: m.DominosCalculator })),
    ),
  },
  {
    slug: 'tims',
    name: 'Tim Hortons',
    tagline: 'Coffee, donuts, breakfast & lunch - with drink add-ins.',
    brand: '#da291c',
    icon: 'mdi:coffee',
    status: 'live',
    Component: lazy(() =>
      import('./tims/TimsCalculator').then((m) => ({ default: m.TimsCalculator })),
    ),
  },
  {
    slug: 'subway',
    name: 'Subway',
    tagline: 'Build your sub: bread, protein, cheese, veggies, sauces.',
    brand: '#008c15',
    icon: 'mdi:baguette',
    status: 'live',
    Component: lazy(() =>
      import('./subway/SubwayCalculator').then((m) => ({ default: m.SubwayCalculator })),
    ),
  },
  {
    slug: 'quesada',
    name: 'Quesada',
    tagline: 'Burritos & bowls, ingredient by ingredient.',
    brand: '#e4002b',
    icon: 'mdi:bowl-mix-outline',
    status: 'soon',
  },
];
