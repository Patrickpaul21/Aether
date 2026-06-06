import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { useThemeStore } from './Store/themestore';

// Apply persisted theme before first render
const savedTheme = JSON.parse(localStorage.getItem('aether-theme') || '{}');
const themeId = savedTheme?.state?.activeTheme || 'theme-oled';
document.documentElement.className = themeId;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);