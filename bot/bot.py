import os
import logging
import requests
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Load environment variables
load_dotenv()

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration
BOT_TOKEN = os.getenv('BOT_TOKEN')
WEB_APP_URL = os.getenv('WEB_APP_URL', 'https://villagebot1.vercel.app')
API_URL = os.getenv('API_URL', 'https://village-bot-gilt.vercel.app')

# Список ID администраторов (Telegram ID)
ADMIN_IDS = [6153426860, 8128537922]

if not BOT_TOKEN:
    raise ValueError("❌ BOT_TOKEN не установлен! Получи токен у @BotFather")

def is_admin(user_id: int) -> bool:
    """Проверяет, является ли пользователь админом"""
    return user_id in ADMIN_IDS

# ========== API Helper functions ==========
def get_games():
    """Получить список игр из API"""
    try:
        response = requests.get(f"{API_URL}/api/games", timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error fetching games: {e}")
        return []

def get_game(game_id):
    """Получить информацию об игре"""
    try:
        games = get_games()
        for game in games:
            if game['id'] == game_id:
                return game
        return None
    except Exception as e:
        logger.error(f"Error fetching game {game_id}: {e}")
        return None

# ========== Command handlers ==========
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет приветствие с кнопками"""
    user = update.effective_user
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

🎮 Добро пожаловать в <b>Village Gaming Store</b>!

Выбери что хочешь сделать:
    """
    
    # Основные кнопки: Мини-приложение и Каталог
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть магазин (Mini App)", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )],
        [InlineKeyboardButton("📋 Каталог игр", callback_data='catalog')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')],
    ]
    
    # Если пользователь админ, добавляем кнопку админки
    if is_admin(user.id):
        keyboard.insert(1, [InlineKeyboardButton(
            text="⚙️ Админ-панель", 
            web_app=WebAppInfo(url=f"{WEB_APP_URL}/?admin=true")
        )])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        welcome_text, 
        reply_markup=reply_markup, 
        parse_mode='HTML'
    )

