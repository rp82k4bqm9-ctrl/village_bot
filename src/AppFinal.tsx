import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Главная навигация
import { MainNavigation } from './components/MainNavigation';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { FAQPage } from './pages/FAQPage';
import { SupportPage } from './pages/SupportPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';

// Список ID администраторов (Telegram ID)
const ADMIN_IDS = [6153426860, 8128537922];

// Проверка админ-доступа
function checkAdminAccess(): boolean {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    
    // Если в URL ?admin=true - даём доступ и сохраняем
    if (adminParam === 'true') {
      localStorage.setItem('village_admin_mode', 'true');
      return true;
    }
    
    // Проверяем сохранённый режим
    const savedAdmin = localStorage.getItem('village_admin_mode');
    if (savedAdmin === 'true') return true;
    
    // Проверяем Telegram WebApp user ID
    const tg = window.Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const userId = tg.initDataUnsafe.user.id;
      if (ADMIN_IDS.includes(userId)) {
        localStorage.setItem('village_admin_mode', 'true');
        return true;
      }
    }
    
    return false;
  } catch {
    return false;
  }
}

function AppFinal() {
  const isAdmin = checkAdminAccess();
  
  useEffect(() => {
    // Инициализация Telegram Mini App
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      
      // Растягиваем на всю высоту
      tg.expand();
      
      // Включаем подтверждение закрытия
      tg.enableClosingConfirmation();
      
      // Устанавливаем цвета
      tg.setHeaderColor('#000000');
      tg.setBackgroundColor('#000000');
      
      // Говорим что готовы
      tg.ready();
      
      console.log('📱 Telegram Mini App инициализирован');
    }
  }, []);

  return (
    <CartProvider>
      <div className="min-h-screen elegant-gradient tg-mobile">
        <Router>
          <div className="flex flex-col lg:flex-row">
            <MainNavigation isAdmin={isAdmin} />
            
            <div className="flex-1 min-h-screen">
              <main className="pb-20 lg:pb-8">
                <Routes>
                  <Route path="/" element={<HomePage isAdmin={isAdmin} />} />
                  <Route path="/catalog" element={<CatalogPage isAdmin={isAdmin} />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  {isAdmin && <Route path="/admin" element={<AdminPage />} />}
                  <Route path="/cart" element={<CartPage />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
        <Toaster position="top-center" />
      </div>
    </CartProvider>
  );
}

export default AppFinal;
