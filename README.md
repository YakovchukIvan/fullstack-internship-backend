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
  <img src="https://img.shields.io/badge/AWS-EC2%20%2B%20RDS%20%2B%20S3-FF9900" />
  <img src="https://img.shields.io/badge/Redis-Upstash-DC382D" />
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
cp .env.sample .env.development # Linux / MacOS / WSL
copy .env.sample .env.development # Windows (PowerShell)

# 4. Fill in the environment variables in `.env.development`:
code .env.development # Open the file in your editor, e.g.:
```

## 🚀 Launching the application

### Development mode

```bash
# 1. Start PostgreSQL and Redis via Docker
npm run docker:dev

# 2. Start the NestJS application
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

Docker is used **only for local infrastructure** (PostgreSQL + Redis). The NestJS application runs directly via Node.js.

### Start local infrastructure (development)

```bash
# Start PostgreSQL + Redis in background
npm run docker:dev

# Stop containers
npm run docker:down

# Stop containers and delete volumes (clears database data)
docker compose down -v
```

> **Note for VS Code Docker extension users:** The "Run All Services" button requires a `.env` file in the project root. Create it by copying your development environment:
>
> ```bash
> cp .env.development .env
> ```

### Services included

| Service      | Port | Description                       |
| ------------ | ---- | --------------------------------- |
| PostgreSQL   | 5432 | Main database                     |
| Redis        | 6379 | Cache and quiz answers            |
| RedisInsight | 5540 | Redis UI at http://localhost:5540 |

## 🗄️ Migrations

### Teams for working with migrations

```bash
# Migration generation
npm run migration:generate src/database/migrations/YourMigrationName

# Applying migrations (development)
npm run migration:run:dev

# Applying migrations (production)
npm run migration:run:prod

# Rollback of the last migration (development)
npm run migration:revert:dev

# Rollback of the last migration (production)
npm run migration:revert:prod

# View all migrations and their status (development)
npm run migration:show:dev

# View all migrations and their status (production)
npm run migration:show:prod
```

## 🌱 Database Seeding

For local development, you can populate the database with fake data using the built-in seeder.

> ⚠️ **Warning:** Running the seed will **truncate all tables** and replace existing data.

```bash
# Seed the database (development)
npm run seed:dev
```

The seeder creates fake data in the following order:

1. **Users** — test accounts with auth records
2. **Companies** — companies with members and roles
3. **Invitations & Join Requests** — pending requests between users and companies
4. **Quizzes** — quizzes assigned to companies
5. **Attempts** — quiz attempts with scores and analytics data

## ☁️ AWS Deployment

### Infrastructure

| Service                       | Provider                  | Purpose              |
| ----------------------------- | ------------------------- | -------------------- |
| EC2 (t3.micro)                | AWS                       | Application server   |
| RDS PostgreSQL (db.t4g.micro) | AWS                       | Production database  |
| S3                            | AWS                       | File storage         |
| Redis                         | Upstash                   | Cache & quiz answers |
| Domain + SSL                  | Namecheap + Let's Encrypt | HTTPS                |

### Prerequisites

- AWS account with EC2, RDS, S3 configured
- Upstash Redis database created
- Domain with A records pointing to EC2 public IP
- SSH key pair (`.pem` file) for EC2 access

### Manual deployment steps

```bash
# 1. Connect to EC2 via SSH
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP

# 2. Install dependencies (first time only)
sudo yum install -y git nodejs nginx
sudo npm install -g pm2

# 3. Clone the repository
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 4. Install project dependencies
npm install

# 5. Create production environment file
nano .env.production
# Fill in all variables from .env.sample with production values

# 6. Build the application
npm run build

# 7. Run database migrations
NODE_ENV=production npm run migration:run:prod

# 8. Start the application with PM2
NODE_ENV=production pm2 start dist/main.js --name backend

# 9. Save PM2 process list (auto-restart on reboot)
pm2 startup
pm2 save
```

### Nginx configuration

```nginx
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL certificate (Let's Encrypt)

```bash
# Install Certbot
sudo yum install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Certificate auto-renews via systemd timer
```

### Updating the application

```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR_EC2_PUBLIC_IP
cd YOUR_REPO

# Pull latest changes
git pull origin main

# Rebuild and restart
npm install
npm run build
NODE_ENV=production npm run migration:run:prod
pm2 restart backend
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
- Docker (local infrastructure only)
- PostgreSQL (AWS RDS in production, Docker locally)
- TypeORM
- Redis (Upstash in production, Docker locally)
- AWS S3
- Swagger
- OAuth2 / JWT
- Nodemailer
