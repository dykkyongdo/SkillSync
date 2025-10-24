# 🧠 SkillSync

A modern, AI-powered flashcard application designed for collaborative learning and spaced repetition. Built with Spring Boot and Next.js, featuring intelligent content generation and comprehensive progress tracking.

![SkillSync Demo](https://img.shields.io/badge/Status-Production%20Ready-green)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange)
![Sentry](https://img.shields.io/badge/Monitoring-Sentry-purple)

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Flashcard Generation** - Generate flashcards using OpenAI's GPT models
- **Spaced Repetition System** - Intelligent study scheduling based on performance
- **Group Learning** - Create and join study groups for collaborative learning
- **Progress Tracking** - XP system with levels and detailed statistics
- **Responsive Design** - Modern UI that works on all devices
- **Dark/Light Mode** - User preference support

### 🔧 Technical Features
- **JWT Authentication** - Secure user authentication and authorization
- **Real-time Error Monitoring** - Sentry integration for production monitoring
- **Performance Tracking** - Comprehensive performance analytics
- **Rate Limiting** - Protection against abuse and spam
- **Input Validation** - Secure data handling and validation
- **Database Optimization** - Efficient queries and indexing

## 🏗️ Architecture

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.3.5
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT
- **API**: RESTful APIs with OpenAPI documentation
- **Monitoring**: Sentry for error tracking and performance
- **Deployment**: AWS Elastic Beanstalk

### Frontend (Next.js)
- **Framework**: Next.js 15.5.4 with TypeScript
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: React Query for server state
- **Authentication**: JWT token management
- **Monitoring**: Sentry for client-side error tracking
- **Deployment**: Vercel

### Infrastructure
- **Database**: AWS RDS PostgreSQL
- **Backend Hosting**: AWS Elastic Beanstalk
- **Frontend Hosting**: Vercel
- **Monitoring**: Sentry
- **AI Service**: OpenAI API

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 13+
- AWS Account (for deployment)
- OpenAI API Key

### Local Development

#### Backend Setup
```bash
cd backend

# Copy environment configuration
cp env.example .env

# Update .env with your configuration
# - Database credentials
# - JWT secret
# - OpenAI API key
# - Sentry DSN (optional)

# Run the application
./mvnw spring-boot:run
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Update .env.local with your configuration
# - NEXT_PUBLIC_API_BASE (backend URL)
# - NEXT_PUBLIC_SENTRY_DSN (optional)

# Run the development server
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skill_sync
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# Sentry Configuration (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token

# Spring Profile
SPRING_PROFILES_ACTIVE=dev
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE=http://localhost:8080

# Sentry Configuration (Optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## 📱 Usage

### Getting Started
1. **Register** a new account or use the demo account
2. **Create** your first flashcard set
3. **Generate** AI-powered flashcards or create them manually
4. **Study** using the spaced repetition system
5. **Join** study groups for collaborative learning
6. **Track** your progress and XP gains

### Key Features

#### AI Flashcard Generation
- Enter a topic or subject
- Choose the number of flashcards (3-10)
- AI generates relevant questions and answers
- Review and edit generated content

#### Study System
- Intelligent scheduling based on performance
- XP rewards for correct answers
- Level progression system
- Detailed progress tracking

#### Group Learning
- Create or join study groups
- Share flashcard sets
- Compete with group members
- Collaborative learning experience

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/test-account` - Create demo account

### Flashcard Endpoints
- `GET /api/sets` - Get user's flashcard sets
- `POST /api/sets` - Create new flashcard set
- `PUT /api/sets/{id}` - Update flashcard set
- `DELETE /api/sets/{id}` - Delete flashcard set

### AI Generation Endpoints
- `POST /api/ai/flashcards/generate` - Generate flashcards using AI
- `POST /api/ai/flashcards/generate/advanced` - Advanced AI generation

### Study Endpoints
- `GET /api/sets/{id}/study/due` - Get flashcards due for review
- `POST /api/sets/{id}/study/review` - Submit study review

### Group Endpoints
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create new group
- `POST /api/groups/{id}/join` - Join group
- `GET /api/groups/{id}/members` - Get group members

## 🚀 Deployment

### Backend (AWS Elastic Beanstalk)
1. Build the JAR file:
   ```bash
   cd backend
   ./mvnw clean package -DskipTests
   ```

2. Upload to Elastic Beanstalk:
   - Go to AWS Elastic Beanstalk Console
   - Select your environment
   - Upload `target/backend-0.0.1-SNAPSHOT.jar`

3. Set environment variables:
   ```
   SENTRY_AUTH_TOKEN=your-sentry-auth-token
   SENTRY_DSN=your-sentry-dsn
   ```

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
   ```
3. Deploy automatically on push to main branch

## 📊 Monitoring

### Sentry Integration
- **Error Tracking**: Real-time error monitoring
- **Performance Monitoring**: API response times and page loads
- **Session Replay**: User behavior analysis
- **Alerts**: Email notifications for critical errors

### Key Metrics
- Error rates and types
- API response times
- User engagement metrics
- Study session performance

## 🔒 Security

### Security Features
- JWT-based authentication
- Password hashing with BCrypt
- CORS configuration
- Rate limiting on authentication endpoints
- Input validation and sanitization
- SQL injection protection via JPA
- XSS protection headers

### Best Practices
- No hardcoded secrets in codebase
- Environment variables for sensitive data
- Regular security updates
- Production-ready logging levels

## 🧪 Testing

### Backend Testing
```bash
cd backend
./mvnw test
```

### Frontend Testing
```bash
cd frontend
npm run test
```

### Sentry Testing
- Backend: `GET /api/debug/test-error`
- Frontend: Use `SentryTestButton` component

## 📈 Performance

### Optimization Features
- Database query optimization
- Efficient caching strategies
- Optimized API responses
- Frontend code splitting
- Image optimization
- CDN integration

### Monitoring
- Real-time performance metrics
- Database query analysis
- API response time tracking
- User experience monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for AI-powered flashcard generation
- Spring Boot team for the excellent framework
- Next.js team for the React framework
- Radix UI for accessible components
- Sentry for monitoring and error tracking
- AWS for cloud infrastructure

## 📞 Support

For support, email support@skillsync.app or join our Discord community.

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Social features and leaderboards
- [ ] Offline study mode
- [ ] Integration with learning management systems
- [ ] Advanced AI features (image recognition, voice)

### Version History
- **v1.0.0** - Initial release with core features
- **v1.1.0** - AI-powered flashcard generation
- **v1.2.0** - Group learning and collaboration
- **v1.3.0** - Advanced progress tracking and analytics

---

**Built with ❤️ for learners everywhere**
