# Backend Internship Project

<p align="left">
  <img src="https://img.shields.io/badge/NestJS-11-red" />
  <img src="https://img.shields.io/badge/TypeORM-0.3.28-orange" />
  <img src="https://img.shields.io/badge/PostgreSQL-pg%208.17.2-blue" />
  <img src="https://img.shields.io/badge/Swagger-11.2.5-green" />
  <img src="https://img.shields.io/badge/TypeScript-5.7.3-3178C6" />
  <img src="https://img.shields.io/badge/Docker-compose-2496ED" />
  <img src="https://img.shields.io/badge/Auth-JWT-black" />
  <img src="https://img.shields.io/badge/Auth-OAuth2-blueviolet" />
  <img src="https://img.shields.io/badge/Email-Nodemailer-0A66C2" />
</p>

## 📖 Description

Backend application created on NestJS for internships.

## ⚙️ Installation

```bash
# 1. Clone the repository:
git clone https://github.com/YOUR_USERNAME/backend-internship.git

# 2. Install dependencies:
npm install

# 3. Create a `.env` file based on `.env.sample`
cp .env.sample .env # Linux / MacOS / WSL
copy .env.sample .env # Windows (PowerShell)

# 4. Fill in the environment variables in `.env`:
code .env # Open the file in your editor, e.g.:
```

## 🚀 Launching the application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

The application will be available at: `http://localhost:5000`

## 📘 API Documentation (Swagger)

This project uses Swagger for automatic API documentation.
Swagger UI provides an interactive interface for exploring and testing API endpoints.

```bash
# Swagger docs are auto-generated from controllers and DTOs via decorators.
http://localhost:5000/api/docs
```

## 🐳 Docker

### Launching individual services

```bash
# Build and start container in background
docker-compose up -d --build

# Stop container
docker-compose stop

# Restart container
docker-compose restart

# Stop and delete container
docker-compose down

# Stop and delete containers + volumes (deletes database data)
docker-compose down -v
```

## 🗄️ Migrations

### Teams for working with migrations

```bash
# Migration generation
npm run migration:generate src/database/migrations/YourMigrationName

# Applying migrations
npm run migration:run

# Rollback of the last migration
npm run migration:revert

# View all migrations and their status
npm run migration:show
```

## ✅ Code verification

### Format code

```bash
# Automatic formatting of .ts files using Prettier.
npm run format
```

### Lint code

```bash
# Check and automatically fix code style with ESLint.
npm run lint
```

### Testing

```bash
# Runs tests: .spec.ts / .test.ts
npm run test
```

## 🛠️ Technology stack

- NestJS
- TypeScript
- Docker
- PostgreSQL
- TypeORM
- Swagger
- OAuth2 / JWT
- Nodemailer
