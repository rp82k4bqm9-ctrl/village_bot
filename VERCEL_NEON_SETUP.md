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

## Если каталог не открывается: «Ошибка подключения к базе данных»

Сделай по шагам:

1. **DATABASE_URL на Vercel**  
   Должна быть строка **из Neon** в формате **`postgresql://...`**, не `mysql://`.  
   Vercel → проект → **Settings** → **Environment Variables** → проверь `DATABASE_URL` — скопируй заново из Neon (Dashboard → Connection string).

2. **Таблицы в Neon**  
   В Neon открой **SQL Editor**, вставь и выполни весь скрипт из файла **`database-neon.sql`** (таблицы `games` и `content_blocks`). Без них API падает с ошибкой.

3. **Переменные для Production**  
   На Vercel у переменных есть выбор окружения (Production / Preview / Development). Поставь галочку **Production**, сохрани, затем **Redeploy** (Deployments → … → Redeploy).

4. **После изменений — Redeploy**  
   Любое изменение переменных требует нового деплоя (Redeploy), иначе старые значения остаются.

---

## Предупреждение «Failed to fetch one or more git submodules»

Если при деплое на Vercel видишь это предупреждение — на работу приложения оно обычно не влияет. Можно игнорировать или в настройках проекта на Vercel проверить, что не указана установка submodules. Если в репозитории нет папок‑подмодулей, предупреждение можно не исправлять.

---

## Итог

- **Vercel** — фронт + serverless API.
- **Neon** — Postgres, без настройки точек доступа.
- **DATABASE_URL** — только `postgresql://...` из Neon; таблицы созданы через `database-neon.sql`.
- Админ добавляет товары → все пользователи видят один каталог.
