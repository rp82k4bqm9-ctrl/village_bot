import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

// Главная навигация
import { MainNavigation } from './components/MainNavigation';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { SteamPage } from './pages/SteamPage';
import { FAQPage } from './pages/FAQPage';
import { SupportPage } from './pages/SupportPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { CartPage } from './pages/CartPage';

// Проверка админ-доступа по ID из URL или localStorage
function checkAdminAccess(): boolean {
  try {
    // Проверяем URL параметры
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    if (adminParam === 'true') return true;
    
    // Проверяем localStorage
    const savedAdmin = localStorage.getItem('village_admin_mode');
    if (savedAdmin === 'true') return true;
    
    // Проверяем Telegram WebApp
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
      return [6153426860, 123456].includes(userId);
    }
    
    return false;
  } catch {
    return false;
  }
}

function AppFinal() {
  const isAdmin = checkAdminAccess();
  
  console.log('🎮 Village Store - Магазин без регистрации!');
  console.log('🔑 Админ режим:', isAdmin ? 'Включен' : 'Выключен');

  return (
    <CartProvider>
      <div className="min-h-screen elegant-gradient">
        <Router>
          <div className="flex">
            {/* Навигация без привязки к пользователю */}
            <MainNavigation isAdmin={isAdmin} />
            
            {/* Контент */}
            <div className="flex-1">
              <main className="pb-8">
                <Routes>
                  <Route path="/" element={<HomePage isAdmin={isAdmin} />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/steam" element={<SteamPage />} />
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
