import { 
  MessageCircle, 
  Clock,
  Send,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CONTACTS = [
  {
    id: 'telegram',
    icon: MessageCircle,
    title: 'Telegram',
    value: '@village_support',
    link: 'https://t.me/village_support',
    color: 'from-[#0088cc] to-[#005885]',
    description: 'Самый быстрый способ связи',
    badge: 'Рекомендуем'
  }
];

const WORKING_HOURS = [
  { day: 'Понедельник - Пятница', hours: '11:00 - 01:00' },
  { day: 'Суббота - Воскресенье', hours: '12:00 - 02:00' },
];

export function SupportPage() {
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-slate-400" />
            Поддержка
          </h1>
          <p className="text-slate-400">Мы всегда на связи и готовы помочь!</p>
        </div>

        {/* Контакты */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {CONTACTS.map((contact) => {
            const Icon = contact.icon;
            return (
              <a 
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="h-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 hover:border-[#d4af37]/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${contact.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-white text-lg">{contact.title}</CardTitle>
                      {contact.badge && (
                        <Badge className="bg-[#d4af37] text-black text-xs">
                          {contact.badge}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-slate-400">
                      {contact.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-[#d4af37] font-medium">{contact.value}</span>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Режим работы */}
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#d4af37]" />
              Режим работы
            </CardTitle>
            <CardDescription className="text-slate-400">
              Время ответа: 15-30 минут в рабочее время
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {WORKING_HOURS.map((item, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0"
                >
                  <span className="text-slate-300">{item.day}</span>
                  <span className="text-[#d4af37] font-medium">{item.hours}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Быстрая помощь */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-green-400" />
                Быстрый заказ
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-400">
              <p className="mb-4">Напишите нам в Telegram с названием игры - мы оформим заказ за вас!</p>
              <Button 
                className="w-full bg-[#0088cc] hover:bg-[#006699] text-white"
                onClick={() => window.open('https://t.me/village_support', '_blank')}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Написать в Telegram
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-400" />
                Проблема с заказом?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-400">
              <p className="mb-4">Если у вас возникла проблема с получением товара - сразу пишите нам!</p>
              <Button 
                variant="outline"
                className="w-full border-orange-400/50 text-orange-400 hover:bg-orange-400/10"
                onClick={() => window.open('https://t.me/village_support', '_blank')}
              >
                Сообщить о проблеме
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
