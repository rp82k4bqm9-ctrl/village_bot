import { 
  Info, 
  Star, 
  Shield, 
  Zap,
  Users,
  Trophy,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ADVANTAGES = [
  {
    icon: Shield,
    title: 'Надёжность',
    description: 'Работаем с 2018 года. Более 50,000 успешных заказов и 10,000+ постоянных клиентов.'
  },
  {
    icon: Zap,
    title: 'Мгновенная доставка',
    description: 'Цифровые ключи отправляются автоматически сразу после оплаты. Никаких ожиданий!'
  },
  {
    icon: Star,
    title: 'Лучшие цены',
    description: 'Оптовые закупки у официальных дистрибьюторов позволяют нам держать низкие цены.'
  },
  {
    icon: Heart,
    title: 'Поддержка 24/7',
    description: 'Наша команда всегда на связи и готова помочь с любыми вопросами.'
  }
];

const STATS = [
  { value: '5+', label: 'Лет на рынке', icon: Trophy },
  { value: '50K+', label: 'Заказов', icon: Zap },
  { value: '10K+', label: 'Клиентов', icon: Users },
  { value: '1000+', label: 'Игр в каталоге', icon: Star },
];

export function AboutPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Info className="w-8 h-8 text-slate-400" />
            О нас
          </h1>
          <p className="text-slate-400">Узнайте больше о Village Store</p>
        </div>

        {/* Описание */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 mb-8">
          <CardContent className="p-6">
            <p className="text-slate-300 text-lg leading-relaxed mb-4">
              <span className="text-[#d4af37] font-semibold">Village Store</span> — это ваш надёжный партнёр в мире цифровых развлечений. 
              Мы специализируемся на продаже лицензионных игр для PlayStation, пополнении Steam кошельков и цифровых товаров.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Наша миссия — сделать покупку игр максимально простой, безопасной и выгодной. 
              Мы ценим каждого клиента и стремимся предоставить лучший сервис на рынке.
            </p>
          </CardContent>
        </Card>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20"
              >
                <CardContent className="p-4 text-center">
                  <Icon className="w-8 h-8 text-[#d4af37] mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Преимущества */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Наши преимущества</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ADVANTAGES.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 hover:border-[#d4af37]/30 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#cd7f32] flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-black" />
                    </div>
                    <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-400">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Регионы */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Работаем по всему миру</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <p className="mb-4">
              Мы доставляем цифровые товары в любую точку мира. Основные регионы наших клиентов:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Россия', 'Беларусь', 'Казахстан', 'Украина', 'Узбекистан', 'Киргизия', 'Армения'].map((country) => (
                <span 
                  key={country}
                  className="px-3 py-1 bg-[#d4af37]/10 text-[#d4af37] rounded-full text-sm"
                >
                  {country}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
