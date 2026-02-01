# Деплой на Render

## 1. Создай Web Service

1. Зайди на [render.com](https://render.com)
2. **New +** → **Web Service**
3. Подключи GitHub репозиторий `village_bot`
4. Настройки:
   - **Name:** `village-gaming` (или любое)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node render.js`
   - **Plan:** Free

## 2. Добавь переменные окружения

В разделе **Environment** добавь:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_xzqHp87LMPAtep-blue-moon-abhzsn8s-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `ADMIN_TOKEN` | `village-admin-2024` (или свой) |

## 3. Deploy

Нажми **Create Web Service**

## 4. Проверь

После деплоя открой:
- `https://твой-сервис.onrender.com/api/health` — должно показать `{"status":"ok","db":"connected"}`
- `https://твой-сервис.onrender.com/api/games` — список игр

## ⚠️ Важно: Free план

- Сервер "засыпает" после 15 минут без активности
- Первый запрос после сна занимает ~30 секунд (прогрев)
- Для магазина это нормально

## Альтернатива: Postgres на Render

Можно не использовать Neon, а создать PostgreSQL прямо на Render:
1. **New +** → **PostgreSQL** (Free: 90 дней, потом удаляется)
2. Скопируй Internal Database URL
3. Используй как `DATABASE_URL`

Но Neon надёжнее — он не удаляется.
