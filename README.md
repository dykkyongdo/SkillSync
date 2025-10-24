# 🧠 SkillSync

A flashcard app with AI-powered generation and spaced repetition. Built with Spring Boot + Next.js for learning and studying.

![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AWS](https://img.shields.io/badge/Deployed%20on-AWS-orange)

## What it does

- **AI Flashcard Generation** - Ask AI to create flashcards on any topic
- **Study System** - Spaced repetition with XP and levels
- **Groups** - Study with friends and share flashcard sets
- **Progress Tracking** - See your learning progress and stats
- **Modern UI** - Clean design with dark/light mode

## Tech Stack

**Backend:** Spring Boot, PostgreSQL, JWT auth, OpenAI API
**Frontend:** Next.js, TypeScript, Tailwind CSS, Radix UI
**Deployment:** AWS Elastic Beanstalk + Vercel
**Monitoring:** Sentry for error tracking

## Quick Start

### Backend
```bash
cd backend
cp env.example .env
# Edit .env with your database and API keys
./mvnw spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

## Features

### Core Stuff
- User registration/login with JWT
- Create and manage flashcard sets
- AI generates flashcards using OpenAI
- Study with spaced repetition algorithm
- XP system with levels
- Join/create study groups
- Share flashcard sets with groups

### Technical Stuff
- RESTful APIs with Spring Boot
- PostgreSQL database with JPA
- Real-time error monitoring with Sentry
- Rate limiting and security
- Responsive design
- TypeScript for type safety

## API Endpoints

**Auth:**
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Login
- `POST /api/auth/test-account` - Demo account

**Flashcards:**
- `GET /api/sets` - Your flashcard sets
- `POST /api/sets` - Create new set
- `PUT /api/sets/{id}` - Update set
- `DELETE /api/sets/{id}` - Delete set

**AI Generation:**
- `POST /api/ai/flashcards/generate` - Generate flashcards

**Study:**
- `GET /api/sets/{id}/study/due` - Get cards to study
- `POST /api/sets/{id}/study/review` - Submit study results

**Groups:**
- `GET /api/groups` - Your groups
- `POST /api/groups` - Create group
- `POST /api/groups/{id}/join` - Join group

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skill_sync
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Sentry (optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Deployment

### Backend (AWS Elastic Beanstalk)
1. Build: `./mvnw clean package -DskipTests`
2. Upload `target/backend-0.0.1-SNAPSHOT.jar` to EB
3. Set environment variables in EB console

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Auto-deploys on push

## Testing

**Backend test endpoint:**
```bash
curl http://your-backend-url/api/debug/test-error
```

**Frontend:** Add `<SentryTestButton />` to any page temporarily

## Monitoring

- **Sentry** - Error tracking and performance
- **AWS CloudWatch** - Backend logs
- **Vercel Analytics** - Frontend metrics

## What I Learned

- Full-stack development with Spring Boot + Next.js
- JWT authentication and security
- AI integration with OpenAI API
- Database design and optimization
- Cloud deployment on AWS
- Error monitoring and debugging
- TypeScript and modern React patterns

## Future Ideas

- Mobile app
- More AI features
- Better analytics
- Offline mode
- Social features

---

Built as a learning project to practice full-stack development and modern web technologies.
