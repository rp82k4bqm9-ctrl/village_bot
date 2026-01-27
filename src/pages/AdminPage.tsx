import { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  Gamepad2,
  Save,
  X,
  BarChart3,
  Download,
  Upload,
  Copy,
  CheckCircle
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

type Platform = 'PS4' | 'PS5' | 'Xbox One' | 'Xbox Series X/S';

interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  platform: Platform[];
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

const PLATFORMS: { id: Platform; label: string; color: string }[] = [
  { id: 'PS4', label: 'PS4', color: 'text-indigo-400' },
  { id: 'PS5', label: 'PS5', color: 'text-blue-400' },
  { id: 'Xbox One', label: 'Xbox One', color: 'text-green-400' },
  { id: 'Xbox Series X/S', label: 'Xbox Series X/S', color: 'text-green-500' },
];

export function AdminPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportData, setExportData] = useState('');
  const [importData, setImportData] = useState('');
  const [copied, setCopied] = useState(false);
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

  const togglePlatform = (platform: Platform) => {
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

  // Экспорт данных
  const handleExport = () => {
    const data = JSON.stringify(games, null, 2);
    setExportData(data);
    setShowExportDialog(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportData);
    setCopied(true);
    toast.success('Скопировано в буфер обмена!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Импорт данных
  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);
      if (!Array.isArray(parsed)) {
        throw new Error('Данные должны быть массивом');
      }
      saveGames(parsed);
      setShowImportDialog(false);
      setImportData('');
      toast.success('Каталог импортирован!');
    } catch (error) {
      toast.error('Ошибка импорта: неверный формат JSON');
    }
  };

  // Статистика
  const stats = {
    total: games.length,
    ps5: games.filter(g => g.platform.includes('PS5')).length,
    ps4: games.filter(g => g.platform.includes('PS4')).length,
    xboxSeries: games.filter(g => g.platform.includes('Xbox Series X/S')).length,
    xboxOne: games.filter(g => g.platform.includes('Xbox One')).length,
    popular: games.filter(g => g.categories.includes('popular')).length,
    exclusive: games.filter(g => g.categories.includes('exclusive')).length,
    sale: games.filter(g => g.categories.includes('sale')).length,
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-7 h-7 lg:w-8 lg:h-8 text-rose-400" />
            Админ-панель
          </h1>
          <p className="text-slate-400 text-sm">Управление каталогом игр</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-rose-500/20">
            <CardContent className="p-3 text-center">
              <BarChart3 className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.total}</div>
              <div className="text-slate-400 text-xs">Всего игр</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-3 text-center">
              <Gamepad2 className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.ps5}</div>
              <div className="text-slate-400 text-xs">PS5</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-3 text-center">
              <Gamepad2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{stats.xboxSeries}</div>
              <div className="text-slate-400 text-xs">Xbox Series</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-3 text-center">
              <div className="w-5 h-5 mx-auto mb-1 text-red-400">%</div>
              <div className="text-xl font-bold text-white">{stats.sale}</div>
              <div className="text-slate-400 text-xs">Скидки</div>
            </CardContent>
          </Card>
        </div>

        {/* Кнопки управления */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить игру
          </Button>
          <Button 
            onClick={handleExport}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Экспорт
          </Button>
          <Button 
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            size="sm"
          >
            <Upload className="w-4 h-4 mr-2" />
            Импорт
          </Button>
        </div>

        {/* Инструкция по переносу */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-500/30 mb-6">
          <CardContent className="p-4">
            <h3 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Как перенести данные на другое устройство?
            </h3>
            <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
              <li>Нажмите <b>"Экспорт"</b> — скопируйте код</li>
              <li>На другом устройстве откройте админ-панель</li>
              <li>Нажмите <b>"Импорт"</b> — вставьте код</li>
              <li>Готово! Все товары перенесены</li>
            </ol>
          </CardContent>
        </Card>

        {/* Список игр */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-3">Список игр ({games.length})</h2>
          {games.length === 0 ? (
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400">Каталог пуст. Добавьте первую игру!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {games.map((game) => (
                <Card 
                  key={game.id}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          {game.platform.map(p => {
                            const platformInfo = PLATFORMS.find(pl => pl.id === p);
                            return (
                              <Badge key={p} variant="outline" className={`text-xs border-slate-600 ${platformInfo?.color || 'text-slate-400'}`}>
                                {p}
                              </Badge>
                            );
                          })}
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
                      <div className="flex gap-1">
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
          )}
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

        {/* Диалог экспорта */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-green-400" />
                Экспорт данных
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Скопируйте этот код и вставьте на другом устройстве через "Импорт"
              </p>
              <Textarea
                value={exportData}
                readOnly
                className="bg-[#0d0d0d] border-slate-600 text-slate-300 font-mono text-xs min-h-[200px]"
              />
              <Button 
                onClick={copyToClipboard}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Скопировано!' : 'Копировать в буфер'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Диалог импорта */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-400" />
                Импорт данных
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                Вставьте код экспорта с другого устройства
              </p>
              <Textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Вставьте JSON данные здесь..."
                className="bg-[#0d0d0d] border-slate-600 text-white font-mono text-xs min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleImport}
                  disabled={!importData.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Импортировать
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowImportDialog(false);
                    setImportData('');
                  }}
                  className="border-slate-600 text-slate-300"
                >
                  Отмена
                </Button>
              </div>
            </div>
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
  togglePlatform: (p: Platform) => void;
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
        <div className="grid grid-cols-2 gap-3">
          {PLATFORMS.map((platform) => (
            <label key={platform.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={(formData.platform || []).includes(platform.id)}
                onCheckedChange={() => togglePlatform(platform.id)}
              />
              <span className={`${platform.color}`}>{platform.label}</span>
            </label>
          ))}
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
