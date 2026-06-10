# 🎨 AI Template Studio (Arrena Photo)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.0-1B222D.svg)
![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)

**AI Template Studio** (Arrena Photo) is an enterprise-grade SaaS platform for generating, sharing, and selling AI-generated image templates. It supports multiple upstream AI providers (OpenAI, Midjourney, Stable Diffusion, ComfyUI, Hugging Face) and features a fully functioning template marketplace and an advanced admin dashboard.

---

## 🚀 Key Features

* **Unified AI Generation**: Connect to any AI model (DALL-E 3, SDXL, Midjourney via API, local ComfyUI clusters) using a standardized interface.
* **Template Marketplace**: Creators can publish free or paid templates. Users can discover, rate, and purchase templates.
* **Social Features**: Favorites, collections, creator follows, and community galleries.
* **Premium UI/UX**: Built with Next.js 15, TailwindCSS, and Framer Motion for a "Midjourney-level" dark-theme glassmorphic interface.
* **Enterprise Admin Panel**: Stripe/Vercel-inspired dashboard for managing users, moderating templates, handling marketplace payouts, and analyzing platform metrics.
* **Production-Ready Infra**: Complete Docker Compose setup with PostgreSQL, Redis (for BullMQ generation queues), MinIO (S3 compatible storage), and Prometheus/Grafana monitoring.

---

## 🛠️ Technology Stack

This project is structured as a Monorepo:

### Frontend (`apps/frontend`)
* **Framework**: Next.js 15 (App Router)
* **Styling**: TailwindCSS + Shadcn UI
* **State Management**: Zustand (Auth & Generation stores)
* **Animations**: Framer Motion
* **API Calls**: Axios + React Query

### Backend (`apps/backend-api`)
* **Framework**: NestJS
* **Language**: TypeScript
* **Queues**: BullMQ + Redis (for handling slow AI generation tasks)
* **Storage**: MinIO / AWS S3
* **Auth**: JWT + RBAC (Role-Based Access Control)

### Database (`packages/database`)
* **ORM**: Prisma
* **Database**: PostgreSQL 15

---

## 📂 Project Structure

```bash
Arrena_Photo/
├── apps/
│   ├── frontend/         # Next.js 15 Consumer Web App & Admin Panel
│   ├── backend-api/      # NestJS REST API Server
│   └── worker/           # (Planned) BullMQ AI Generation Worker
├── packages/
│   ├── database/         # Prisma Schema & Migrations
│   ├── shared-types/     # Shared TS interfaces between frontend/backend
│   └── ui-kit/           # Shared React Components
├── scripts/              # Backup & Maintenance Scripts (bash)
├── nginx/                # Production Reverse Proxy Configs
├── prometheus/           # Monitoring Configs
├── docker-compose.yml    # Local Development Environment
└── docker-compose.prod.yml # Production Environment
```

---

## 💻 Local Development

### Prerequisites
* Node.js (v20+)
* Docker & Docker Compose

### 1. Start Infrastructure
Run the database, Redis, and MinIO locally:
```bash
docker-compose up -d
```

### 2. Setup Database
```bash
cd packages/database
npm install
npx prisma generate
npx prisma db push
```

### 3. Start Backend API
```bash
cd apps/backend-api
npm install
npm run dev
```

### 4. Start Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🚢 Production Deployment

The repository is equipped with a `docker-compose.prod.yml` and a GitHub Actions workflow (`.github/workflows/deploy.yml`) for seamless deployment to any VPS (Hetzner, AWS EC2, Contabo, etc.).

1. Clone the repo on your server.
2. Copy `.env.prod.example` to `.env.prod` and populate your secrets (DB passwords, MinIO keys, JWT secrets).
3. Start the stack:
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```
*Note: Nginx handles reverse proxying on ports `80`/`443`. Grafana is exposed on `:3000` internally, while the Next.js app sits behind Nginx.*

---

## 🛡️ License

This project is licensed under the MIT License.
