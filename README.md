# SkillSync Study Platform

**English** | [Live Demo](https://skillsync-study.vercel.app/)

![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AWS](https://img.shields.io/badge/Deployed%20on-AWS-orange)
![Sentry](https://img.shields.io/badge/Monitoring-Sentry-purple)

Check out the live version here: [SkillSync Study Platform](https://skillsync-study.vercel.app/).

## Introduction

SkillSync is a modern, AI-powered flashcard application designed for collaborative learning and spaced repetition. The project combines Spring Boot backend with Next.js frontend, featuring intelligent content generation and comprehensive progress tracking. Built with a focus on user experience and modern web technologies.

## Key Features

**AI-Powered Generation**: Leverage OpenAI's GPT models to automatically generate flashcards on any topic with intelligent question-answer pairs.

**Spaced Repetition System**: Implement intelligent study scheduling based on performance metrics, optimizing long-term retention.

**Group Learning**: Create and join study groups for collaborative learning experiences with shared flashcard sets.

**Progress Tracking**: Comprehensive XP system with levels, streaks, and detailed analytics to gamify the learning process.

**Modern UI/UX**: Responsive design with dark/light mode support, built with Radix UI components and Tailwind CSS.

**Real-time Monitoring**: Sentry integration for error tracking, performance monitoring, and user behavior analysis.

**Authentication & Security**: JWT-based authentication with Spring Security, rate limiting, and input validation.

**Cloud Deployment**: Production-ready deployment on AWS Elastic Beanstalk and Vercel with automated CI/CD.

## Technologies Used

**Backend:**
- Spring Boot 3.3.5
- PostgreSQL with JPA/Hibernate
- Spring Security with JWT
- OpenAI API Integration
- Sentry for monitoring

**Frontend:**
- Next.js 15.5.4 with TypeScript
- Radix UI components
- Tailwind CSS for styling
- React Query for state management
- Sentry for client-side monitoring

**Infrastructure:**
- AWS RDS PostgreSQL
- AWS Elastic Beanstalk
- Vercel for frontend hosting
- Sentry for error tracking

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone https://github.com/your-username/SkillSync.git
cd SkillSync
```

### Backend Setup
```bash
cd backend
cp env.example .env
# Edit .env with your database and API keys
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev
```

### Build for Production
```bash
# Backend
cd backend
./mvnw clean package -DskipTests

# Frontend
cd frontend
npm run build
```

### Running Tests
```bash
# Backend tests
cd backend
./mvnw test

# Frontend tests
cd frontend
npm test
```

## API Documentation

**Authentication Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/test-account` - Create demo account

**Flashcard Management:**
- `GET /api/sets` - Get user's flashcard sets
- `POST /api/sets` - Create new flashcard set
- `PUT /api/sets/{id}` - Update flashcard set
- `DELETE /api/sets/{id}` - Delete flashcard set

**AI Generation:**
- `POST /api/ai/flashcards/generate` - Generate flashcards using AI

**Study System:**
- `GET /api/sets/{id}/study/due` - Get flashcards due for review
- `POST /api/sets/{id}/study/review` - Submit study results

**Group Features:**
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `POST /api/groups/{id}/join` - Join group

## Environment Variables

### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skill_sync
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-secret-key

# OpenAI Configuration
OPENAI_API_KEY=your-openai-key

# Sentry Configuration (Optional)
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

## Contributing

Contributions are welcome! Feel free to open a pull request.
