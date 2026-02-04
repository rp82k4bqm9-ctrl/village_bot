import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingCart, 
  MessageCircle, 
  HelpCircle, 
  Info, 
  Settings,
  Menu,
  X,
  Star,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavigationItem {
  id: string;
  name: string;
  icon: LucideIcon;
  path: string;
  color: string;
}

interface MobileBottomNavProps {
  navigationItems: NavigationItem[];
  moreItems: NavigationItem[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isAdmin: boolean;
}

interface DesktopNavProps {
  navigationItems: NavigationItem[];
  moreItems: NavigationItem[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
  isAdmin: boolean;
}

// Mobile Bottom Navigation
function MobileBottomNav({
  navigationItems,
  moreItems,
  isActive,
  navigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isAdmin
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#d4af37]/20 z-50 lg:hidden">
      <div className="flex justify-around items-center h-16 pb-safe">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full ${
                active ? 'text-[#d4af37]' : 'text-slate-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-[#d4af37]' : ''}`} />
              <span className="text-xs mt-1">{item.name}</span>
            </button>
          );
        })}
        
        {/* Кнопка "Ещё" */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center w-full h-full text-slate-400">
              <Menu className="w-5 h-5" />
              <span className="text-xs mt-1">Ещё</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="p-0 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-t border-[#d4af37]/20 h-[70vh]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#cd7f32] rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Меню</h2>
                    <p className="text-slate-400 text-xs">Village Store</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <nav className="space-y-2">
                {[...navigationItems, ...moreItems].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setIsMobileMenuOpen(false);
                      }}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className={`w-full justify-start ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black'
                          : 'text-white hover:bg-[#1a1a1a] hover:text-[#d4af37]'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
              
              {isAdmin && (
                <div className="mt-6 p-3 bg-rose-500/20 text-rose-400 text-sm rounded border border-rose-500/30 text-center">
                  🔧 Админ режим активен
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

// Desktop Navigation
function DesktopNav({
  navigationItems,
  moreItems,
  isActive,
  navigate,
  isAdmin
}: DesktopNavProps) {
  return (
    <div className="hidden lg:block bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-r border-[#d4af37]/20 w-64 min-h-screen fixed left-0 top-0">
      <div className="p-6">
        {/* Логотип */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#cd7f32] rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Village Store</h2>
              <p className="text-slate-400 text-sm">Gaming Shop</p>
            </div>
          </div>
          {isAdmin && (
            <div className="mt-3 px-2 py-1 bg-rose-500/20 text-rose-400 text-xs rounded border border-rose-500/30">
              🔧 Админ режим
            </div>
          )}
        </div>

        {/* Навигация */}
        <nav className="space-y-2">
          {[...navigationItems, ...moreItems].map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                onClick={() => navigate(item.path)}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black'
                    : 'text-white hover:bg-[#1a1a1a] hover:text-[#d4af37]'
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${item.color}`} />
                {item.name}
              </Button>
            );
          })}
        </nav>

        {/* Telegram статус */}
        {typeof window !== 'undefined' && window.Telegram?.WebApp && (
          <div className="mt-6 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Telegram Mini App</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface MainNavigationProps {
  isAdmin?: boolean;
}

export function MainNavigation({ isAdmin = false }: MainNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems: NavigationItem[] = [
    { id: 'home', name: 'Главная', icon: Home, path: '/', color: 'text-white' },
    { id: 'cart', name: 'Корзина', icon: ShoppingCart, path: '/cart', color: 'text-[#daa520]' },
    ...(isAdmin ? [{ id: 'admin', name: 'Админ', icon: Settings, path: '/admin', color: 'text-rose-400' }] : [])
  ];

  const moreItems: NavigationItem[] = [
    { id: 'faq', name: 'FAQ', icon: HelpCircle, path: '/faq', color: 'text-[#b8860b]' },
    { id: 'support', name: 'Поддержка', icon: MessageCircle, path: '/support', color: 'text-slate-400' },
    { id: 'about', name: 'О нас', icon: Info, path: '/about', color: 'text-slate-400' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <DesktopNav 
        navigationItems={navigationItems}
        moreItems={moreItems}
        isActive={isActive}
        navigate={navigate}
        isAdmin={isAdmin}
      />
      <MobileBottomNav 
        navigationItems={navigationItems}
        moreItems={moreItems}
        isActive={isActive}
        navigate={navigate}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        isAdmin={isAdmin}
      />
      {/* Отступ для мобильной нижней панели */}
      <div className="lg:hidden h-16"></div>
    </>
  );
}
