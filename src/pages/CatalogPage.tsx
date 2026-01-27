import { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Filter,
  Search,
  Star,
  Flame,
  Percent,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';

interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  platform: ('PS4' | 'PS5')[];
  categories: string[];
  description?: string;
  image?: string;
}

const SAMPLE_GAMES: Game[] = [
  { id: '1', title: 'The Last of Us Part II', price: 3499, originalPrice: 4999, platform: ['PS4', 'PS5'], categories: ['popular', 'exclusive'], description: 'Эпическое приключение в постапокалиптическом мире' },
  { id: '2', title: 'God of War Ragnarök', price: 4499, platform: ['PS4', 'PS5'], categories: ['popular', 'exclusive'], description: 'Продолжение легендарной саги' },
  { id: '3', title: 'Spider-Man 2', price: 4999, platform: ['PS5'], categories: ['popular', 'exclusive'], description: 'Новые приключения Человека-паука' },
  { id: '4', title: 'Horizon Forbidden West', price: 2999, originalPrice: 3999, platform: ['PS4', 'PS5'], categories: ['sale'], description: 'Откройте западные земли' },
  { id: '5', title: 'Ghost of Tsushima', price: 2499, originalPrice: 3499, platform: ['PS4', 'PS5'], categories: ['sale', 'popular'], description: 'Станьте самураем на острове Цусима' },
  { id: '6', title: 'Demon\'s Souls', price: 3999, platform: ['PS5'], categories: ['exclusive'], description: 'Ремейк культовой RPG' },
  { id: '7', title: 'Ratchet & Clank', price: 2799, originalPrice: 3999, platform: ['PS5'], categories: ['sale'], description: 'Межпространственные приключения' },
  { id: '8', title: 'Returnal', price: 2299, originalPrice: 4499, platform: ['PS5'], categories: ['sale'], description: 'Рогалик от третьего лица' },
];

export function CatalogPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { addItem } = useCart() as { addItem: (item: { id: string; title: string; price: number; type: string; image?: string }) => void };

  useEffect(() => {
    // Загружаем игры из localStorage или используем примеры
    const savedGames = localStorage.getItem('village_games');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    } else {
      setGames(SAMPLE_GAMES);
      localStorage.setItem('village_games', JSON.stringify(SAMPLE_GAMES));
    }
  }, []);

  useEffect(() => {
    let filtered = games;

    // Фильтр по поиску
    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Фильтр по категории
    if (activeFilter !== 'all') {
      filtered = filtered.filter(game => {
        if (activeFilter === 'ps5') return game.platform.includes('PS5');
        if (activeFilter === 'ps4') return game.platform.includes('PS4');
        return game.categories.includes(activeFilter);
      });
    }

    setFilteredGames(filtered);
  }, [games, searchQuery, activeFilter]);

  const handleAddToCart = (game: Game) => {
    addItem({
      id: game.id,
      title: game.title,
      price: game.price,
      type: 'game',
      image: game.image
    });
    toast.success(`${game.title} добавлена в корзину!`);
  };

  const filters = [
    { id: 'all', label: 'Все', icon: Filter },
    { id: 'ps5', label: 'PS5', icon: Gamepad2 },
    { id: 'ps4', label: 'PS4', icon: Gamepad2 },
    { id: 'popular', label: 'Популярные', icon: Star },
    { id: 'exclusive', label: 'Эксклюзивы', icon: Flame },
    { id: 'sale', label: 'Распродажа', icon: Percent },
  ];

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-[#d4af37]" />
            Каталог игр
          </h1>
          <p className="text-slate-400">PS4 и PS5 игры по лучшим ценам</p>
        </div>

        {/* Поиск */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Поиск игр..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#1a1a1a] border-[#d4af37]/20 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-2 mb-8">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.id)}
                className={activeFilter === filter.id 
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black'
                  : 'border-[#d4af37]/30 text-white hover:bg-[#d4af37]/10'
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Сетка игр */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Игры не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <Card 
                key={game.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-all duration-300 overflow-hidden group"
              >
                {/* Изображение */}
                <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  {game.image ? (
                    <img 
                      src={game.image} 
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Gamepad2 className="w-16 h-16 text-slate-600" />
                  )}
                  {/* Бейджи */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {game.categories.includes('sale') && (
                      <Badge className="bg-red-500 text-white text-xs">-{Math.round((1 - game.price / (game.originalPrice || game.price)) * 100)}%</Badge>
                    )}
                    {game.categories.includes('exclusive') && (
                      <Badge className="bg-purple-500 text-white text-xs">Эксклюзив</Badge>
                    )}
                    {game.categories.includes('popular') && (
                      <Badge className="bg-[#d4af37] text-black text-xs">★ Популярное</Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex gap-1 mb-2">
                    {game.platform.map((p) => (
                      <Badge key={p} variant="outline" className="text-xs border-slate-600 text-slate-400">
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-white text-lg leading-tight">{game.title}</CardTitle>
                  {game.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{game.description}</p>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {game.originalPrice && (
                        <span className="text-slate-500 line-through text-sm mr-2">
                          {game.originalPrice} ₽
                        </span>
                      )}
                      <span className="text-[#d4af37] text-xl font-bold">{game.price} ₽</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-semibold"
                    onClick={() => handleAddToCart(game)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    В корзину
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
