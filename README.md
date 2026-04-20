# Mawar Biru Duo

Appointment and booking management system for Mawar Biru beauty salon. Built with Next.js, Prisma, and MySQL.

## Prerequisites

- Node.js 18+
- Docker & Docker Compose (for MySQL)

## Setup

1. Clone and install dependencies:

```bash
git clone git@github.com:QuantMis/mawarbiruduo.git
cd mawarbiruduo
npm install
```

2. Copy env file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your values. Generate the auth secret with:

```bash
openssl rand -hex 32
```

Generate admin password hash with:

```bash
npx bcryptjs hash 'your-password'
```

3. Start the database:

```bash
docker compose up -d db
```

4. Run migrations and seed:

```bash
npx prisma migrate dev
npx prisma db seed
```

5. Start the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Docker (Full Stack)

To run everything in Docker:

```bash
docker compose up -d
```

This starts both the app (port 3000) and MySQL (port 3306).
