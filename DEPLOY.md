# Фронтенд на Vercel
# 1. Залейте проект на GitHub
# 2. Зайдите на vercel.com
# 3. Import Project → выберите репозиторий
# 4. Root Directory: frontend
# 5. Environment Variables:
#    VITE_API_URL=https://your-backend.railway.app
# 6. Deploy

# Бэкенд на Railway
# 1. Зайдите на railway.app
# 2. New Project → Deploy from GitHub
# 3. Root Directory: backend
# 4. Environment Variables:
#    PORT=3000
#    NODE_ENV=production
#    DATABASE_URL=postgresql://... (Railway создаст автоматически)
#    TELEGRAM_BOT_TOKEN=your_token
#    TELEGRAM_WEBAPP_URL=https://your-frontend.vercel.app
# 5. Deploy

# База данных
# Railway автоматически создаст PostgreSQL при деплое бэкенда
