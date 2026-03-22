# Social Focus RPG — Telegram Mini App

Социальное приложение для продуктивности, где реальные фокус-сессии превращаются в XP, прогресс команды и недельные испытания.

## 🚀 Быстрый старт

### Требования
- Node.js 20+
- Docker & Docker Compose
- Токен Telegram бота (от @BotFather)

### 1. Запуск базы данных

```bash
docker compose up -d postgres
```

### 2. Настройка бэкенда

```bash
cd backend
npm install
# .env уже настроен с вашим токеном
npm run db:generate
npm run db:push
npm run seed:quests  # Инициализация квестов
npm run dev
```

Бэкенд: http://localhost:3000

### 3. Настройка фронтенда

```bash
cd frontend
npm install
npm run dev
```

Фронтенд: http://localhost:5173

### 4. Docker Compose (всё вместе)

```bash
docker compose up
```

## 📁 Структура проекта

```
social-pomodoro/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── lib/          # Утилиты (auth, prisma, cron)
│   │   ├── config/       # Конфигурация
│   │   └── types/        # TypeScript типы
│   ├── prisma/
│   │   └── schema.prisma # Схема БД
│   ├── scripts/          # Скрипты (seed)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/      # Экраны
│   │   ├── components/   # Компоненты
│   │   ├── stores/       # Zustand stores
│   │   ├── lib/          # API клиент, утилиты
│   │   └── types/        # Типы
│   └── package.json
└── docker-compose.yml
```

## 🎮 Функции (MVP)

- ✅ Telegram Mini App интеграция
- ✅ Профиль с XP, уровнем, стриком
- ✅ Фокус-сессии (15/25/45/60 мин)
- ✅ Серверная валидация сессий
- ✅ Создание/вступление в команды
- ✅ Недельные цели команды
- ✅ Лидерборд (командный + глобальный)
- ✅ Ежедневные квесты
- ✅ Premium dark theme UI
- ✅ Авто-сброс прогресса (cron)

## 🔧 API Endpoints

### Auth
- `POST /api/auth/validate` — Валидация Telegram initData

### User
- `GET /api/user/me` — Получить/создать профиль
- `PATCH /api/user/me` — Обновить профиль

### Team
- `POST /api/team` — Создать команду
- `POST /api/team/join` — Вступить в команду
- `GET /api/team/my` — Моя команда
- `POST /api/team/leave` — Покинуть команду

### Session
- `POST /api/session/start` — Начать сессию
- `POST /api/session/finish` — Завершить сессию
- `GET /api/session/active` — Активная сессия
- `GET /api/session/history` — История

### Leaderboard
- `GET /api/leaderboard/global` — Глобальный топ
- `GET /api/leaderboard/team` — Командный топ

### Quests
- `GET /api/quest/daily` — Ежедневные квесты
- `POST /api/quest/progress` — Обновить прогресс

### Health
- `GET /health` — Проверка здоровья
- `GET /health/db` — Здоровье БД
- `GET /health/ready` — Readiness probe

## 🛡️ Анти-абьюз

- Серверное отслеживание начала сессии
- Проверка минимальной длительности (80%)
- Флагирование подозрительных сессий
- Нет XP за невалидные сессии

## 📊 Схема БД

- **User** — профиль, XP, уровень, стрик
- **Team** — недельные цели, инвайт-коды
- **TeamMember** — участие в команде
- **FocusSession** — история сессий
- **WeeklyReset** — отслеживание сбросов
- **DailyQuest** — система квестов
- **UserQuestProgress** — прогресс квестов

## 🎨 UI Компоненты

Premium dark theme:
- Градиентные акценты (indigo/violet)
- Карточный layout
- Плавные анимации
- Прогресс-бары и бейджи
- Telegram Haptic Feedback

## 🚀 Деплой

1. Собрать бэкенд: `npm run build`
2. Собрать фронтенд: `npm run build`
3. Задеплоить с Docker Compose
4. Установить production переменные

## 📝 Переменные окружения

### Backend
```
PORT=3000
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_WEBAPP_URL=https://your-domain.com
```

### Frontend
```
VITE_API_URL=https://your-api.com/api
```

## 🔮 В разработке

- [ ] Улучшенный onboarding
- [ ] Push-уведомления
- [ ] Больше командных функций
- [ ] Система достижений
- [ ] Кастомизация аватара

---

**Стек:** Fastify, Prisma, PostgreSQL, React, Tailwind, Telegram Mini Apps
