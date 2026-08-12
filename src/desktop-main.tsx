/**
 * @file desktop-main.tsx
 * Desktop entry point for KeyFixer Tauri app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DesktopApp } from './components/DesktopApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerGlobalHandlers, setStartupPhase, StartupPhase } from './startup/errorHandling';

registerGlobalHandlers();
setStartupPhase(StartupPhase.REACT_MOUNTING);

const rootElement = document.getElementById('desktop-root');
if (!rootElement) {
  import('./startup/errorHandling').then(({ logFatalError }) => {
    logFatalError('MissingRootElement', 'desktop-root not found in DOM');
  });
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <DesktopApp />
        </ErrorBoundary>
      </React.StrictMode>
    );
    // Give React a tick to mount before removing the fallback
    setTimeout(() => {
      setStartupPhase(StartupPhase.REACT_READY);
    }, 0);
  } catch (e: any) {
    import('./startup/errorHandling').then(({ logFatalError }) => {
      logFatalError('ReactMountError', e?.message || 'Failed to mount React');
    });
  }
}
