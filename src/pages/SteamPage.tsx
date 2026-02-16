import { useState } from 'react';
import { 
  CreditCard, 
  Gift,
  Wallet,
  Gamepad2,
  Plus,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart';

const STEAM_TOPUP_AMOUNTS = [
  { id: 'steam-100', amount: 100, bonus: 0 },
  { id: 'steam-300', amount: 300, bonus: 15 },
  { id: 'steam-500', amount: 500, bonus: 35 },
  { id: 'steam-1000', amount: 1000, bonus: 100 },
  { id: 'steam-2000', amount: 2000, bonus: 250 },
  { id: 'steam-5000', amount: 5000, bonus: 750 },
];

const POPULAR_GAMES = [
  { id: 'steam-cs2', title: 'Counter-Strike 2', price: 0, type: 'free' },
  { id: 'steam-dota2', title: 'Dota 2', price: 0, type: 'free' },
  { id: 'steam-pubg', title: 'PUBG: BATTLEGROUNDS', price: 0, type: 'free' },
  { id: 'steam-elden', title: 'Elden Ring', price: 2999, type: 'paid' },
  { id: 'steam-baldurs', title: "Baldur's Gate 3", price: 2499, type: 'paid' },
  { id: 'steam-cyberpunk', title: 'Cyberpunk 2077', price: 1999, type: 'sale', originalPrice: 2999 },
];

export function SteamPage() {
  const [customAmount, setCustomAmount] = useState('');
  const [steamLogin, setSteamLogin] = useState('');
  const { addItem } = useCart();

  const handleTopup = (amount: number) => {
    if (!steamLogin.trim()) {
      toast.error('Введите логин Steam');
      return;
    }
    addItem({
      id: `steam-topup-${amount}`,
      title: `Пополнение Steam ${amount} ₽ (${steamLogin})`,
      price: amount,
      type: 'steam',
    });
    toast.success(`Пополнение Steam на ${amount} ₽ добавлено в корзину!`);
  };

  const handleCustomTopup = () => {
    const amount = parseInt(customAmount);
    if (!amount || amount < 50) {
      toast.error('Минимальная сумма пополнения 50 ₽');
      return;
    }
    if (!steamLogin.trim()) {
      toast.error('Введите логин Steam');
      return;
    }
    handleTopup(amount);
    setCustomAmount('');
  };

  const handleGamePurchase = (game: typeof POPULAR_GAMES[0]) => {
    if (game.type === 'free') {
      toast.info(`${game.title} - бесплатная игра! Можно скачать в Steam.`);
      return;
    }
    addItem({
      id: game.id,
      title: game.title,
      price: game.price,
      type: 'steam-game',
    });
    toast.success(`${game.title} добавлена в корзину!`);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-[#cd7f32]" />
            Steam услуги
          </h1>
          <p className="text-slate-400">Пополнение кошелька и покупка игр</p>
        </div>

        {/* Логин Steam */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Ваш аккаунт Steam</CardTitle>
            <CardDescription className="text-slate-400">
              Укажите логин Steam для пополнения кошелька
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Введите логин Steam..."
                value={steamLogin}
                onChange={(e) => setSteamLogin(e.target.value)}
                className="max-w-sm bg-[#0d0d0d] border-[#cd7f32]/20 text-white placeholder:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Пополнение кошелька */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#cd7f32]" />
            Пополнение кошелька
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {STEAM_TOPUP_AMOUNTS.map((item) => (
              <Card 
                key={item.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20 hover:border-[#cd7f32]/40 cursor-pointer transition-all duration-300"
                onClick={() => handleTopup(item.amount)}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">{item.amount} ₽</div>
                  {item.bonus > 0 && (
                    <Badge className="bg-green-500/20 text-green-400 border-0">
                      +{item.bonus} ₽ бонус
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Произвольная сумма */}
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <span className="text-white font-medium">Другая сумма:</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="number"
                    placeholder="Введите сумму"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full sm:w-48 bg-[#0d0d0d] border-[#cd7f32]/20 text-white"
                  />
                  <Button 
                    onClick={handleCustomTopup}
                    className="bg-gradient-to-r from-[#cd7f32] to-[#b8860b] hover:from-[#a06829] hover:to-[#8b6914] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Популярные игры */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-[#cd7f32]" />
            Популярные игры
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POPULAR_GAMES.map((game) => (
              <Card 
                key={game.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20 hover:border-[#cd7f32]/40 transition-all duration-300"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg">{game.title}</CardTitle>
                    {game.type === 'free' && (
                      <Badge className="bg-green-500/20 text-green-400 border-0">Бесплатно</Badge>
                    )}
                    {game.type === 'sale' && (
                      <Badge className="bg-red-500 text-white">-{Math.round((1 - game.price / (game.originalPrice || game.price)) * 100)}%</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      {game.type === 'paid' || game.type === 'sale' ? (
                        <div className="flex items-center gap-2">
                          {game.originalPrice && (
                            <span className="text-slate-500 line-through text-sm">
                              {game.originalPrice} ₽
                            </span>
                          )}
                          <span className="text-[#cd7f32] text-xl font-bold">
                            {game.price} ₽
                          </span>
                        </div>
                      ) : (
                        <span className="text-green-400 font-medium">Free to Play</span>
                      )}
                    </div>
                    <Button 
                      size="sm"
                      variant={game.type === 'free' ? 'outline' : 'default'}
                      onClick={() => handleGamePurchase(game)}
                      className={game.type !== 'free' ? 'bg-gradient-to-r from-[#cd7f32] to-[#b8860b] hover:from-[#a06829] hover:to-[#8b6914] text-white' : ''}
                    >
                      {game.type === 'free' ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Бесплатно
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Купить
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Информация */}
        <Card className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#cd7f32]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#cd7f32]" />
              Подарки друзьям
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <p>Можно купить игру или пополнить кошелёк друга. Просто укажите его логин Steam при оформлении заказа.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
