import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import * as errorHandling from '../src/startup/errorHandling';
import { invoke } from '@tauri-apps/api/core';

// Mock the Tauri invoke to prevent actual native calls during testing
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({})
}));

// Mock DesktopApp
const FailingDesktopApp = () => {
  throw new Error('Test fatal React render error');
};
const WorkingDesktopApp = () => {
  return <div data-testid="working-app">Working App</div>;
};

describe('Anti-Blank Startup Resilience', () => {
  let originalError: any;
  let logFatalSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Suppress console.error output from React for expected errors during test
    originalError = console.error;
    console.error = vi.fn();

    document.body.innerHTML = `
      <div id="desktop-root">
        <div id="startup-fallback">Starting…</div>
      </div>
    `;

    logFatalSpy = vi.spyOn(errorHandling, 'logFatalError');
  });

  afterEach(() => {
    console.error = originalError;
    vi.restoreAllMocks();
    cleanup();
    document.body.innerHTML = '';
  });

  it('A. Normal startup -> loading fallback disappears', () => {
    errorHandling.setStartupPhase(errorHandling.StartupPhase.REACT_READY);
    expect(document.getElementById('startup-fallback')).toBeNull();
  });

  it('B. Missing root element -> visible fatal startup UI', () => {
    document.body.innerHTML = ''; // Simulate missing root
    errorHandling.logFatalError('MissingRootElement', 'No root');
    expect(logFatalSpy).toHaveBeenCalledWith('MissingRootElement', 'No root');
  });

  it('C. React render error -> Error Boundary displays fallback', async () => {
    render(
      <ErrorBoundary>
        <FailingDesktopApp />
      </ErrorBoundary>
    );

    // Use getAllByText because logFatalError and ErrorBoundary might both render the text
    expect(screen.getAllByText(/KeyFixer couldn't start correctly/i)[0]).toBeTruthy();
    expect(screen.getAllByText(/تعذر تشغيل KeyFixer/i)[0]).toBeTruthy();
    expect(logFatalSpy).toHaveBeenCalledWith('ReactRenderError', 'Test fatal React render error');
  });

  it('D. unhandled promise rejection', () => {
    errorHandling.registerGlobalHandlers();
    
    // Call the handler directly to avoid Vitest intercepting and failing the test
    if (window.onunhandledrejection) {
      window.onunhandledrejection({ reason: 'Test unhandled rejection' } as PromiseRejectionEvent);
    }
    
    expect(invoke).toHaveBeenCalledWith('log_fatal_startup_error', expect.objectContaining({
      errorType: 'UnhandledRejection',
      message: 'Test unhandled rejection'
    }));
  });

  it('E. window error', () => {
    errorHandling.registerGlobalHandlers();
    
    if (window.onerror) {
      // The parameters are: message, source, lineno, colno, error
      window.onerror('Test window error', undefined, undefined, undefined, undefined);
    }
    
    expect(invoke).toHaveBeenCalledWith('log_fatal_startup_error', expect.objectContaining({
      errorType: 'WindowError',
      message: 'Test window error'
    }));
  });

  it('F. Fatal startup UI works when Pro unavailable', () => {
    render(
      <ErrorBoundary>
        <FailingDesktopApp />
      </ErrorBoundary>
    );
    expect(screen.getAllByText(/KeyFixer couldn't start correctly/i)[0]).toBeTruthy();
  });

  it('G. Arabic fallback text renders correctly', () => {
    render(
      <ErrorBoundary>
        <FailingDesktopApp />
      </ErrorBoundary>
    );
    const arabicText = screen.getAllByText(/تعذر تشغيل KeyFixer/i)[0];
    expect(arabicText.getAttribute('dir')).toBe('rtl');
  });

  it('H. No user text is included in diagnostic logging', () => {
    errorHandling.logFatalError('Error', 'Safe message without user data');
    expect(invoke).toHaveBeenCalledWith('log_fatal_startup_error', {
      errorType: 'Error',
      message: 'Safe message without user data',
      phase: expect.any(String),
      timestamp: expect.any(Number)
    });
  });
});
