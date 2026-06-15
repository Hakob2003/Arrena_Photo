# 🎨 Arrena Photo (AI Template Studio)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black.svg)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)
![Prisma](https://img.shields.io/badge/Prisma-5.22-1B222D.svg)
![pnpm](https://img.shields.io/badge/pnpm-8.0+-orange.svg)

**Arrena Photo** — это современная SaaS-платформа для генерации, обмена и продажи шаблонов (prompts), сгенерированных нейросетями. Проект поддерживает интеграцию с различными ИИ-моделями (Stable Diffusion, DALL-E 3 и др.) и имеет полнофункциональный маркетплейс шаблонов с единой биллинговой системой.

---

## 🚀 Ключевые возможности

* **Единый генератор**: Единый интерфейс для генерации изображений через популярные модели.
* **Маркетплейс шаблонов**: Создатели могут публиковать и монетизировать свои шаблоны (prompts + настройки). Пользователи могут искать, оценивать и приобретать их.
* **Синхронизация кредитов**: Единый баланс кредитов, хранящийся в базе данных (PostgreSQL), с безопасным транзакционным списанием при каждой генерации. Синхронизируется на всех ваших устройствах (веб/мобильные).
* **Премиум UI/UX**: Интерфейс построен на Next.js 15, TailwindCSS и Framer Motion, предлагая темную тему со стилем "glassmorphism".
* **Панель администратора**: Управление пользователями, шаблонами, модерация контента и аналитика.
* **Production-Ready**: Готово к деплою на **Render** или любой сервер с использованием Docker Compose (PostgreSQL, Redis для очередей BullMQ, MinIO).

---

## 🛠️ Технологический стек (Monorepo)

Проект использует архитектуру Monorepo под управлением **pnpm**.

### Фронтенд (`apps/frontend`)
* **Фреймворк**: Next.js 15 (App Router)
* **Стилизация**: TailwindCSS + Shadcn UI
* **State Management**: Zustand (Auth & Generation stores)
* **Анимации**: Framer Motion
* **API Запросы**: Axios

### Бэкенд (`apps/backend-api`)
* **Фреймворк**: NestJS
* **Язык**: TypeScript
* **Очереди задач**: BullMQ + Redis (для обработки ИИ-генераций)
* **Хранилище файлов**: S3-совместимое (MinIO / AWS S3)
* **Аутентификация**: JWT + RBAC (Ролевая модель)

### База данных (`packages/database`)
* **ORM**: Prisma
* **База Данных**: PostgreSQL

---

## 📂 Структура проекта

```bash
Arrena_Photo
├── apps
│   ├── backend-api
│   │   ├── Dockerfile.prod
│   │   ├── package.json
│   │   ├── src
│   │   └── tsconfig.json
│   ├── frontend
│   │   ├── Dockerfile.prod
│   │   ├── app
│   │   ├── components
│   │   ├── lib
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── public
│   │   ├── store
│   │   ├── tailwind.config.ts
│   │   └── tsconfig.json
│   └── worker
├── docker-compose.prod.yml
├── docker-compose.yml
├── nginx
│   └── nginx.conf
├── package-lock.json
├── package.json
├── packages
│   ├── database
│   │   ├── package.json
│   │   └── prisma
│   ├── shared-types
│   │   └── src
│   └── ui-kit
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── prometheus
│   └── prometheus.yml
├── render.yaml
├── scripts
│   ├── backup-db.sh
│   └── backup-s3.sh
└── vercel.json
```

---

## 💻 Локальная разработка

### Требования
* Node.js (v20+)
* **pnpm** (обязательно, вместо npm)
* Docker & Docker Compose (для локальной базы данных и Redis)

### 1. Установка зависимостей
```bash
pnpm install
```

### 2. Запуск инфраструктуры (БД, Redis)
```bash
docker-compose up -d
```

### 3. Настройка базы данных
```bash
pnpm run db:generate
pnpm run db:push
```

### 4. Запуск всех сервисов (Frontend + Backend)
Из корня проекта выполните команду:
```bash
pnpm run dev
```

* Фронтенд будет доступен по адресу `http://localhost:3000`
* Бэкенд API будет доступен по адресу `http://localhost:10000`

---

## 🚢 Деплой (Render)

Репозиторий уже настроен для деплоя на платформе **Render**.
Корневой файл `render.yaml` и кастомные команды в `package.json` (например, `if [ "$RENDER_SERVICE_NAME" = ... ]`) обеспечивают автоматическую маршрутизацию сборок.

При деплое на Render:
1. **Frontend**: собирается и запускается командой `npm run build / npm start` в папке `apps/frontend`.
2. **Backend**: собирается, автоматически выполняет `pnpm run db:push` и запускает NestJS сервер.

---

## 🛡️ Лицензия

Этот проект лицензирован под MIT License.
