import { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Filter,
  Search,
  Star,
  Flame,
  Percent,
  Plus,
  PackageX,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import { getGames, type Game } from '@/services/api';

interface CatalogPageProps {
  isAdmin?: boolean;
}

const PLATFORM_FILTERS = [
  { id: 'all', label: 'Все', icon: Filter },
  { id: 'PS5', label: 'PS5', icon: Gamepad2, color: 'text-blue-400' },
  { id: 'PS4', label: 'PS4', icon: Gamepad2, color: 'text-indigo-400' },
  { id: 'Xbox Series X/S', label: 'Xbox Series', icon: Gamepad2, color: 'text-green-500' },
  { id: 'Xbox One', label: 'Xbox One', icon: Gamepad2, color: 'text-green-400' },
  { id: 'popular', label: 'Популярные', icon: Star, color: 'text-yellow-400' },
  { id: 'exclusive', label: 'Эксклюзивы', icon: Flame, color: 'text-purple-400' },
  { id: 'sale', label: 'Распродажа', icon: Percent, color: 'text-red-400' },
];

export function CatalogPage({ isAdmin }: CatalogPageProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  // Загрузка игр с сервера
  const loadGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGames();
      setGames(data);
    } catch (err) {
      console.error('Error loading games:', err);
      setError('Не удалось загрузить каталог. Проверьте подключение к базе данных.');
      toast.error('Ошибка загрузки каталога');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    let filtered = games;

    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(game => {
        if (['PS5', 'PS4', 'Xbox Series X/S', 'Xbox One'].includes(activeFilter)) {
          return game.platform.includes(activeFilter);
        }
        return game.categories.includes(activeFilter);
      });
    }

    setFilteredGames(filtered);
  }, [games, searchQuery, activeFilter]);

  const handleAddToCart = (game: Game) => {
    const isXbox = game.platform.some(p => p.includes('Xbox'));
    addItem({
      id: game.id,
      title: game.title,
      price: game.price,
      type: isXbox ? 'xbox-game' : 'ps-game',
      image: game.image
    });
    toast.success(`${game.title} добавлена в корзину!`);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'PS5': return 'text-blue-400 border-blue-400/50';
      case 'PS4': return 'text-indigo-400 border-indigo-400/50';
      case 'Xbox Series X/S': return 'text-green-500 border-green-500/50';
      case 'Xbox One': return 'text-green-400 border-green-400/50';
      default: return 'text-slate-400 border-slate-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Загрузка каталога...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-red-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <PackageX className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-slate-500 text-sm mb-4">
              Убедитесь, что база данных на Timeweb настроена правильно.
            </p>
            <Button 
              onClick={loadGames}
              className="bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
            <Gamepad2 className="w-7 h-7 text-[#d4af37]" />
            Каталог игр
          </h1>
          <p className="text-slate-400 text-sm">PS4, PS5, Xbox игры по лучшим ценам</p>
        </div>

        {/* Поиск */}
        <div className="mb-4">
          <div className="relative">
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
        <div className="flex flex-wrap gap-2 mb-6">
          {PLATFORM_FILTERS.map((filter) => {
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
                <Icon className={`w-4 h-4 mr-1 ${filter.color || ''}`} />
                {filter.label}
              </Button>
            );
          })}
        </div>

        {/* Пустой каталог */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <PackageX className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-2">
              {games.length === 0 ? 'Каталог пуст' : 'Ничего не найдено'}
            </p>
            <p className="text-slate-500 text-sm mb-4">
              {games.length === 0 && isAdmin
                ? 'Добавьте товары через админ-панель' 
                : 'Попробуйте изменить фильтры'}
            </p>
            {games.length === 0 && isAdmin && (
              <Button 
                onClick={() => window.location.href = '/admin'}
                className="bg-gradient-to-r from-[#d4af37] to-[#cd7f32] text-black"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить товар
              </Button>
            )}
          </div>
        )}

        {/* Сетка игр */}
        {filteredGames.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <Card 
                key={game.id}
                className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-[#d4af37]/20 active:scale-95 transition-all duration-200 overflow-hidden"
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
                    <Gamepad2 className="w-12 h-12 text-slate-600" />
                  )}
                  {/* Бейджи */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {game.categories.includes('sale') && game.original_price && (
                      <Badge className="bg-red-500 text-white text-xs">
                        -{Math.round((1 - game.price / game.original_price) * 100)}%
                      </Badge>
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
                  <div className="flex flex-wrap gap-1 mb-2">
                    {game.platform.map((p) => (
                      <Badge key={p} variant="outline" className={`text-xs ${getPlatformColor(p)}`}>
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="text-white text-base leading-tight">{game.title}</CardTitle>
                  {game.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{game.description}</p>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      {game.original_price && (
                        <span className="text-slate-500 line-through text-sm mr-2">
                          {game.original_price} ₽
                        </span>
                      )}
                      <span className="text-[#d4af37] text-lg font-bold">{game.price} ₽</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black font-semibold text-sm"
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
