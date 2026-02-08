// Cloudinary configuration
// Регистрация: https://cloudinary.com/
// Бесплатно: 25GB storage + 25GB bandwidth

export const CLOUDINARY_CONFIG = {
  // Замените на свои данные после регистрации
  CLOUD_NAME: 'your-cloud-name', // из dashboard
  UPLOAD_PRESET: 'games_preset', // создадим в настройках
  API_KEY: 'your-api-key', // из dashboard
  
  // URL для загрузки
  UPLOAD_URL: 'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
};

// Инструкция по настройке:
// 1. Зарегистрируйтесь на https://cloudinary.com/
// 2. В Dashboard скопируйте Cloud Name и API Key
// 3. Перейдите в Settings > Upload > Upload presets
// 4. Создайте preset с названием 'games_preset'
// 5. Установите Signing Mode: Unsigned
// 6. Сохраните и замените данные выше
