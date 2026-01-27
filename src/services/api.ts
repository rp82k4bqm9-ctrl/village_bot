// API сервис для работы с сервером
const API_URL = ''; // Пустой - значит тот же домен (Vercel автоматически роутит /api/*)
const ADMIN_TOKEN = 'village-admin-2024'; // Простой токен для проверки

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

// Получить все игры
export async function getGames(): Promise<Game[]> {
  const response = await fetch(`${API_URL}/api/games`);
  if (!response.ok) throw new Error('Failed to fetch games');
  return response.json();
}

// Добавить игру (только админ)
export async function addGame(game: Omit<Game, 'id'>): Promise<Game> {
  const response = await fetch(`${API_URL}/api/games`, {
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
  const response = await fetch(`${API_URL}/api/games/${id}`, {
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
  const response = await fetch(`${API_URL}/api/games/${id}`, {
    method: 'DELETE',
    headers: {
      'X-Admin-Token': ADMIN_TOKEN
    }
  });
  if (!response.ok) throw new Error('Failed to delete game');
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
