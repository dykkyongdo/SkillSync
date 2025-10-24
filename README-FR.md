# Plateforme d'Étude SkillSync

[**English**](./README.md) | **Français** | [Démo en Direct](https://skillsync-study.vercel.app/)

![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-blue)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![AWS](https://img.shields.io/badge/Deployé%20sur-AWS-orange)
![Sentry](https://img.shields.io/badge/Monitoring-Sentry-purple)

Consultez la version en direct ici : [Plateforme d'Étude SkillSync](https://skillsync-study.vercel.app/).

## Introduction

SkillSync est une application moderne de flashcards alimentée par l'IA, conçue pour l'apprentissage collaboratif et la répétition espacée. Le projet combine un backend Spring Boot avec un frontend Next.js, offrant une génération de contenu intelligente et un suivi de progression complet. Construit avec un accent sur l'expérience utilisateur et les technologies web modernes.

**Support Multilingue :** Ce projet prend en charge les langues anglaise et française. Une documentation supplémentaire est disponible dans plusieurs langues.

## Fonctionnalités Clés

**Génération Alimentée par l'IA** : Exploitez les modèles GPT d'OpenAI pour générer automatiquement des flashcards sur n'importe quel sujet avec des paires question-réponse intelligentes.

**Système de Répétition Espacée** : Implémentez une planification d'étude intelligente basée sur les métriques de performance, optimisant la rétention à long terme.

**Apprentissage en Groupe** : Créez et rejoignez des groupes d'étude pour des expériences d'apprentissage collaboratif avec des ensembles de flashcards partagés.

**Suivi de Progression** : Système XP complet avec niveaux, séries et analyses détaillées pour gamifier le processus d'apprentissage.

**Interface Moderne** : Design responsive avec support mode sombre/clair, construit avec des composants Radix UI et Tailwind CSS.

**Monitoring en Temps Réel** : Intégration Sentry pour le suivi des erreurs, le monitoring des performances et l'analyse du comportement utilisateur.

**Authentification et Sécurité** : Authentification basée sur JWT avec Spring Security, limitation du débit et validation des entrées.

**Déploiement Cloud** : Déploiement prêt pour la production sur AWS Elastic Beanstalk et Vercel avec CI/CD automatisé.

## Technologies Utilisées

**Backend :**
- Spring Boot 3.3.5
- PostgreSQL avec JPA/Hibernate
- Spring Security avec JWT
- Intégration API OpenAI
- Sentry pour le monitoring

**Frontend :**
- Next.js 15.5.4 avec TypeScript
- Composants Radix UI
- Tailwind CSS pour le style
- React Query pour la gestion d'état
- Sentry pour le monitoring côté client

**Infrastructure :**
- AWS RDS PostgreSQL
- AWS Elastic Beanstalk
- Vercel pour l'hébergement frontend
- Sentry pour le suivi des erreurs

## Démarrage Rapide

Clonez le dépôt et installez les dépendances :

```bash
git clone https://github.com/your-username/SkillSync.git
cd SkillSync
```

### Configuration Backend
```bash
cd backend
cp env.example .env
# Éditez .env avec vos clés de base de données et API
./mvnw spring-boot:run
```

### Configuration Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Éditez .env.local avec l'URL du backend
npm run dev
```

### Construction pour la Production
```bash
# Backend
cd backend
./mvnw clean package -DskipTests

# Frontend
cd frontend
npm run build
```

### Exécution des Tests
```bash
# Tests backend
cd backend
./mvnw test

# Tests frontend
cd frontend
npm test
```

## Documentation API

**Points de Terminaison d'Authentification :**
- `POST /api/auth/register` - Inscription utilisateur
- `POST /api/auth/login` - Connexion utilisateur
- `POST /api/auth/test-account` - Créer un compte de démonstration

**Gestion des Flashcards :**
- `GET /api/sets` - Obtenir les ensembles de flashcards de l'utilisateur
- `POST /api/sets` - Créer un nouvel ensemble de flashcards
- `PUT /api/sets/{id}` - Mettre à jour l'ensemble de flashcards
- `DELETE /api/sets/{id}` - Supprimer l'ensemble de flashcards

**Génération IA :**
- `POST /api/ai/flashcards/generate` - Générer des flashcards en utilisant l'IA

**Système d'Étude :**
- `GET /api/sets/{id}/study/due` - Obtenir les flashcards dues pour révision
- `POST /api/sets/{id}/study/review` - Soumettre les résultats d'étude

**Fonctionnalités de Groupe :**
- `GET /api/groups` - Obtenir les groupes de l'utilisateur
- `POST /api/groups` - Créer un nouveau groupe
- `POST /api/groups/{id}/join` - Rejoindre un groupe

## Variables d'Environnement

### Backend (.env)
```env
# Configuration Base de Données
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skill_sync
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Configuration JWT
JWT_SECRET=your-secret-key

# Configuration OpenAI
OPENAI_API_KEY=your-openai-key

# Configuration Sentry (Optionnel)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-token
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

## Déploiement

### Backend (AWS Elastic Beanstalk)
1. Construction : `./mvnw clean package -DskipTests`
2. Téléchargez `target/backend-0.0.1-SNAPSHOT.jar` vers EB
3. Définissez les variables d'environnement dans la console EB

### Frontend (Vercel)
1. Connectez le dépôt GitHub à Vercel
2. Définissez les variables d'environnement
3. Déploiement automatique lors des push

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une pull request.

---

**Documentation Supplémentaire :**
- [README Principal](./README.md) - Documentation complète en anglais
- [README Frontend](./frontend/README.md) - Guide de configuration et développement frontend
