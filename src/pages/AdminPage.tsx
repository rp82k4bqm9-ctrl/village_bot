import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  Gamepad2,
  Save,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

const INITIAL_GAMES: Game[] = [
  { id: '1', title: 'The Last of Us Part II', price: 3499, originalPrice: 4999, platform: ['PS4', 'PS5'], categories: ['popular', 'exclusive'], description: 'Эпическое приключение в постапокалиптическом мире' },
  { id: '2', title: 'God of War Ragnarök', price: 4499, platform: ['PS4', 'PS5'], categories: ['popular', 'exclusive'], description: 'Продолжение легендарной саги' },
  { id: '3', title: 'Spider-Man 2', price: 4999, platform: ['PS5'], categories: ['popular', 'exclusive'], description: 'Новые приключения Человека-паука' },
  { id: '4', title: 'Horizon Forbidden West', price: 2999, originalPrice: 3999, platform: ['PS4', 'PS5'], categories: ['sale'], description: 'Откройте западные земли' },
];

export function AdminPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    price: 0,
    originalPrice: undefined,
    platform: [],
    categories: [],
    description: '',
    image: ''
  });

  useEffect(() => {
    const savedGames = localStorage.getItem('village_games');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    } else {
      setGames(INITIAL_GAMES);
      localStorage.setItem('village_games', JSON.stringify(INITIAL_GAMES));
    }
  }, []);

  const saveGames = (newGames: Game[]) => {
    setGames(newGames);
    localStorage.setItem('village_games', JSON.stringify(newGames));
  };

  const handleAddGame = () => {
    if (!formData.title || !formData.price) {
      toast.error('Заполните название и цену');
      return;
    }

    const newGame: Game = {
      id: Date.now().toString(),
      title: formData.title,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      platform: formData.platform || [],
      categories: formData.categories || [],
      description: formData.description,
      image: formData.image
    };

    saveGames([...games, newGame]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Игра добавлена!');
  };

  const handleEditGame = () => {
    if (!editingGame || !formData.title || !formData.price) {
      toast.error('Заполните название и цену');
      return;
    }

    const updatedGames = games.map(g => 
      g.id === editingGame.id 
        ? { 
            ...g, 
            title: formData.title!,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
            platform: formData.platform || [],
            categories: formData.categories || [],
            description: formData.description,
            image: formData.image
          }
        : g
    );

    saveGames(updatedGames);
    setEditingGame(null);
    resetForm();
    toast.success('Изменения сохранены!');
  };

  const handleDeleteGame = (id: string) => {
    if (!confirm('Удалить эту игру?')) return;
    saveGames(games.filter(g => g.id !== id));
    toast.success('Игра удалена!');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: 0,
      originalPrice: undefined,
      platform: [],
      categories: [],
      description: '',
      image: ''
    });
  };

  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({ ...game });
  };

  const togglePlatform = (platform: 'PS4' | 'PS5') => {
    const current = formData.platform || [];
    const updated = current.includes(platform)
      ? current.filter(p => p !== platform)
      : [...current, platform];
    setFormData({ ...formData, platform: updated });
  };

  const toggleCategory = (category: string) => {
    const current = formData.categories || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    setFormData({ ...formData, categories: updated });
  };

  // Статистика
  const stats = {
    total: games.length,
    ps5: games.filter(g => g.platform.includes('PS5')).length,
    ps4: games.filter(g => g.platform.includes('PS4')).length,
    popular: games.filter(g => g.categories.includes('popular')).length,
    exclusive: games.filter(g => g.categories.includes('exclusive')).length,
    sale: games.filter(g => g.categories.includes('sale')).length,
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-rose-400" />
            Админ-панель
          </h1>
          <p className="text-slate-400">Управление каталогом игр</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-rose-500/20">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-xs">Всего игр</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.ps5}</div>
              <div className="text-slate-400 text-xs">PS5</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 text-center">
              <Gamepad2 className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.ps4}</div>
              <div className="text-slate-400 text-xs">PS4</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2 text-[#d4af37]">★</div>
              <div className="text-2xl font-bold text-white">{stats.popular}</div>
              <div className="text-slate-400 text-xs">Популярные</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2 text-purple-400">🔥</div>
              <div className="text-2xl font-bold text-white">{stats.exclusive}</div>
              <div className="text-slate-400 text-xs">Эксклюзивы</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="w-6 h-6 mx-auto mb-2 text-red-400">%</div>
              <div className="text-2xl font-bold text-white">{stats.sale}</div>
              <div className="text-slate-400 text-xs">Скидки</div>
            </CardContent>
          </Card>
        </div>

        {/* Кнопка добавления */}
        <div className="mb-6">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить игру
          </Button>
        </div>

        {/* Список игр */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {game.platform.map(p => (
                        <Badge key={p} variant="outline" className="text-xs border-slate-600 text-slate-400">
                          {p}
                        </Badge>
                      ))}
                      {game.categories.map(c => (
                        <Badge key={c} className={`text-xs ${
                          c === 'sale' ? 'bg-red-500' :
                          c === 'exclusive' ? 'bg-purple-500' :
                          c === 'popular' ? 'bg-[#d4af37] text-black' :
                          'bg-slate-600'
                        }`}>
                          {c === 'sale' ? 'Sale' : c === 'exclusive' ? 'Эксклюзив' : c === 'popular' ? '★' : c}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-white font-medium truncate">{game.title}</h3>
                    <p className="text-[#d4af37] font-bold">{game.price} ₽</p>
                    {game.originalPrice && (
                      <p className="text-slate-500 line-through text-sm">{game.originalPrice} ₽</p>
                    )}
                    {game.description && (
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{game.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      onClick={() => openEditDialog(game)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Диалог добавления */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Добавить игру
              </DialogTitle>
            </DialogHeader>
            <GameForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddGame}
              onCancel={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              togglePlatform={togglePlatform}
              toggleCategory={toggleCategory}
            />
          </DialogContent>
        </Dialog>

        {/* Диалог редактирования */}
        <Dialog open={!!editingGame} onOpenChange={() => setEditingGame(null)}>
          <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                Редактировать игру
              </DialogTitle>
            </DialogHeader>
            <GameForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEditGame}
              onCancel={() => {
                setEditingGame(null);
                resetForm();
              }}
              togglePlatform={togglePlatform}
              toggleCategory={toggleCategory}
              isEdit
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Компонент формы игры
interface GameFormProps {
  formData: Partial<Game>;
  setFormData: (data: Partial<Game>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  togglePlatform: (p: 'PS4' | 'PS5') => void;
  toggleCategory: (c: string) => void;
  isEdit?: boolean;
}

function GameForm({ formData, setFormData, onSubmit, onCancel, togglePlatform, toggleCategory, isEdit }: GameFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-slate-300">Название игры *</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Введите название"
          className="bg-[#0d0d0d] border-slate-600 text-white mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Цена (₽) *</Label>
          <Input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            placeholder="3499"
            className="bg-[#0d0d0d] border-slate-600 text-white mt-1"
          />
        </div>
        <div>
          <Label className="text-slate-300">Старая цена (₽)</Label>
          <Input
            type="number"
            value={formData.originalPrice || ''}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="4999"
            className="bg-[#0d0d0d] border-slate-600 text-white mt-1"
          />
        </div>
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Платформа</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={(formData.platform || []).includes('PS4')}
              onCheckedChange={() => togglePlatform('PS4')}
            />
            <span className="text-slate-300">PS4</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              checked={(formData.platform || []).includes('PS5')}
              onCheckedChange={() => togglePlatform('PS5')}
            />
            <span className="text-slate-300">PS5</span>
          </label>
        </div>
      </div>

      <div>
        <Label className="text-slate-300 mb-2 block">Категории</Label>
        <div className="flex flex-wrap gap-4">
          {['popular', 'exclusive', 'sale'].map((cat) => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={(formData.categories || []).includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span className="text-slate-300">
                {cat === 'popular' ? 'Популярное' : cat === 'exclusive' ? 'Эксклюзив' : 'Распродажа'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-slate-300">Описание</Label>
        <Textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Краткое описание игры..."
          className="bg-[#0d0d0d] border-slate-600 text-white mt-1 min-h-[80px]"
        />
      </div>

      <div>
        <Label className="text-slate-300">URL изображения</Label>
        <Input
          value={formData.image || ''}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://..."
          className="bg-[#0d0d0d] border-slate-600 text-white mt-1"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          onClick={onSubmit}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isEdit ? 'Сохранить' : 'Добавить'}
        </Button>
        <Button 
          variant="outline"
          onClick={onCancel}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          <X className="w-4 h-4 mr-2" />
          Отмена
        </Button>
      </div>
    </div>
  );
}
