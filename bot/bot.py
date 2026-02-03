import os
import logging
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

def is_admin(user_id) -> bool:
    """Проверяет, является ли пользователь админом"""
    # Приводим к int для надёжности
    try:
        user_id_int = int(user_id)
        return user_id_int in ADMIN_IDS
    except (ValueError, TypeError):
        return False

# ========== Command handlers ==========
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет приветствие с кнопками"""
    user = update.effective_user
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

🎮 Добро пожаловать в <b>Village Gaming Store</b>!

Выбери что хочешь сделать:
    """
    
    # Кнопка мини-приложения
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть магазин", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )],
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

async def id_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать свой Telegram ID"""
    user = update.effective_user
    
    is_user_admin = is_admin(user.id)
    
    text = f"""
🆔 <b>Твой Telegram ID:</b> <code>{user.id}</code>

👤 Имя: {user.first_name}
{'👑 Статус: Администратор' if is_user_admin else '👤 Статус: Пользователь'}

{'✅ У тебя есть доступ к админ-панели!' if is_user_admin else '❌ У тебя нет доступа к админ-панели.\nОтправь этот ID владельцу для получения доступа.'}
    """.strip()
    
    await update.message.reply_text(text, parse_mode='HTML')

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показать помощь"""
    query = update.callback_query
    if query:
        await query.answer()
    
    text = """
❓ <b>Помощь</b>

<b>Доступные команды:</b>
/start — Главное меню

/admin — Админ-панель (только для админов)
/help — Помощь

<b>Как купить игру:</b>
1. Нажми /start
2. Нажми "🎮 Открыть магазин"
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
            text="🎮 Открыть магазин", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )],
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
    application.add_handler(CommandHandler("admin", admin_command))
    application.add_handler(CommandHandler("id", id_command))
    application.add_handler(CommandHandler("help", help_command))
    
    # Регистрируем обработчики callback-кнопок
    application.add_handler(CallbackQueryHandler(help_command, pattern='^help$'))
    application.add_handler(CallbackQueryHandler(back_to_menu, pattern='^back_to_menu$'))
    
    # Регистрируем обработчик ошибок
    application.add_error_handler(error_handler)
    
    print("[BOT] Bot is running! Press Ctrl+C to stop.")
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
