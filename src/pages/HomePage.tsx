import { useNavigate } from 'react-router-dom';
import { 
  Gamepad2, 
  CreditCard, 
  ShoppingCart, 
  HelpCircle, 
  MessageCircle, 
  Info, 
  Settings,
  Star,
  TrendingUp,
  Tag
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
      id: 'catalog',
      name: 'Каталог игр',
      description: 'PS4, PS5, Xbox игры с фото и описанием',
      icon: Gamepad2,
      path: '/catalog',
      color: 'from-[#d4af37] to-[#cd7f32]',
      badge: 'Новое',
      features: ['Фото игр', 'Фильтры', 'Поиск', 'Корзина']
    },
    {
      id: 'steam',
      name: 'Steam услуги',
      description: 'Пополнение кошелька, покупка игр',
      icon: CreditCard,
      path: '/steam',
      color: 'from-[#cd7f32] to-[#b8860b]',
      features: ['Пополнение', 'Покупка игр', 'Подарки', 'Скидки']
    },
    {
      id: 'cart',
      name: 'Корзина',
      description: 'Ваши выбранные игры и услуги',
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
      features: ['24/7', 'Telegram', 'WhatsApp', 'Email']
    },
    {
      id: 'about',
      name: 'О нас',
      description: 'Информация о Village Store',
      icon: Info,
      path: '/about',
      color: 'from-slate-800 to-slate-900',
      features: ['История', 'Команда', 'Миссия', 'Контакты']
    }
  ];

  const adminSection = {
    id: 'admin',
    name: 'Админ-панель',
    description: 'Управление каталогом и фото',
    icon: Settings,
    path: '/admin',
    color: 'from-rose-600 to-rose-700',
    badge: 'Admin',
    features: ['Добавление игр', 'Загрузка фото', 'Редактирование', 'Статистика']
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Приветствие */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Добро пожаловать в Village Store! 🎮
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Ваш игровой магазин без регистрации и лишних форм
          </p>
          
          {isAdmin && (
            <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500/20 to-rose-600/20 px-4 py-2 rounded-lg border border-rose-500/30">
              <Settings className="w-4 h-4 text-rose-400" />
              <span className="text-rose-400 text-sm font-medium">Админ режим активен</span>
            </div>
          )}
        </div>

        {/* Основные разделы */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#d4af37]" />
            Основные услуги
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 hover:border-[#d4af37]/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
                  onClick={() => navigate(section.path)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {section.badge && (
                        <Badge className="bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black text-xs">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-white text-xl mt-4">{section.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {section.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <Button 
                        className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(section.path);
                        }}
                      >
                        Перейти
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Админ панель */}
        {isAdmin && (
          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-rose-400" />
              Управление
            </h2>
            
            <Card 
              className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-rose-500/20 hover:border-rose-500/40 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
              onClick={() => navigate(adminSection.path)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${adminSection.color} flex items-center justify-center shadow-lg`}>
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs">
                    {adminSection.badge}
                  </Badge>
                </div>
                <CardTitle className="text-white text-xl mt-4">{adminSection.name}</CardTitle>
                <CardDescription className="text-slate-400">
                  {adminSection.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {adminSection.features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-rose-500/10 text-rose-400 text-xs rounded-md"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-semibold"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(adminSection.path);
                    }}
                  >
                    Управлять
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Информационные разделы */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-slate-400" />
            Информация
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {infoSections.map((section) => {
              const Icon = section.icon;
              return (
                <Card 
                  key={section.id}
                  className="group bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 hover:border-slate-600 hover:-translate-y-1 transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden"
                  onClick={() => navigate(section.path)}
                >
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white text-xl mt-4">{section.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {section.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      <Button 
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(section.path);
                        }}
                      >
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-slate-400 text-sm">Игр</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 text-[#cd7f32] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">50+</div>
              <div className="text-slate-400 text-sm">Эксклюзивов</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#daa520]/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-[#daa520] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">5000+</div>
              <div className="text-slate-400 text-sm">Клиентов</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#b8860b]/20">
            <CardContent className="p-4 text-center">
              <Tag className="w-8 h-8 text-[#b8860b] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">До -70%</div>
              <div className="text-slate-400 text-sm">Скидки</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}