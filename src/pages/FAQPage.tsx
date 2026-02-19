import { 
  HelpCircle, 
  MessageCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FAQ_CATEGORIES, DEFAULT_FAQ_CONTENT, type FaqContentByCategory } from '@/content/faq';
import { getContent } from '@/services/api';

export function FAQPage() {
  const [faqContent, setFaqContent] = useState<FaqContentByCategory>(DEFAULT_FAQ_CONTENT);

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const data = await getContent<FaqContentByCategory>('faq');
        if (data && data.content && isMounted) {
          setFaqContent(data.content);
        }
      } catch (error) {
        console.error('Failed to load FAQ content, using defaults', error);
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

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
          {FAQ_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const questions =
              faqContent[category.id] || DEFAULT_FAQ_CONTENT[category.id] || [];
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
                    {questions.map((item, index) => (
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
                href="https://t.me/village_podderzhka" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0088cc]/20 text-[#0088cc] rounded-lg hover:bg-[#0088cc]/30 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Telegram @village_podderzhka
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
