import { 
  HelpCircle, 
  Truck, 
  CreditCard, 
  RefreshCw, 
  Shield,
  Package,
  MessageCircle
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FAQ_ITEMS = [
  {
    id: 'delivery',
    icon: Truck,
    category: 'Доставка',
    color: 'text-blue-400',
    questions: [
      {
        q: 'Как происходит доставка цифровых игр?',
        a: 'После оплаты вы получаете код активации на email или в Telegram. Для аккаунтов - данные для входа отправляются в течение 15 минут после подтверждения оплаты.'
      },
      {
        q: 'Сколько времени занимает доставка?',
        a: 'Цифровые коды отправляются мгновенно после оплаты. Активация аккаунтов занимает до 30 минут в рабочее время (10:00 - 22:00 МСК).'
      },
      {
        q: 'Можно ли получить игру сразу после оплаты?',
        a: 'Да! Все цифровые коды и ключи отправляются автоматически сразу после подтверждения платежа.'
      }
    ]
  },
  {
    id: 'payment',
    icon: CreditCard,
    category: 'Оплата',
    color: 'text-green-400',
    questions: [
      {
        q: 'Какие способы оплаты доступны?',
        a: 'Мы принимаем банковские карты (Visa, Mastercard, МИР), СБП, электронные кошельки (ЮMoney, WebMoney), криптовалюту и оплату через Telegram.'
      },
      {
        q: 'Безопасна ли оплата на сайте?',
        a: 'Да! Все платежи проходят через защищённые сертифицированные шлюзы. Мы не храним данные ваших карт.'
      },
      {
        q: 'Можно ли оплатить в рассрочку?',
        a: 'Да, для покупок от 3000 ₽ доступна рассрочка через Тинькофф или Сбербанк на 3-6 месяцев.'
      }
    ]
  },
  {
    id: 'return',
    icon: RefreshCw,
    category: 'Возврат и обмен',
    color: 'text-orange-400',
    questions: [
      {
        q: 'Можно ли вернуть цифровой товар?',
        a: 'Цифровые коды и ключи возврату не подлежат после отправки. Исключение - технические неисправности с нашей стороны.'
      },
      {
        q: 'Что делать, если код не работает?',
        a: 'Сразу обратитесь в поддержку с скриншотом ошибки. Мы проверим код и заменим его при необходимости в течение 24 часов.'
      },
      {
        q: 'Можно ли обменять игру на другую?',
        a: 'Обмен возможен только до момента отправки кода. После активации обмен невозможен.'
      }
    ]
  },
  {
    id: 'guarantee',
    icon: Shield,
    category: 'Гарантии',
    color: 'text-purple-400',
    questions: [
      {
        q: 'Какие гарантии вы предоставляете?',
        a: 'Мы гарантируем работоспособность всех кодов и ключей. В случае проблем - бесплатная замена или возврат средств.'
      },
      {
        q: 'Что такое гарантия на аккаунты?',
        a: 'На все аккаунты предоставляется гарантия 30 дней. При блокировке по нашей вине - замена или возврат.'
      },
      {
        q: 'Почему ваши цены ниже чем в официальном магазине?',
        a: 'Мы закупаем ключи оптом у региональных дистрибьюторов и работаем с минимальной наценкой.'
      }
    ]
  },
  {
    id: 'products',
    icon: Package,
    category: 'Товары',
    color: 'text-pink-400',
    questions: [
      {
        q: 'В чем разница между аккаунтом и ключом?',
        a: 'Ключ активируется на вашем аккаунте и игра остаётся у вас навсегда. Аккаунт - это отдельная учетная запись с игрой, требует переключения между аккаунтами.'
      },
      {
        q: 'Работают ли игры в России?',
        a: 'Да! Все наши ключи и аккаунты работают на территории РФ без VPN.'
      },
      {
        q: 'Есть ли русский язык в играх?',
        a: 'В карточке каждой игры указано наличие русского языка (интерфейс/озвучка/субтитры).'
      }
    ]
  },
  {
    id: 'support',
    icon: MessageCircle,
    category: 'Поддержка',
    color: 'text-cyan-400',
    questions: [
      {
        q: 'Как связаться с поддержкой?',
        a: 'Напишите нам в Telegram @village_support или на email support@village.store. Мы отвечаем ежедневно с 10:00 до 22:00.'
      },
      {
        q: 'Сколько времени занимает ответ?',
        a: 'В среднем ответ приходит в течение 15-30 минут в рабочее время. В пиковые часы может занять до 2 часов.'
      },
      {
        q: 'Есть ли поддержка по телефону?',
        a: 'Основная поддержка ведётся через Telegram для оперативности. По сложным вопросам можем созвониться.'
      }
    ]
  }
];

export function FAQPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-[#b8860b]" />
            Частые вопросы
          </h1>
          <p className="text-slate-400">Ответы на популярные вопросы о нашем магазине</p>
        </div>

        {/* FAQ по категориям */}
        <div className="space-y-6">
          {FAQ_ITEMS.map((category) => {
            const Icon = category.icon;
            return (
              <Card 
                key={category.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#b8860b]/20"
              >
                <CardHeader>
                  <CardTitle className={`text-xl flex items-center gap-2 ${category.color}`}>
                    <Icon className="w-5 h-5" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`${category.id}-${index}`}
                        className="border-b border-slate-800 last:border-0"
                      >
                        <AccordionTrigger className="text-white hover:text-[#d4af37] text-left">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-slate-400 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Контактная информация */}
        <Card className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#d4af37]" />
              Не нашли ответ?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <p className="mb-4">Напишите нам напрямую, мы поможем с любым вопросом!</p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://t.me/village_support" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc]/20 text-[#0088cc] rounded-lg hover:bg-[#0088cc]/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Telegram @village_support
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
