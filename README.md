# Social Focus RPG - Telegram Mini App

A social productivity app where real focus sessions become XP, team progress, and weekly challenges.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Telegram Bot Token (from @BotFather)

### 1. Start Database

```bash
docker-compose up -d postgres
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your TELEGRAM_BOT_TOKEN
npm run db:generate
npm run db:push
npm run dev
```

Backend runs on http://localhost:3000

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### 4. Docker Compose (All-in-One)

```bash
# Edit docker-compose.yml and add your TELEGRAM_BOT_TOKEN
TELEGRAM_BOT_TOKEN=your_token_here docker-compose up
```

## 📁 Project Structure

```
social-pomodoro/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── lib/          # Utilities (auth, prisma)
│   │   ├── config/       # Env config
│   │   └── types/        # TypeScript types
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── screens/      # Page components
│   │   ├── components/   # Reusable UI
│   │   ├── stores/       # Zustand stores
│   │   ├── lib/          # API client, utils
│   │   └── types/        # TypeScript types
│   └── package.json
└── docker-compose.yml
```

## 🎮 Features (MVP)

- ✅ Telegram Mini App integration
- ✅ User profile with XP, level, streak
- ✅ Focus sessions (15/25/45/60 min)
- ✅ Server-side session validation
- ✅ Create/join teams
- ✅ Weekly team goals
- ✅ Team member leaderboard
- ✅ Premium dark theme UI

## 🔧 API Endpoints

### Auth
- `POST /api/auth/validate` - Validate Telegram initData

### User
- `GET /api/user/me` - Get/create user profile
- `PATCH /api/user/me` - Update user

### Team
- `POST /api/team` - Create team
- `POST /api/team/join` - Join team
- `GET /api/team/my` - Get my team
- `POST /api/team/leave` - Leave team

### Session
- `POST /api/session/start` - Start focus session
- `POST /api/session/finish` - Finish session
- `GET /api/session/active` - Get active session
- `GET /api/session/history` - Session history

### Health
- `GET /health` - Basic health check
- `GET /health/db` - Database health
- `GET /health/ready` - Readiness probe

## 🛡️ Anti-Abuse

- Server-side session start tracking
- Minimum duration validation (80% of target)
- Flagged sessions for review
- No XP for early finishes

## 📊 Database Schema

- **User** - Profile, XP, level, streak
- **Team** - Weekly goals, invite codes
- **TeamMember** - Team membership
- **FocusSession** - Session history
- **WeeklyReset** - Reset tracking
- **DailyQuest** - Quest system (future)

## 🎨 UI Components

Premium dark theme with:
- Gradient accents (indigo/violet)
- Card-based layouts
- Smooth animations
- Progress bars & badges
- Telegram Haptic Feedback

## 🚀 Deployment

1. Build backend: `npm run build`
2. Build frontend: `npm run build`
3. Deploy with Docker Compose
4. Set production env vars

## 📝 Environment Variables

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

## 🔮 Next Steps

- [ ] Leaderboard screen
- [ ] Daily quests
- [ ] Weekly reset cron
- [ ] Push notifications
- [ ] More team features
- [ ] Achievement system

---

**Built with:** Fastify, Prisma, PostgreSQL, React, Tailwind, Telegram Mini Apps
