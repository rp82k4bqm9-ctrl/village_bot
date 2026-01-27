import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Gamepad2, 
  ShoppingCart, 
  MessageCircle, 
  HelpCircle, 
  Info, 
  Settings,
  Menu,
  X,
  Star,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface MainNavigationProps {
  isAdmin?: boolean;
}

export function MainNavigation({ isAdmin }: MainNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'home', name: 'Главная', icon: Home, path: '/', color: 'text-white' },
    { id: 'catalog', name: 'Каталог', icon: Gamepad2, path: '/catalog', color: 'text-[#d4af37]' },
    { id: 'steam', name: 'Steam', icon: CreditCard, path: '/steam', color: 'text-[#cd7f32]' },
    { id: 'cart', name: 'Корзина', icon: ShoppingCart, path: '/cart', color: 'text-[#daa520]' },
    { id: 'faq', name: 'FAQ', icon: HelpCircle, path: '/faq', color: 'text-[#b8860b]' },
    { id: 'support', name: 'Поддержка', icon: MessageCircle, path: '/support', color: 'text-slate-400' },
    { id: 'about', name: 'О нас', icon: Info, path: '/about', color: 'text-slate-400' },
    ...(isAdmin ? [{ id: 'admin', name: 'Админ-панель', icon: Settings, path: '/admin', color: 'text-rose-400' }] : [])
  ];

  const isActive = (path: string) => location.pathname === path;

  const NavigationContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : ''}`}>
      {/* Логотип без информации о пользователе */}
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
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setIsMobileMenuOpen(false);
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

      {/* Информация о Telegram */}
      {typeof window !== 'undefined' && window.Telegram?.WebApp && (
        <div className="mt-6 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400 text-sm">Telegram активен</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-r border-[#d4af37]/20 w-64 min-h-screen">
        <div className="p-6">
          <NavigationContent />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="bg-gradient-to-r from-[#1a1a1a] to-[#0d0d0d] border-b border-[#d4af37]/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#cd7f32] rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Village Store</h1>
              {isAdmin && (
                <p className="text-rose-400 text-xs">Админ</p>
              )}
            </div>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-r border-[#d4af37]/20">
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#d4af37] to-[#cd7f32] rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-black" />
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
                <NavigationContent isMobile={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}