import { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus,
  Minus,
  CreditCard,
  Gamepad2,
  Package,
  Wallet,
  User,
  Phone,
  Mail,
  MessageSquare,
  Send,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import type { CartItem } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  game: Gamepad2,
  steam: Wallet,
  'steam-game': Gamepad2,
  default: Package
};

// Отправка заказа в Telegram
async function sendOrderToTelegram(orderData: {
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    email?: string;
    comment?: string;
  };
}) {
  const BOT_TOKEN = '8534730006:AAGIMjk0a459q_zMzV3kLMxJyvkwHTlsrcI';
  const CHAT_ID = '6153426860';
  
  const itemsList = orderData.items.map(item => 
    `• ${item.title} — ${item.price} ₽ x${item.quantity} = ${item.price * item.quantity} ₽`
  ).join('\n');
  
  const message = `
🛒 <b>НОВЫЙ ЗАКАЗ!</b>

👤 <b>Клиент:</b> ${orderData.customer.name}
📱 <b>Телефон:</b> ${orderData.customer.phone}
${orderData.customer.email ? `📧 <b>Email:</b> ${orderData.customer.email}` : ''}

📦 <b>Товары:</b>
${itemsList}

💰 <b>Итого:</b> ${orderData.total} ₽
${orderData.customer.comment ? `\n💬 <b>Комментарий:</b> ${orderData.customer.comment}` : ''}
  `.trim();
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}

export function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, total } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comment: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Введите телефон';
    } else if (!/^\+?[\d\s()-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный номер';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast.error('Проверьте данные в форме');
      return;
    }
    
    setIsSubmitting(true);
    
    const success = await sendOrderToTelegram({
      items,
      total,
      customer: formData
    });
    
    if (success) {
      setOrderComplete(true);
      clearCart();
      toast.success('Заказ успешно отправлен!');
    } else {
      toast.error('Ошибка отправки. Попробуйте позже.');
    }
    
    setIsSubmitting(false);
  };

  // Успешное оформление заказа
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Заказ оформлен!</h2>
            <p className="text-slate-400 mb-6">
              Спасибо за покупку! Мы свяжемся с вами в ближайшее время для подтверждения заказа.
            </p>
            <Button 
              onClick={() => {
                setOrderComplete(false);
                setShowCheckout(false);
                window.location.href = '/';
              }}
              className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться в магазин
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Форма оформления заказа
  if (showCheckout) {
    return (
      <div className="min-h-screen bg-black p-4 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Заголовок */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              className="text-slate-400 mb-4 -ml-4"
              onClick={() => setShowCheckout(false)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к корзине
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Send className="w-7 h-7 text-[#d4af37]" />
              Оформление заказа
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Форма */}
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Контактные данные</CardTitle>
                <CardDescription className="text-slate-400">
                  Введите данные для связи с вами
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Имя */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-[#d4af37]" />
                    Имя <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Введите ваше имя"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`bg-[#0d0d0d] border-slate-700 text-white placeholder:text-slate-600 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                </div>

                {/* Телефон */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#d4af37]" />
                    Телефон <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (999) 999-99-99"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`bg-[#0d0d0d] border-slate-700 text-white placeholder:text-slate-600 ${
                      errors.phone ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.phone && <p className="text-red-400 text-sm">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#d4af37]" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@mail.com (необязательно)"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`bg-[#0d0d0d] border-slate-700 text-white placeholder:text-slate-600 ${
                      errors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                </div>

                {/* Комментарий */}
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-white flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#d4af37]" />
                    Комментарий
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Дополнительная информация к заказу..."
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="bg-[#0d0d0d] border-slate-700 text-white placeholder:text-slate-600 min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Итого */}
            <div>
              <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-white">Ваш заказ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Список товаров */}
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-300">{item.title} x{item.quantity}</span>
                        <span className="text-[#d4af37]">{item.price * item.quantity} ₽</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <div className="flex justify-between text-slate-400 mb-2">
                      <span>Товары ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
                      <span>{total} ₽</span>
                    </div>
                    <div className="flex justify-between text-white text-xl font-bold">
                      <span>К оплате</span>
                      <span className="text-[#d4af37]">{total} ₽</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-bold py-6"
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Отправка...
                      </span>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Отправить заказ
                      </>
                    )}
                  </Button>

                  <p className="text-slate-500 text-xs text-center">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Обычная корзина
  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-[#daa520]" />
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
              <p className="text-slate-500 text-sm mb-6">Добавьте игры из каталога</p>
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
                    onClick={() => setShowCheckout(true)}
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
