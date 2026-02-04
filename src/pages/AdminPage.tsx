import { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  Gamepad2,
  Save,
  X,
  BarChart3,
  RefreshCw,
  AlertCircle,
  Upload,
  ImageIcon
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
import { getGames, addGame, updateGame, deleteGame, saveContent, type Game } from '@/services/api';
import { FAQ_CATEGORIES, DEFAULT_FAQ_CONTENT, type FaqContentByCategory } from '@/content/faq';

type Platform = 'PS4' | 'PS5' | 'Xbox One' | 'Xbox Series X/S';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    title: '',
    price: 0,
    original_price: undefined,
    platform: [],
    categories: [],
    description: '',
    image: ''
  });

  // Управление текстами (FAQ и др.)
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [faqContent, setFaqContent] = useState<FaqContentByCategory>(DEFAULT_FAQ_CONTENT);
  const [isFaqSaving, setIsFaqSaving] = useState(false);

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
      toast.error('Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const openFaqDialog = () => {
    setIsFaqDialogOpen(true);
  };

  const handleFaqQuestionChange = (
    categoryId: string,
    index: number,
    field: 'q' | 'a',
    value: string
  ) => {
    setFaqContent((prev) => {
      const existing = prev[categoryId] || DEFAULT_FAQ_CONTENT[categoryId] || [];
      const updated = existing.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );

      return {
        ...prev,
        [categoryId]: updated,
      };
    });
  };

  const handleSaveFaq = async () => {
    try {
      setIsFaqSaving(true);
      await saveContent<FaqContentByCategory>('faq', faqContent, 'FAQ');
      toast.success('FAQ обновлён');
      setIsFaqDialogOpen(false);
    } catch {
      toast.error('Ошибка сохранения FAQ');
    } finally {
      setIsFaqSaving(false);
    }
  };

  const handleAddGame = async () => {
    if (!formData.title || !formData.price) {
      toast.error('Заполните название и цену');
      return;
    }

    try {
      const newGame = await addGame({
        title: formData.title,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : undefined,
        platform: formData.platform || [],
        categories: formData.categories || [],
        description: formData.description || '',
        image: formData.image || ''
      });
      
      setGames([newGame, ...games]);
      setIsAddDialogOpen(false);
      resetForm();
      toast.success('Игра добавлена!');
    } catch (error) {
      console.error('Add game error:', error);
      toast.error('Ошибка добавления игры: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'));
    }
  };

  const handleEditGame = async () => {
    if (!editingGame || !formData.title || !formData.price) {
      toast.error('Заполните название и цену');
      return;
    }

    try {
      const updated = await updateGame(editingGame.id, {
        title: formData.title,
        price: Number(formData.price),
        original_price: formData.original_price ? Number(formData.original_price) : undefined,
        platform: formData.platform || [],
        categories: formData.categories || [],
        description: formData.description || '',
        image: formData.image || ''
      });
      
      setGames(games.map(g => g.id === editingGame.id ? updated : g));
      setEditingGame(null);
      resetForm();
      toast.success('Изменения сохранены!');
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDeleteGame = async (id: string) => {
    if (!confirm('Удалить эту игру?')) return;
    
    try {
      await deleteGame(id);
      setGames(games.filter(g => g.id !== id));
      toast.success('Игра удалена!');
    } catch {
      toast.error('Ошибка удаления');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: 0,
      original_price: undefined,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#d4af37] flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-red-500/30 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Ошибка подключения</h2>
            <p className="text-slate-400 mb-4">{error}</p>
            <p className="text-slate-500 text-sm mb-4">
              Проверьте файл TIMEWEB_SETUP.md для настройки базы данных на Timeweb.
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
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-7 h-7 lg:w-8 lg:h-8 text-rose-400" />
            Админ-панель
          </h1>
          <p className="text-slate-400 text-sm">Управление каталогом игр (MySQL на Timeweb)</p>
        </div>

        {/* Управление текстами */}
        <div className="mb-6">
          <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#d4af37]" />
                  Тексты приложения
                </h2>
                <p className="text-slate-400 text-sm">
                  Редактирование FAQ и других текстов, которые видят пользователи.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 text-sm"
                  size="sm"
                  onClick={openFaqDialog}
                >
                  FAQ
                </Button>
                {/* Здесь можно добавить другие кнопки для О нас, Поддержка и т.д. */}
              </div>
            </CardContent>
          </Card>
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
            onClick={loadGames}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
        </div>

        {/* Список игр */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-3">Список игр ({games.length})</h2>
          {games.length === 0 ? (
            <Card className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700">
              <CardContent className="p-8 text-center">
                <p className="text-slate-400 mb-4">Каталог пуст. Добавьте первую игру!</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-gradient-to-r from-rose-500 to-rose-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить игру
                </Button>
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
                              c === 'subscription' ? 'bg-cyan-500' :
                              'bg-slate-600'
                            }`}>
                              {c === 'sale' ? 'Sale' : c === 'exclusive' ? 'Эксклюзив' : c === 'popular' ? '★' : c === 'subscription' ? 'Подписка' : c}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-white font-medium truncate">{game.title}</h3>
                        <p className="text-[#d4af37] font-bold">{game.price} ₽</p>
                        {game.original_price && (
                          <p className="text-slate-500 line-through text-sm">{game.original_price} ₽</p>
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

        {/* Диалог редактирования FAQ */}
        <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
          <DialogContent className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-slate-700 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#d4af37]" />
                Редактирование FAQ
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-2">
              {FAQ_CATEGORIES.map((category) => {
                const questions =
                  faqContent[category.id] || DEFAULT_FAQ_CONTENT[category.id] || [];

                return (
                  <Card
                    key={category.id}
                    className="bg-gradient-to-br from-[#111] to-[#050505] border border-slate-800"
                  >
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <category.icon className={`w-4 h-4 ${category.color}`} />
                        <h3 className="text-sm font-semibold text-white">
                          {category.category}
                        </h3>
                      </div>
                      {questions.map((item, index) => (
                        <div
                          key={`${category.id}-${index}`}
                          className="space-y-2 border border-slate-800 rounded-lg p-3"
                        >
                          <div>
                            <Label className="text-slate-300 text-xs">
                              Вопрос #{index + 1}
                            </Label>
                            <Input
                              value={item.q}
                              onChange={(e) =>
                                handleFaqQuestionChange(
                                  category.id,
                                  index,
                                  'q',
                                  e.target.value
                                )
                              }
                              className="bg-[#0d0d0d] border-slate-700 text-sm text-white mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-slate-300 text-xs">
                              Ответ #{index + 1}
                            </Label>
                            <Textarea
                              value={item.a}
                              onChange={(e) =>
                                handleFaqQuestionChange(
                                  category.id,
                                  index,
                                  'a',
                                  e.target.value
                                )
                              }
                              className="bg-[#0d0d0d] border-slate-700 text-sm text-white mt-1 min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveFaq}
                disabled={isFaqSaving}
                className="flex-1 bg-gradient-to-r from-[#d4af37] to-[#cd7f32] hover:from-[#b8941f] hover:to-[#a06829] text-black"
              >
                {isFaqSaving ? 'Сохранение...' : 'Сохранить FAQ'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsFaqDialogOpen(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Отмена
              </Button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Конвертация файла в base64
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Изображение слишком большое (макс 5MB)');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, image: base64 });
        setUploading(false);
        toast.success('Изображение загружено!');
      };
      reader.onerror = () => {
        toast.error('Ошибка чтения файла');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
      setUploading(false);
    }
  };

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
            value={formData.original_price || ''}
            onChange={(e) => setFormData({ ...formData, original_price: e.target.value ? Number(e.target.value) : undefined })}
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
          {[
            { id: 'popular', label: 'Популярное' },
            { id: 'exclusive', label: 'Эксклюзив' },
            { id: 'sale', label: 'Распродажа' },
            { id: 'subscription', label: 'Подписки' },
          ].map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                checked={(formData.categories || []).includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span className="text-slate-300">{cat.label}</span>
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
        <Label className="text-slate-300 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Изображение игры
        </Label>
        
        {/* Скрытый input для выбора файла */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {formData.image ? (
          <div className="mt-2 space-y-2">
            <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-800">
              <img 
                src={formData.image} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setFormData({ ...formData, image: '' })}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-xs text-slate-400">Изображение загружено</p>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 w-full border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            {uploading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? 'Загрузка...' : 'Выбрать изображение'}
          </Button>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Нажмите чтобы выбрать фото из галереи (макс 5MB)
        </p>
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
