import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy.tsx'));
const TermsOfUse = lazy(() => import('./components/TermsOfUse.tsx'));

function Root() {
  const path = window.location.pathname;
  if (path === '/privacy' || path === '/privacy/') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <PrivacyPolicy />
      </Suspense>
    );
  }
  if (path === '/terms' || path === '/terms/') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
        <TermsOfUse />
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
