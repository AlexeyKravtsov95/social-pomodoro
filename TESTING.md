# 🧪 Тестирование приложения

## Быстрый тест в браузере

### 1. Запустите сервисы

```bash
# Терминал 1: База данных
docker compose up -d postgres

# Терминал 2: Бэкенд
cd backend
npm run dev

# Терминал 3: Фронтенд
cd frontend
npm run dev
```

### 2. Откройте браузер

Перейдите на **http://localhost:5173**

### 3. Что работает

- ✅ Автоматическое создание пользователя (mock для dev)
- ✅ Запуск фокус-сессий
- ✅ Таймер с прогрессом
- ✅ Просмотр профиля
- ✅ Создание команды
- ✅ Лидерборд (пока пустой)
- ✅ Ежедневные квесты

## Тестирование в Telegram

### 1. Настройте бота

1. Откройте @BotFather в Telegram
2. Создайте нового бота (если нет)
3. Создайте Web App:
   - `/newapp` → выберите бота
   - Укажите URL: `https://your-domain.com` (или используйте ngrok для локального теста)

### 2. Локальный тест через ngrok

```bash
# Установите ngrok
brew install ngrok

# Запустите туннель
ngrok http 5173
```

Получите HTTPS URL и укажите его в:
- `.env` фронтенда: `VITE_API_URL=https://your-ngrok-url.ngrok.io/api`
- BotFather → Edit App → Web App URL

### 3. Запустите в Telegram

1. Откройте своего бота
2. Нажмите кнопку Menu или `/start`
3. Приложение загрузится внутри Telegram

## API Тесты

### Создать пользователя

```bash
curl http://localhost:3000/api/user/me
```

### Начать сессию

```bash
curl -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"duration": "25"}'
```

### Завершить сессию

```bash
curl -X POST http://localhost:3000/api/session/finish \
  -H "Content-Type: application/json" \
  -d '{"sessionId": 1}'
```

### Получить квесты

```bash
curl http://localhost:3000/api/quest/daily
```

### Создать команду

```bash
curl -X POST http://localhost:3000/api/team \
  -H "Content-Type: application/json" \
  -d '{"name": "My Team", "description": "Test team"}'
```

## Проверка cron jobs

Cron jobs работают в фоне:

- **Weekly Reset** — каждый понедельник в 00:00
- **Daily Quest Reset** — ежедневно в 00:00

Для ручного теста можно выполнить в консоли бэкенда:

```typescript
import { setupWeeklyReset } from './src/lib/cron';
const job = setupWeeklyReset(prisma);
job.fire(); // Принудительный запуск
```

## Отладка

### Логи бэкенда

Бэкенд выводит логи в консоль с красивым форматированием (pino-pretty).

### Логи фронтенда

Откройте DevTools в браузере (F12) → Console

### Ошибки Telegram

Если приложение не загружается в Telegram:
1. Проверьте `initData` в консоли
2. Убедитесь, что URL в BotFather совпадает
3. Проверьте токен бота в `.env`

## Мок данные

В development режиме используется mock пользователь:

```json
{
  "id": 123456789,
  "username": "testuser",
  "firstName": "Test",
  "lastName": "User"
}
```

Для изменения отредактируйте `MOCK_INIT_DATA` в `frontend/src/lib/api.ts`
