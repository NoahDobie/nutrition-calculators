import { StrictMode, Suspense, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { CHAINS } from './chains/registry';
import './index.css';

const SITE = 'Nutrition Calculators';
const DEFAULT_DESC =
  'Estimate the nutrition of your favourite fast-food meals — build, customize, and see a live Canadian Nutrition Facts label. By Noah Dobie.';

/** Sets <title> and the description meta from the active route. */
function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    const slug = pathname.replace(/^\/+/, '').split('/')[0];
    const chain = CHAINS.find((c) => c.slug === slug && c.status === 'live');
    document.title = chain ? `${chain.name} Nutrition Calculator · Noah Dobie` : `Nutrition Calculators · Noah Dobie`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', chain ? chain.tagline : DEFAULT_DESC);
  }, [pathname]);
  return null;
}

const RouteFallback = () => <div className="min-h-screen bg-[#F4F7FA]" />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TitleManager />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          {CHAINS.filter((c) => c.Component).map((c) => {
            const Calculator = c.Component!;
            return <Route key={c.slug} path={`/${c.slug}`} element={<Calculator />} />;
          })}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
);