async def catalog(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать каталог игр через бота"""
    query = update.callback_query if update.callback_query else None
    
    if query:
        await query.answer()
        message = query.message
    else:
        message = update.message
    
    await message.reply_text("🔄 Загружаю каталог...")
    
    games = get_games()
    
    if not games:
        text = "😔 Каталог пуст или произошла ошибка. Попробуй позже."
        if query:
            await message.edit_text(text)
        else:
            await message.reply_text(text)
        return
    
    # Создаём кнопки для каждой игры
    keyboard = []
    for game in games:
        price = game.get('price', 0)
        title = game.get('title', 'Без названия')[:30]
        keyboard.append([InlineKeyboardButton(f"{title} - {price}₽", callback_data=f"game_{game['id']}")])
    
    keyboard.append([InlineKeyboardButton("🔙 Назад", callback_data='back_to_menu')])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    text = f"🎮 <b>Каталог игр</b> ({len(games)} шт.)\n\nВыбери игру:"
    
    if query:
        await message.edit_text(text, reply_markup=reply_markup, parse_mode='HTML')
    else:
        await message.reply_text(text, reply_markup=reply_markup, parse_mode='HTML')

async def show_game(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать детали игры"""
    query = update.callback_query
    await query.answer()
    
    game_id = int(query.data.replace('game_', ''))
    game = get_game(game_id)
    
    if not game:
        await query.edit_message_text("❌ Игра не найдена")
        return
    
    title = game.get('title', 'Без названия')
    price = game.get('price', 0)
    original_price = game.get('original_price')
    description = game.get('description', 'Описание отсутствует')
    platforms = ', '.join(game.get('platform', [])) if game.get('platform') else 'Не указано'
    categories = ', '.join(game.get('categories', [])) if game.get('categories') else 'Не указано'
    
    price_text = f"<b>{price}₽</b>"
    if original_price and original_price > price:
        discount = int((1 - price/original_price) * 100)
        price_text = f"<s>{original_price}₽</s> <b>{price}₽</b> (скидка {discount}%)"
    
    text = f"""
🎮 <b>{title}</b>

💰 Цена: {price_text}
🖥 Платформы: {platforms}
🏷 Категории: {categories}

📝 Описание:
{description}
    """
    
    keyboard = [
        [InlineKeyboardButton("🛒 Заказать", callback_data=f"order_{game_id}")],
        [InlineKeyboardButton("🔙 Назад к каталогу", callback_data='catalog')],
        [InlineKeyboardButton("🏠 Главное меню", callback_data='back_to_menu')],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text, reply_markup=reply_markup, parse_mode='HTML')

async def order_game(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Оформление заказа"""
    query = update.callback_query
    await query.answer()
    
    game_id = int(query.data.replace('order_', ''))
    game = get_game(game_id)
    
    if not game:
        await query.edit_message_text("❌ Игра не найдена")
        return
    
    title = game.get('title', 'Без названия')
    price = game.get('price', 0)
    
    text = f"""
✅ <b>Заказ оформлен!</b>

🎮 Игра: {title}
💰 Сумма: {price}₽

👨‍💼 Наш менеджер скоро свяжется с тобой для уточнения деталей.

Спасибо за покупку! 🎉
    """
    
    keyboard = [
        [InlineKeyboardButton("🎮 Каталог", callback_data='catalog')],
        [InlineKeyboardButton("🏠 Главное меню", callback_data='back_to_menu')],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(text, reply_markup=reply_markup, parse_mode='HTML')

async def admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Команда для доступа к админ-панели"""
    user = update.effective_user
    
    if not is_admin(user.id):
        await update.message.reply_text(
            "❌ У тебя нет доступа к админ-панели.\n\n"
            f"<code>Твой Telegram ID: {user.id}</code>\n\n"
            "Отправь этот ID владельцу, чтобы получить доступ.",
            parse_mode='HTML'
        )
        return
    
    admin_url = f"{WEB_APP_URL}/?admin=true"
    
    keyboard = [
        [InlineKeyboardButton(
            text="⚙️ Открыть админ-панель", 
            web_app=WebAppInfo(url=admin_url)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"👑 <b>Админ-панель</b>\n\n"
        f"Привет, {user.first_name}!\n"
        f"Твой ID: <code>{user.id}</code>\n\n"
        f"Нажми кнопку ниже для входа в админ-панель:",
        reply_markup=reply_markup,
        parse_mode='HTML'
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать помощь"""
    query = update.callback_query
    if query:
        await query.answer()
    
    text = """
❓ <b>Помощь</b>

<b>Доступные команды:</b>
/start — Главное меню
/catalog — Каталог игр
/admin — Админ-панель (только для админов)
/help — Помощь

<b>Как купить игру:</b>
1. Нажми /start
2. Выбери "🎮 Открыть магазин" для полной версии
   Или "📋 Каталог игр" для быстрого просмотра
3. Выбери игру и нажми "🛒 Заказать"
4. Дождись связи от менеджера

<b>Вопросы?</b>
Пиши: @support
    """
    
    keyboard = [[InlineKeyboardButton("🔙 Назад", callback_data='back_to_menu')]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    if query:
        await query.edit_message_text(text, reply_markup=reply_markup, parse_mode='HTML')
    else:
        await update.message.reply_text(text, reply_markup=reply_markup, parse_mode='HTML')

async def back_to_menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Вернуться в главное меню"""
    query = update.callback_query
    await query.answer()
    
    user = query.from_user
    
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть магазин (Mini App)", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )],
        [InlineKeyboardButton("📋 Каталог игр", callback_data='catalog')],
        [InlineKeyboardButton("❓ Помощь", callback_data='help')],
    ]
    
    if is_admin(user.id):
        keyboard.insert(1, [InlineKeyboardButton(
            text="⚙️ Админ-панель", 
            web_app=WebAppInfo(url=f"{WEB_APP_URL}/?admin=true")
        )])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(
        f"👋 Привет, {user.first_name}!\n\n"
        "🏠 <b>Главное меню</b>\n\n"
        "Выбери действие:",
        reply_markup=reply_markup,
        parse_mode='HTML'
    )

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка ошибок"""
    logger.error(f"Update {update} caused error {context.error}")
    
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "❌ Произошла ошибка. Попробуй позже или напиши /start"
        )

def main():
    """Запуск бота"""
    print("[BOT] Starting Village Gaming Bot...")
    print(f"[BOT] Web App URL: {WEB_APP_URL}")
    print(f"[BOT] API URL: {API_URL}")
    print(f"[BOT] Admin IDs: {ADMIN_IDS}")
    
    # Создаём приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("catalog", catalog))
    application.add_handler(CommandHandler("admin", admin_command))
    application.add_handler(CommandHandler("help", help_command))
    
    # Регистрируем обработчики callback-кнопок
    application.add_handler(CallbackQueryHandler(catalog, pattern='^catalog$'))
    application.add_handler(CallbackQueryHandler(help_command, pattern='^help$'))
    application.add_handler(CallbackQueryHandler(back_to_menu, pattern='^back_to_menu$'))
    application.add_handler(CallbackQueryHandler(show_game, pattern='^game_'))
    application.add_handler(CallbackQueryHandler(order_game, pattern='^order_'))
    
    # Регистрируем обработчик ошибок
    application.add_error_handler(error_handler)
    
    print("[BOT] Bot is running! Press Ctrl+C to stop.")
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
