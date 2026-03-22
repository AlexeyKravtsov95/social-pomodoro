# ⚡ Мгновенный деплой для тестирования в Telegram

## Вариант 1: Cloudflare Tunnel (Бесплатно, 10 минут)

### Шаг 1: Установите cloudflared

```bash
# macOS
brew install cloudflared

# Или скачайте с https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### Шаг 2: Запустите туннель для фронтенда

```bash
# Терминал 1: Фронтенд
cd frontend
npm run dev

# Терминал 2: Cloudflare Tunnel для фронтенда
cloudflared tunnel --url http://localhost:5173
```

Запишите HTTPS URL (что-то вроде `https://random-name.trycloudflare.com`)

### Шаг 3: Запустите туннель для бэкенда

```bash
# Терминал 3: Бэкенд
cd backend
npm run dev

# Терминал 4: Cloudflare Tunnel для бэкенда
cloudflared tunnel --url http://localhost:3000
```

Запишите HTTPS URL

### Шаг 4: Настройте Telegram

1. Откройте @BotFather
2. `/mybots` → выберите бота
3. Bot Settings → Web App URL
4. Укажите URL фронтенда: `https://your-frontend.trycloudflare.com`

### Шаг 5: Обновите .env бэкенда

```bash
TELEGRAM_WEBAPP_URL=https://your-frontend.trycloudflare.com
```

Перезапустите бэкенд.

### Шаг 6: Тестируйте!

Откройте бота в Telegram → Menu / Start

---

## Вариант 2: Vercel + Railway (Бесплатно, 15 минут)

### Фронтенд на Vercel

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
cd frontend
vercel --prod
```

Запишите URL (что-то вроде `https://your-app.vercel.app`)

### Бэкенд на Railway

1. Зайдите на https://railway.app
2. New Project → Deploy from GitHub
3. Выберите `backend` папку
4. Добавьте переменные окружения:
   - `PORT=3000`
   - `TELEGRAM_BOT_TOKEN=your_token`
   - `TELEGRAM_WEBAPP_URL=https://your-app.vercel.app`
5. Railway автоматически создаст PostgreSQL

### Обновите frontend/.env

```bash
VITE_API_URL=https://your-backend.railway.app
```

Перезапустите frontend на Vercel.

---

## Вариант 3: Render.com (Бесплатно, 15 минут)

### Бэкенд + БД на Render

1. Зайдите на https://render.com
2. New Web Service → Connect GitHub
3. Root Directory: `backend`
4. Build Command: `npm install && npm run db:push`
5. Start Command: `npm run db:generate && npm run start`
6. Environment Variables:
   - `PORT=3000`
   - `TELEGRAM_BOT_TOKEN=...`
   - `DATABASE_URL` (создайте PostgreSQL на Render)

### Фронтенд на Render Static Site

1. New Static Site → Connect GitHub
2. Root Directory: `frontend`
3. Build Command: `npm install && npm run build`
4. Publish Directory: `dist`
5. Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com`

---

## 🎯 Рекомендация

**Для быстрой отладки:** Cloudflare Tunnel (2 минуты)
**Для постоянного теста:** Vercel + Railway (бесплатно, надёжно)
