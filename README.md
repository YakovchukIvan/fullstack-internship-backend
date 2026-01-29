# Backend Internship Project

## Description

Backend application created on NestJS for internships.

## Installation

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

## Launching the application

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

## Docker

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

## Migrations

### Teams for working with migrations

```bash
# Migration generation
npm run migration:generate src/database/migrations/YourMigrationName

# Creating an empty migration
npm run migration:create src/database/migrations/YourMigrationName

# Applying migrations
npm run migration:run

# Rollback of the last migration
npm run migration:revert

# View all migrations and their status
npm run migration:show
```

## Code verification

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

## Technology stack

- NestJS
- TypeScript
- Docker
- PostgreSQL
- TypeORM
