import { invoke } from '@tauri-apps/api/core';

export enum StartupPhase {
  HTML_LOADED = 'HTML_LOADED',
  JS_STARTED = 'JS_STARTED',
  REACT_MOUNTING = 'REACT_MOUNTING',
  REACT_READY = 'REACT_READY',
  FATAL = 'FATAL'
}

let currentPhase = StartupPhase.JS_STARTED;

export function setStartupPhase(phase: StartupPhase) {
  currentPhase = phase;
  if (phase === StartupPhase.REACT_READY) {
    const fallback = document.getElementById('startup-fallback');
    if (fallback) fallback.remove();
  }
}

export function logFatalError(errorType: string, message: string) {
  currentPhase = StartupPhase.FATAL;
  const safeMessage = typeof message === 'string' ? message.substring(0, 500) : 'Unknown error';
  
  // Show visible fatal UI directly in DOM if React failed completely
  const root = document.getElementById('desktop-root');
  if (root && root.innerHTML.includes('Starting…')) {
    root.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;text-align:center;padding:20px;background:var(--bg, transparent);color:var(--text, #333);">
        <p style="font-weight:bold;margin-bottom:8px;">KeyFixer couldn't start correctly.<br/>Please quit and reopen the app.</p>
        <p dir="rtl" style="font-weight:bold;">تعذر تشغيل KeyFixer بشكل صحيح.<br/>يرجى إغلاق التطبيق وفتحه من جديد.</p>
      </div>
    `;
  }
  
  // Fire and forget native logging
  invoke('log_fatal_startup_error', {
    errorType,
    message: safeMessage,
    phase: currentPhase,
    timestamp: Date.now()
  }).catch(() => {});
}

export function registerGlobalHandlers() {
  window.onerror = (message, _source, _lineno, _colno, _error) => {
    logFatalError('WindowError', String(message));
  };
  window.onunhandledrejection = (event) => {
    logFatalError('UnhandledRejection', String(event.reason));
  };
}
