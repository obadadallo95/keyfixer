import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const LegalPage = lazy(() =>
  import('./components/LegalPage.tsx').then((m) => ({ default: m.LegalPage }))
);
const AboutDeveloper = lazy(() => import('./components/AboutDeveloper.tsx'));

function Root() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/privacy') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <LegalPage initialDocId="privacy" />
      </Suspense>
    );
  }
  if (path === '/terms') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <LegalPage initialDocId="terms" />
      </Suspense>
    );
  }
  if (path === '/refund') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <LegalPage initialDocId="purchase-refund" />
      </Suspense>
    );
  }
  if (path === '/impressum') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <LegalPage initialDocId="impressum" />
      </Suspense>
    );
  }
  if (path === '/accessibility') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <LegalPage initialDocId="accessibility" />
      </Suspense>
    );
  }
  if (path === '/about') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <AboutDeveloper />
      </Suspense>
    );
  }
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

