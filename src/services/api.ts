// API — запросы на тот же домен: один бэкенд для всех пользователей
const API_URL = typeof window !== 'undefined' ? '' : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';
const getBaseUrl = () => (typeof window !== 'undefined' ? '' : API_URL) || '';
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

export interface ContentBlock<T = any> {
  key: string;
  title?: string | null;
  content: T;
  updated_at?: string;
}

// Получить все игры
export async function getGames(): Promise<Game[]> {
  const response = await fetch(`${getBaseUrl()}/api/games`);
  if (!response.ok) throw new Error('Failed to fetch games');
  return response.json();
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
  return response.json();
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
  return response.json();
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
