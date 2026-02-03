// API: тот же домен или VITE_API_URL (если API на Timeweb, а фронт на Vercel)
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string') return envUrl.replace(/\/$/, '');
  return '';
};
const ADMIN_TOKEN = 'village-admin-2024';

export interface Game {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  platform: string[];
  categories: string[];
  description?: string;
  image?: string;
  created_at?: string;
}

// Вспомогательная функция для безопасного преобразования массивов из БД
function parseArrayField(field: unknown): string[] {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return field ? [field] : [];
    }
  }
  return [];
}

// Нормализация данных игры из БД
function normalizeGame(game: unknown): Game {
  if (!game || typeof game !== 'object') {
    throw new Error('Invalid game data');
  }
  const g = game as Record<string, unknown>;
  return {
    id: String(g.id ?? ''),
    title: String(g.title ?? ''),
    price: Number(g.price ?? 0),
    original_price: g.original_price ? Number(g.original_price) : undefined,
    platform: parseArrayField(g.platform),
    categories: parseArrayField(g.categories),
    description: g.description ? String(g.description) : undefined,
    image: g.image ? String(g.image) : undefined,
    created_at: g.created_at ? String(g.created_at) : undefined,
  };
}

export interface ContentBlock<T = any> {
  key: string;
  title?: string | null;
  content: T;
  updated_at?: string;
}

// Получить все игры
export async function getGames(): Promise<Game[]> {
  const response = await fetch(`${getBaseUrl()}/api/games`);
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const err = new Error(data?.error ?? 'Failed to fetch games') as Error & { hint?: string };
    err.hint = data?.hint;
    throw err;
  }
  const games = await response.json();
  return Array.isArray(games) ? games.map(normalizeGame) : [];
}

// Добавить игру (только админ)
export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  const response = await fetch(`${getBaseUrl()}/api/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': ADMIN_TOKEN
    },
    body: JSON.stringify(game)
  });
  if (!response.ok) throw new Error('Failed to add game');
  const data = await response.json();
  return normalizeGame(data);
}

// Обновить игру (только админ)
export async function updateGame(id: string, game: Partial<Game>): Promise<Game> {
  const response = await fetch(`${getBaseUrl()}/api/games/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': ADMIN_TOKEN
    },
    body: JSON.stringify(game)
  });
  if (!response.ok) throw new Error('Failed to update game');
  const data = await response.json();
  return normalizeGame(data);
}

// Удалить игру (только админ)
export async function deleteGame(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/games/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN
    }
  });
  if (!response.ok) throw new Error('Failed to delete game');
}

// Получить текстовый блок (FAQ, о нас и т.п.)
export async function getContent<T = any>(key: string): Promise<ContentBlock<T> | null> {
  const response = await fetch(`${getBaseUrl()}/api/content?key=${encodeURIComponent(key)}`);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) throw new Error('Failed to fetch content');
  return response.json();
}

// Сохранить текстовый блок (только админ)
export async function saveContent<T = any>(
  key: string,
  content: T,
  title?: string
): Promise<ContentBlock<T>> {
  const response = await fetch(`${getBaseUrl()}/api/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ key, content, title }),
  });

  if (!response.ok) throw new Error('Failed to save content');
  return response.json();
}

// Проверка админа (проверяем localStorage + токен)
export function isAdmin(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Проверяем URL параметр
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true') {
    localStorage.setItem('village_admin_mode', 'true');
    return true;
  }
  
  // Проверяем localStorage
  return localStorage.getItem('village_admin_mode') === 'true';
}
