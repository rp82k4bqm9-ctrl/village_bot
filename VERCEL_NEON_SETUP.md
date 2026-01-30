# Vercel + Neon: всё в одном деплое

Фронт и API на **Vercel**, база на **Neon** (Postgres). Никаких точек доступа и whitelist IP — Neon принимает подключения от Vercel из коробки.

---

## 1. База данных (Neon)

1. Зайди на [neon.tech](https://neon.tech), войди (можно через GitHub).
2. **Create a project** — имя и регион на выбор.
3. В проекте скопируй **Connection string** (формат `postgresql://...`).
4. Открой **SQL Editor** в Neon и выполни скрипт из файла **`database-neon.sql`** в корне проекта (создаст таблицы `games` и `content_blocks`).

---

## 2. Переменные на Vercel

1. [vercel.com](https://vercel.com) → твой проект → **Settings** → **Environment Variables**.
2. Добавь:

| Имя            | Значение |
|----------------|----------|
| `DATABASE_URL` | Строка подключения из Neon (postgresql://...) |
| `ADMIN_TOKEN`  | Свой секретный токен для админки |

3. **Save** → **Redeploy** последнего деплоя.

---

## 3. Деплой

Обычный деплой (push в репозиторий или **Deploy** в Vercel). Фронт и API на одном домене, запросы идут на `/api/games`, `/api/content` и т.д. — один источник данных для всех пользователей.

---

## Итог

- **Vercel** — фронт + serverless API.
- **Neon** — Postgres, без настройки точек доступа.
- Админ добавляет товары → все пользователи видят один каталог.
