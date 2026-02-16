import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  ShoppingCart, 
  HelpCircle, 
  MessageCircle, 
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HomePageProps {
  isAdmin?: boolean;
}

export function HomePage({ isAdmin }: HomePageProps) {
  const navigate = useNavigate();

  const mainSections = [
    {
      id: 'catalog-ps',
      name: 'Каталог игр PlayStation',
      description: 'PS4, PS5 игры по лучшим ценам',
      icon: Gamepad2,
      path: '/catalog/ps',
      color: 'from-blue-500 to-blue-600',
      badge: 'PS',
      features: ['PS5', 'PS4', 'Эксклюзивы', 'Подписки']
    },
    {
      id: 'catalog-xbox',
      name: 'Каталог игр Xbox',
      description: 'Xbox Series X/S, Xbox One игры',
      icon: Gamepad2,
      path: '/catalog/xbox',
      color: 'from-green-500 to-green-600',
      badge: 'Xbox',
      features: ['Series X/S', 'Xbox One', 'Game Pass', 'Подписки']
    },
    {
      id: 'cart',
      name: 'Корзина',
      description: 'Ваши выбранные игры',
      icon: ShoppingCart,
      path: '/cart',
      color: 'from-[#daa520] to-[#d4af37]',
      badge: 'Удобно',
      features: ['Быстрая оплата', 'История', 'Статус заказов']
    }
  ];

  const infoSections = [
    {
      id: 'faq',
      name: 'FAQ',
      description: 'Ответы на частые вопросы',
      icon: HelpCircle,
      path: '/faq',
      color: 'from-slate-600 to-slate-700',
      features: ['Доставка', 'Оплата', 'Возврат', 'Гарантия']
    },
    {
      id: 'support',
      name: 'Поддержка',
      description: 'Помощь и контакты',
      icon: MessageCircle,
      path: '/support',
      color: 'from-slate-700 to-slate-800',
      features: ['Telegram', 'Быстрый ответ']
    },

  ];

  const adminSection = {
    id: 'admin',
    name: 'Админ-панель',
    description: 'Управление каталогом и товарами',
    icon: Settings,
    path: '/admin',
    color: 'from-rose-600 to-rose-700',
    badge: 'Admin',
    features: ['Добавление игр', 'Удаление', 'Редактирование']
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Приветствие */}
        <div className="text-center mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Village Store 🎮
          </h1>
          <p className="text-slate-400 text-base lg:text-lg max-w-xl mx-auto">
            Игровой магазин в Telegram. Без регистрации!
          </p>
          
          {isAdmin && (
            <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/20 to-rose-600/20 px-4 py-2 rounded-lg border border-rose-500/30">
              <Settings className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-sm font-medium">Админ режим</span>
            </div>
          )}
        </div>

        {/* Основные разделы */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-[#d4af37]" />
            Основные разделы
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => navigate(section.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      {section.badge && (
                        <Badge className="bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black text-xs">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-lg mt-3">{section.name}</CardTitle>
                    <CardDescription className="text-slate-400 text-sm">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-semibold text-sm"
                    >
                      Перейти
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Админ панель */}
        {isAdmin && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-400" />
              Управление
            </h2>
            
            <Card 
              className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-rose-500/20 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() => navigate(adminSection.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${adminSection.color} flex items-center justify-center`}>
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs">
                    {adminSection.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg mt-3">{adminSection.name}</CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  {adminSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold"
                >
                  Управлять
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Информационные разделы */}
        <div className="space-y-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            Информация
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {infoSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden"
                  onClick={() => navigate(section.path)}
                >
                  <CardHeader className="pb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-white text-base">{section.name}</CardTitle>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>


      </div>
    </div>
  );
}
