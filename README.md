# Social Focus RPG - Telegram Mini App

A social deep focus RPG / co-op productivity game for Telegram. Users join teams, complete focus sessions together, and work toward shared weekly goals.

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Telegram Bot Token (from @BotFather)

### 1. Clone and Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Database

```bash
# Start PostgreSQL
docker-compose up -d

# Copy environment file
cp backend/.env.example backend/.env

# Run migrations
cd backend
npm run db:generate
npm run db:migrate
```

### 3. Configure Environment

Edit `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/social_pomodoro?schema=public"
TELEGRAM_BOT_TOKEN="your-bot-token-from-botfather"
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Backend: http://localhost:3000  
Frontend: http://localhost:5173

### 5. Test in Telegram

1. Create a bot via @BotFather
2. Set up a Web App button with URL: `https://your-ngrok-url.ngrok.io`
3. Use ngrok to expose frontend: `ngrok http 5173`

## Project Structure

```
social-pomodoro/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment config
│   │   ├── db/           # Prisma client
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   └── app.ts        # Fastify app
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # API client
│   │   ├── pages/        # Page components
│   │   ├── store/        # Zustand store
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Health
- `GET /health` - Server health check
- `GET /health/db` - Database connection check

### Auth
- `POST /auth/telegram` - Authenticate via Telegram initData
- `GET /auth/me` - Get current user profile

### Sessions
- `GET /sessions/active` - Get active focus session
- `POST /sessions/start` - Start new focus session
- `POST /sessions/finish` - Finish focus session

## Database Schema

### Core Models

- **User** - Telegram user profile with XP, level, streak
- **Team** - Guild/team with weekly goals
- **TeamMember** - Team membership with roles
- **FocusSession** - Server-tracked focus sessions
- **TeamProgress** - Weekly team contribution tracking
- **UserProgress** - Daily individual progress

## MVP Features

### ✅ Implemented (Iteration 1)
- Backend bootstrap with Fastify
- Database schema with core entities
- Telegram auth skeleton
- Focus session start/finish with server tracking
- Frontend skeleton with Telegram integration
- Basic session timer UI
- Anti-abuse validation (min duration, max duration)

### 🔄 Next Iterations
- Team creation and join flows
- Invite code/link system
- Weekly boss/goal visualization
- Leaderboards
- Daily quests
- Enhanced anti-cheat
- Team progress visualization

## Anti-Abuse Measures

- Server-side session timing
- Minimum session duration (5 min)
- Maximum session duration (180 min)
- Session must be 80% of planned time
- Cooldown between sessions
- Invalid sessions flagged for review

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state)
- TanStack Query (data fetching)
- Telegram WebApp SDK

### Backend
- Node.js + TypeScript
- Fastify
- Prisma ORM
- PostgreSQL
- Zod validation

## Development Commands

### Backend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## License

MIT
