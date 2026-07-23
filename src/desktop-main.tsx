/**
 * @file desktop-main.tsx
 * Desktop entry point for KeyFixer Tauri app.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DesktopApp } from './components/DesktopApp';

ReactDOM.createRoot(document.getElementById('desktop-root')!).render(
  <React.StrictMode>
    <DesktopApp />
  </React.StrictMode>
);
