import { 
  ShoppingCart, 
  Trash2, 
  Plus,
  Minus,
  CreditCard,
  Gamepad2,
  Package,
  Wallet
} from 'lucide-react';
import type { CartItem } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  game: Gamepad2,
  steam: Wallet,
  'steam-game': Gamepad2,
  default: Package
};

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Корзина пуста!');
      return;
    }
    toast.success('Заказ оформлен! Мы свяжемся с вами для подтверждения.');
    clearCart();
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-[#daa520]" />
            Корзина
          </h1>
          <p className="text-slate-400">
            {items.length === 0 
              ? 'Ваша корзина пуста' 
              : `${items.length} ${items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'} в корзине`
            }
          </p>
        </div>

        {items.length === 0 ? (
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-4">В корзине пока ничего нет</p>
              <p className="text-slate-500 text-sm mb-6">Добавьте игры из каталога или услуги Steam</p>
              <Button 
                onClick={() => window.location.href = '/catalog'}
                className="bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black"
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Перейти в каталог
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список товаров */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item: CartItem) => {
                const Icon = ICONS[item.type] || ICONS.default;
                return (
                  <Card 
                    key={item.id}
                    className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Иконка */}
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#d4af37]/20 to-[#cd7f32]/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#d4af37]" />
                        </div>

                        {/* Информация */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">{item.title}</h3>
                          <p className="text-[#d4af37] font-bold">{item.price} ₽</p>
                        </div>

                        {/* Количество */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-600 text-slate-400"
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-slate-600 text-slate-400"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Удалить */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Товар удалён из корзины');
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Очистить корзину */}
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-400 hover:bg-slate-800"
                onClick={() => {
                  clearCart();
                  toast.success('Корзина очищена');
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Очистить корзину
              </Button>
            </div>

            {/* Итого */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Итого</CardTitle>
                  <CardDescription className="text-slate-400">
                    Оформление заказа
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Товары ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                      <span>{total} ₽</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Доставка</span>
                      <span className="text-green-400">Бесплатно</span>
                    </div>
                    <div className="border-t border-slate-700 pt-2">
                      <div className="flex justify-between text-white text-xl font-bold">
                        <span>К оплате</span>
                        <span className="text-[#d4af37]">{total} ₽</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-bold py-6"
                    onClick={handleCheckout}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Оформить заказ
                  </Button>

                  <p className="text-slate-500 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с условиями покупки
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
