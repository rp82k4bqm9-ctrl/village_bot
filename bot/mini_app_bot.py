import os
import logging
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes

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

# Список ID администраторов (Telegram ID)
ADMIN_IDS = [6153426860, 8128537922]  # Добавь сюда свои ID

if not BOT_TOKEN:
    raise ValueError("❌ BOT_TOKEN не установлен! Получи токен у @BotFather")

def is_admin(user_id: int) -> bool:
    """Проверяет, является ли пользователь админом"""
    return user_id in ADMIN_IDS

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет приветствие с кнопкой для открытия мини-приложения"""
    user = update.effective_user
    
    # Проверяем, есть ли параметр debug
    show_debug = context.args and len(context.args) > 0 and context.args[0] == 'debug'
    
    welcome_text = f"""
👋 Привет, {user.first_name}!

🎮 Добро пожаловать в <b>Village Gaming Store</b>!

Нажми кнопку ниже, чтобы открыть магазин игр 👇
    """
    
    # Добавляем отладочную информацию
    if show_debug:
        welcome_text += f"\n\n📱 <code>Твой Telegram ID: {user.id}</code>\n\nОтправь этот ID владельцу магазина, чтобы получить админ-доступ."
    
    # Создаём кнопку для открытия мини-приложения
    keyboard = [
        [InlineKeyboardButton(
            text="🎮 Открыть магазин", 
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    
    # Если пользователь админ, добавляем кнопку админки
    if is_admin(user.id):
        keyboard.append([InlineKeyboardButton(
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
    
    # Отправляем ссылку с админ-доступом
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

async def add_admin_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Добавить нового админа (только для существующих админов)"""
    user = update.effective_user
    
    if not is_admin(user.id):
        await update.message.reply_text("❌ У тебя нет прав для этой команды.")
        return
    
    if not context.args or len(context.args) < 1:
        await update.message.reply_text(
            "Использование: <code>/addadmin [Telegram ID]</code>\n\n"
            "Чтобы узнать ID, попроси пользователя написать боту /start debug",
            parse_mode='HTML'
        )
        return
    
    try:
        new_admin_id = int(context.args[0])
        if new_admin_id in ADMIN_IDS:
            await update.message.reply_text("⚠️ Этот пользователь уже админ.")
            return
        
        ADMIN_IDS.append(new_admin_id)
        await update.message.reply_text(
            f"✅ Админ добавлен!\n\n"
            f"ID: <code>{new_admin_id}</code>\n"
            f"Теперь этот пользователь может использовать /admin",
            parse_mode='HTML'
        )
    except ValueError:
        await update.message.reply_text("❌ Неверный формат ID. Используй только цифры.")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Показывает справку"""
    user = update.effective_user
    is_user_admin = is_admin(user.id)
    
    help_text = f"""
❓ <b>Помощь</b>

<b>Команды:</b>
/start — Открыть магазин
/help — Показать помощь

"""
    
    if is_user_admin:
        help_text += """<b>Команды админа:</b>
/admin — Доступ к админ-панели
/addadmin [ID] — Добавить нового админа

"""
    
    help_text += """
<b>Как пользоваться:</b>
1. Нажми /start
2. Кликни по кнопке "🎮 Открыть магазин"
3. Мини-приложение откроется прямо в Telegram!
"""
    
    await update.message.reply_text(help_text, parse_mode='HTML')

async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработка ошибок"""
    logger.error(f"Update {update} caused error {context.error}")
    
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "❌ Произошла ошибка. Попробуй позже или напиши /start"
        )

def main():
    """Запуск бота"""
    print("[BOT] Starting mini app bot...")
    print(f"[BOT] Web App URL: {WEB_APP_URL}")
    print(f"[BOT] Admin IDs: {ADMIN_IDS}")
    
    # Создаём приложение
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Регистрируем обработчики команд
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("admin", admin_command))
    application.add_handler(CommandHandler("addadmin", add_admin_command))
    
    # Регистрируем обработчик ошибок
    application.add_error_handler(error_handler)
    
    print("[BOT] Bot is running! Press Ctrl+C to stop.")
    
    # Запускаем бота
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    main()
