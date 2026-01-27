import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppFinal from './AppFinal.tsx'

// Типы для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        enableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppFinal />
  </StrictMode>,
)
