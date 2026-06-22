# Arrena Photo — AI Template Studio

> **Полная техническая документация проекта**
> Последнее обновление: 2026-06-22

---

## 📋 Обзор проекта

**Arrena Photo** — это SaaS-платформа для генерации изображений с помощью AI.
Пользователь загружает фото, выбирает шаблон и AI-модель, запускает генерацию и получает результат.
Платформа включает маркетплейс шаблонов, систему подписок и биллинга, админ-панель и интеграции с облачными хранилищами.

**Репозиторий:** [github.com/Hakob2003/Arrena_Photo](https://github.com/Hakob2003/Arrena_Photo)
**Продакшен:** [arrena-photo-frontend-o4xg.onrender.com](https://arrena-photo-frontend-o4xg.onrender.com)
**API:** [arrena-photo-backend.onrender.com/v1](https://arrena-photo-backend.onrender.com/v1)
**Swagger:** [arrena-photo-backend.onrender.com/api/docs](https://arrena-photo-backend.onrender.com/api/docs)

---

## 🏗️ Архитектура

### Тип: Monorepo (pnpm workspaces)

```
Arrena_Photo/
├── apps/
│   ├── frontend/          # Next.js 15 (клиент)
│   ├── backend-api/       # NestJS (REST API)
│   └── worker/            # Воркер для очередей (зарезервирован)
├── packages/
│   ├── database/          # Prisma Schema + миграции
│   ├── shared-types/      # Общие TypeScript-типы
│   └── ui-kit/            # Общие UI-компоненты (зарезервирован)
├── scripts/               # Билд-скрипты для деплоя
├── nginx/                 # Конфигурация Nginx (для Docker)
├── prometheus/            # Конфигурация мониторинга
├── docker-compose.yml     # Локальная разработка
├── docker-compose.prod.yml # Production Docker стек
├── render.yaml            # Конфигурация Render.com
└── pnpm-workspace.yaml    # Определение воркспейсов
```

### Принципы архитектуры:
- **Модульность:** Каждый домен (auth, billing, templates и т.д.) — отдельный NestJS-модуль
- **RBAC:** Ролевая модель доступа (ADMIN, MODERATOR, CREATOR, USER)
- **API Versioning:** URI-префикс `/v1/`
- **Очереди:** BullMQ + Redis для фоновых задач (генерация изображений)
- **Мультитенантность:** Поддержка множества пользователей с изолированными данными

---

## 🛠️ Технологический стек

### Frontend (`apps/frontend/`)

| Технология | Версия | Назначение |
|---|---|---|
| **Next.js** | 15.0.0 | React-фреймворк с SSR/SSG |
| **React** | 18.3.x | UI-библиотека |
| **TypeScript** | 5.3.x | Типизация |
| **TailwindCSS** | 3.4.x | Утилитарный CSS |
| **Shadcn UI** | — | Компоненты (Dialog, Select, Table, Button и т.д.) |
| **Framer Motion** | 10.18.x | Анимации и переходы |
| **Zustand** | 4.5.x | Стейт-менеджмент (с persist) |
| **Axios** | 1.6.x | HTTP-клиент |
| **React Hook Form** | 7.79.x | Формы |
| **Zod** | 4.4.x | Валидация |
| **Recharts** | 2.12.x | Графики и диаграммы |
| **React Hot Toast** | 2.4.x | Уведомления (тосты) |
| **Lucide React** | 1.18.x | Иконки |
| **date-fns** | 4.4.x | Работа с датами |
| **Socket.IO Client** | 4.7.x | WebSocket (для реалтайма) |

### Backend (`apps/backend-api/`)

| Технология | Версия | Назначение |
|---|---|---|
| **NestJS** | 10.x | Node.js фреймворк |
| **Prisma** | 5.22.x | ORM для PostgreSQL |
| **PostgreSQL** | 15 | Основная СУБД |
| **Redis** | 7 | Кэш + очереди BullMQ |
| **BullMQ** | 5.78.x | Очереди задач |
| **Passport.js** | 0.7.x | Аутентификация (JWT, OAuth) |
| **JWT** | — | Токены доступа |
| **Helmet** | 7.1.x | HTTP-безопасность |
| **Swagger** | 7.3.x | API-документация |
| **Throttler** | 5.1.x | Rate limiting (100 req/min) |
| **Nodemailer** | 8.0.x | Email |
| **AWS SDK S3** | 3.x | Объектное хранилище |
| **googleapis** | 173.x | Google Drive API |

### Инфраструктура

| Компонент | Платформа | Назначение |
|---|---|---|
| **Frontend** | Render.com (Web Service) | Next.js хостинг |
| **Backend** | Render.com (Web Service) | NestJS API хостинг |
| **БД** | Render.com (Managed PostgreSQL) | Основная база данных |
| **Redis** | Render.com (Managed Redis) | Кэш и BullMQ |
| **Git** | GitHub | Контроль версий |
| **CI/CD** | Render auto-deploy | Автодеплой с main |

---

## 🗄️ База данных (Prisma Schema)

### Enums

| Enum | Значения |
|---|---|
| `RoleName` | `ADMIN`, `MODERATOR`, `CREATOR`, `USER` |
| `UserStatus` | `ACTIVE`, `BANNED` |
| `GenerationStatus` | `PENDING`, `PROCESSING`, `DONE`, `FAILED`, `CANCELLED` |
| `SubscriptionPlan` | `FREE`, `PRO`, `ENTERPRISE` |
| `TemplateStatus` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `PayoutStatus` | `PENDING`, `PROCESSING`, `COMPLETED`, `REJECTED` |

### Модели (27 таблиц)

#### Core & RBAC
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **User** | Пользователь | email, credits (1500 по умолч.), status, role, preferences, notifications settings |
| **Role** | Роль (RBAC) | name (RoleName), permissions (JSON) |
| **Session** | Сессия | token, expiresAt, ipAddress, userAgent, country, device |
| **OAuthAccount** | OAuth аккаунт | provider ("google"/"vk"/"facebook"), providerAccountId |
| **VerificationToken** | Токен подтверждения email | identifier, token, expires |

#### Templates
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **Template** | Шаблон | name, description, coverUrl, galleryUrls, recommendedModels, status, price, avgRating |
| **TemplateCategory** | Категория | name, slug |
| **TemplateTag** | Тег | name (many-to-many с Template) |
| **TemplateVersion** | Версия шаблона | versionNumber, prompt, negativePrompt, settings (JSON) |

#### Generation & AI
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **AIProvider** | AI-провайдер | name ("HuggingFace", "OpenAI" и т.д.), isGlobal |
| **AIModel** | AI-модель | name, slug, endpoint, isFree, isActive, costPerToken, speed |
| **AIConnection** | Ключ пользователя к провайдеру | encryptedApiKey, status, balance, monitorInterval |
| **AIUsage** | Статистика токенов | model, inputTokens, outputTokens, totalTokens |
| **Generation** | Генерация | userId, templateId, aiModelId, status |
| **GenerationResult** | Результат генерации | imageUrl, driveFileId, durationMs |

#### Storage
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **StorageProvider** | Провайдер хранилища | name ("S3", "Cloudflare R2"), baseUrl |
| **StorageConnection** | Подключение пользователя | encryptedCredentials (AES-шифрование) |

#### Marketplace & Billing
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **MarketplaceItem** | Товар на маркетплейсе | templateId, price (USD), isActive |
| **Purchase** | Покупка | userId, marketplaceItemId, amount |
| **Subscription** | Подписка | plan (FREE/PRO/ENTERPRISE), monthlyCredits, expiresAt |
| **CreditTransaction** | Транзакция кредитов | amount (+/-), reason |
| **PaymentMethod** | Платежный метод | cardNumber, expiry, balance, limit, isDefault |

#### Social & Logs
| Модель | Назначение | Ключевые поля |
|---|---|---|
| **Review** | Отзыв | rating (1-5), comment |
| **Notification** | Уведомление | title, message, isRead |
| **AuditLog** | Лог аудита | action, details (JSON) |
| **TemplateFav** | Избранный шаблон | userId, templateId |
| **Collection** | Коллекция шаблонов | name, isPublic |
| **CollectionTemplate** | Связь коллекция-шаблон | collectionId, templateId |
| **UserFollow** | Подписка на пользователя | followerId, followingId |
| **TemplateReport** | Жалоба на шаблон | reason ("SPAM", "NSFW", "COPYRIGHT") |
| **Payout** | Выплата автору | amount, status |

---

## 📡 Backend API — Модули

### Auth (`src/auth/`)
- **Стратегии:** JWT, Google OAuth, VK OAuth, Facebook OAuth
- **Guards:** JwtAuthGuard, RolesGuard
- **Эндпоинты:**
  - `POST /v1/auth/register` — Регистрация
  - `POST /v1/auth/login` — Вход
  - `GET /v1/auth/me` — Профиль текущего пользователя
  - `GET /v1/auth/google` — Google OAuth redirect
  - `GET /v1/auth/google/callback` — Google OAuth callback
  - `GET /v1/auth/vk` — VK OAuth redirect
  - `GET /v1/auth/facebook` — Facebook OAuth redirect

### Users (`src/users/`)
- CRUD операции с пользователями
- Управление статусом (ACTIVE/BANNED)

### Profile (`src/profile/`)
- **Эндпоинты:**
  - `GET /v1/profile` — Получить профиль
  - `PATCH /v1/profile` — Обновить профиль (name, nickname, bio, socialLinks)
  - `PATCH /v1/profile/avatar` — Загрузить аватар
  - `PATCH /v1/profile/preferences` — Обновить настройки (theme, accentColor, fontSize, compactMode, animations)
  - `PATCH /v1/profile/notifications` — Обновить настройки уведомлений

### Billing (`src/billing/`)
- **Эндпоинты:**
  - `GET /v1/billing/payment-methods` — Получить карты
  - `POST /v1/billing/payment-methods` — Добавить карту
  - `DELETE /v1/billing/payment-methods/:id` — Удалить карту
  - `PUT /v1/billing/payment-methods/:id/default` — Установить карту по умолчанию
  - `POST /v1/billing/charge` — Списать с карты
  - `POST /v1/billing/subscribe` — Оформить подписку
  - `GET /v1/billing/subscription` — Получить подписку

### Templates (`src/templates/`)
- CRUD шаблонов
- Версионирование
- Категории и теги
- Поиск и фильтрация

### Marketplace (`src/marketplace/`)
- Листинг и покупка шаблонов
- Отзывы и рейтинги

### Generations (`src/generations/`)
- Создание генерации → BullMQ очередь
- `GenerationProcessor` — обработчик очереди
- Сохранение результата в хранилище

### AI Module (`src/modules/ai/`)
- **Провайдер:** OpenRouter (основной)
- Chat completion, генерация текста
- Подсчет и логирование токенов

### Storage (`src/storage/`)
- Загрузка файлов в S3-совместимое хранилище
- AWS SDK S3 Client

### Integrations (`src/integrations/`)
- **Google Drive:** Подключение OAuth, загрузка/скачивание файлов, управление папками

### Admin (`src/admin/`)
- Управление пользователями (бан/разбан, смена ролей)
- Управление шаблонами (модерация, массовые действия)
- Управление AI-провайдерами и моделями
- Мониторинг подключений пользователей
- Экспорт данных

### Analytics (`src/analytics/`)
- Статистика генераций
- Статистика пользователей

### Notifications (`src/notifications/`)
- Создание и рассылка уведомлений
- Пометка прочитанных

### Roles (`src/roles/`)
- CRUD для ролей
- Управление разрешениями

### Mail (`src/mail/`)
- Отправка email (верификация, уведомления)
- Nodemailer + шаблоны

---

## 🖥️ Frontend — Структура

### Страницы (`app/`)

| Маршрут | Назначение |
|---|---|
| `/` | Главная страница (Landing / Dashboard) |
| `/generate` | Генератор изображений |
| `/templates` | Каталог шаблонов |
| `/marketplace` | Маркетплейс шаблонов |
| `/marketplace/[id]` | Детальная страница шаблона |
| `/gallery` | Галерея |
| `/my-generations` | Мои генерации |
| `/my-templates` | Мои шаблоны |
| `/connections/ai` | Подключение AI-провайдеров |
| `/connections/cloud` | Подключение облачных хранилищ |
| `/login` | Вход |
| `/register` | Регистрация |
| `/verify` | Подтверждение email |
| `/profile` | Профиль (redirect) |
| `/profile/personal` | Личные данные |
| `/profile/appearance` | Внешний вид (тема, акцент, шрифт) |
| `/profile/notifications` | Настройки уведомлений |
| `/profile/security` | Безопасность (пароль, сессии) |
| `/profile/billing` | Подписки, карты, платежи |
| `/profile/statistics` | Статистика |
| `/profile/activity` | Активность |
| `/billing/success` | Успешная оплата |
| `/billing/failed` | Ошибка оплаты |
| `/creator/dashboard` | Дашборд создателя |

### Админ-панель (`app/admin/`)

| Маршрут | Назначение |
|---|---|
| `/admin` | Дашборд (статистика, графики) |
| `/admin/users` | Управление пользователями |
| `/admin/templates` | Управление шаблонами |
| `/admin/marketplace` | Управление маркетплейсом |
| `/admin/ai-providers` | AI провайдеры |
| `/admin/ai-models` | AI модели |
| `/admin/api-keys` | API ключи |
| `/admin/cloud` | Облачные хранилища |
| `/admin/generations` | Генерации |
| `/admin/billing` | Биллинг |
| `/admin/billing/tariffs` | Тарифы |
| `/admin/billing/history` | История транзакций |
| `/admin/billing/promocodes` | Промокоды |
| `/admin/analytics` | Аналитика |
| `/admin/audit-logs` | Логи аудита |
| `/admin/settings` | Настройки |

### Компоненты (`components/`)

```
components/
├── layout/
│   ├── Sidebar.tsx          # Боковая панель навигации (анимируемая)
│   └── Topbar.tsx           # Верхняя панель (лого, кредиты, кнопки auth)
├── admin/
│   ├── AdminSidebar.tsx     # Админ-навигация
│   ├── AdminTopbar.tsx      # Админ-топбар
│   ├── DataTable.tsx        # Универсальная таблица данных
│   ├── PageHeader.tsx       # Заголовок страницы
│   ├── Badge.tsx            # Бейджик (статус)
│   ├── TemplateModal.tsx    # Модалка шаблона
│   ├── AssignTemplatesModal.tsx
│   ├── ImportTemplatesModal.tsx
│   ├── MonitorConfigModal.tsx
│   └── BillingModal.tsx
├── profile/
│   ├── AvatarUpload.tsx     # Загрузка и кроп аватара
│   └── cropImage.ts         # Утилита обрезки
├── marketplace/
│   └── TemplateCard.tsx     # Карточка шаблона
├── ai/
│   └── ChatTest.tsx         # Тестовый чат с AI
└── ui/                      # Shadcn UI компоненты
    ├── button.tsx
    ├── dialog.tsx
    ├── dropdown-menu.tsx
    ├── select.tsx
    ├── input.tsx
    ├── textarea.tsx
    ├── table.tsx
    ├── badge.tsx
    ├── checkbox.tsx
    ├── label.tsx
    ├── sonner.tsx
    ├── AuthImage.tsx
    └── ConfirmDeleteModal.tsx
```

### State Management (Zustand)

**3 стора** в `store/index.ts`:

| Стор | Назначение | Persist |
|---|---|---|
| `useAuthStore` | Авторизация, кредиты, подписка, карты | ✅ (`auth-storage`) |
| `useGenerationStore` | Параметры генерации (промт, модель, размеры) | ❌ |
| `useUIStore` | Sidebar, mobile, тема, акцент, шрифт | ❌ |

**AuthStore** содержит:
- `user` — текущий пользователь
- `token` — JWT токен
- `credits` — баланс кредитов
- `planId` — текущий тариф (`free`/`pro`/`enterprise`)
- `paymentMethods` — массив привязанных карт
- `chargeDefaultCard(amount, reason)` — списание с карты по умолчанию
- `fetchPaymentMethods()` — загрузка карт с бэкенда

### API Client (`lib/api.ts`)

Axios instance с автоматической инъекцией JWT-токена через interceptor:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
```

Дополнительные API-модули:
- `lib/admin.api.ts` — Методы для админ-панели
- `lib/templates.api.ts` — CRUD шаблонов

### Hooks

| Хук | Назначение |
|---|---|
| `useIsMobile()` | Определяет мобильное устройство (< 768px) |

---

## 📱 Мобильный UX

### Свайп-жесты (реализованы в `ClientLayout.tsx`)

| Жест | Действие |
|---|---|
| 1 палец: свайп вправо | Открыть сайдбар (с любого места экрана) |
| 1 палец: свайп влево | Закрыть сайдбар |
| 1 палец: свайп вниз (сверху страницы) | Pull-to-Refresh (только если scrollTop ≤ 5) |
| 2 пальца: свайп вниз (параллельно) | Перейти на следующую страницу из навигации |
| 2 пальца: свайп вверх (параллельно) | Перейти на предыдущую страницу |

**Защита от pinch-to-zoom:**
- `viewport: { maximumScale: 1, userScalable: false }` в `layout.tsx`
- Детекция пинча в `handleTouchMove`: если пальцы двигаются в противоположных направлениях → свайп отменяется

### Навигационный маршрут для двухпальцевого свайпа:
```
/ → /generate → /templates → /marketplace → /gallery → /my-generations →
/my-templates → /connections/ai → /connections/cloud → /profile → /profile/billing → (цикл)
```

### Адаптивный Topbar:
- **Desktop (≥ 768px):** Текстовый логотип `logo2.png` с анимацией
- **Mobile (< 768px):** Полный логотип `logo.png`
- **Неавторизован:** Показываются кнопки "Войти" / "Регистрация", скрываются кредиты и сайдбар

---

## 🎨 Дизайн-система

### Тема
- **Основная:** Dark theme (glassmorphism, gradients)
- **Поддержка:** Light / Dark / System
- **Акцентные цвета:** Indigo, Rose, Emerald, Amber, Blue
- **Размеры шрифта:** Small, Medium, Large
- **Компактный режим:** да/нет
- **Анимации:** вкл/выкл

### Логотипы (в `public/`)

| Файл | Назначение |
|---|---|
| `logo.png` | Полный логотип (dark) |
| `logo-light.png` | Полный логотип (light) |
| `logo-dark.png` | Полный логотип (alt dark) |
| `logo1.png` | Иконка-лого (dark) |
| `logo1-light.png` | Иконка-лого (light) |
| `logo2.png` | Текстовый логотип (dark) |
| `logo2-light.png` | Текстовый логотип (light) |
| `logo6.png` | Логотип для неавторизованных |

---

## 🚀 Деплой

### Текущий деплой: Render.com

Конфигурация в `render.yaml`:

| Сервис | Тип | Plan | URL |
|---|---|---|---|
| `arrena-photo-frontend` | Web Service (Node) | Free | arrena-photo-frontend-o4xg.onrender.com |
| `arrena-photo-backend` | Web Service (Node) | Free | arrena-photo-backend.onrender.com |
| `arrena-photo-db` | PostgreSQL | Free | (internal) |
| `arrena-photo-redis` | Redis | Free | (internal) |

**Билд фронтенда:** `bash scripts/render-frontend-build.sh`
**Билд бэкенда:** `pnpm install → db:generate → nest build`
**Старт бэкенда:** `db:push → node dist/main`

### Docker (для self-hosted)

`docker-compose.prod.yml` включает 8 сервисов:

1. **Nginx** — Reverse proxy (80, 443)
2. **Frontend** — Next.js (3000)
3. **Backend** — NestJS (4000)
4. **PostgreSQL 15** — БД
5. **Redis 7** — Кэш + очереди
6. **MinIO** — Объектное хранилище (S3-совместимое)
7. **Prometheus** — Метрики
8. **Grafana** — Дашборды мониторинга

---

## 🔧 Разработка

### Требования
- **Node.js:** 20.x
- **pnpm:** ≥ 8.0.0
- **PostgreSQL:** 15+
- **Redis:** 7+

### Команды

```bash
# Установить зависимости
pnpm install

# Запустить dev-режим (frontend + backend)
pnpm dev

# Сгенерировать Prisma Client
pnpm db:generate

# Применить миграции
pnpm db:push

# Засидить БД
pnpm db:seed

# Билд всего
pnpm build

# Линтинг
pnpm lint

# Форматирование
pnpm format
```

### Переменные окружения

| Переменная | Где | Назначение |
|---|---|---|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `REDIS_URL` | Backend | Redis connection string |
| `REDIS_PASSWORD` | Backend | Пароль Redis |
| `JWT_SECRET` | Backend | Секрет для JWT |
| `FRONTEND_URL` | Backend | URL фронтенда (для CORS, OAuth redirect) |
| `NEXT_PUBLIC_API_URL` | Frontend | URL бэкенд API |
| `GOOGLE_CLIENT_ID` | Backend | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Backend | Google OAuth |
| `OPENROUTER_API_KEY` | Backend | OpenRouter AI |
| `OPENROUTER_BASE_URL` | Backend | OpenRouter endpoint |
| `STORAGE_ENDPOINT` | Backend | S3/MinIO endpoint |
| `STORAGE_ACCESS_KEY` | Backend | S3 access key |
| `STORAGE_SECRET_KEY` | Backend | S3 secret key |
| `STORAGE_BUCKET` | Backend | S3 bucket name |

---

## 🔒 Безопасность

- **Helmet** — HTTP security headers
- **CORS** — Включен глобально
- **Rate Limiting** — 100 запросов/минута (ThrottlerModule)
- **JWT** — Bearer token авторизация
- **OAuth** — Google, VK, Facebook
- **Validation** — class-validator с whitelist + forbidNonWhitelisted
- **Шифрование:** API-ключи AI-провайдеров шифруются (AES) в БД
- **Viewport Lock** — Pinch-to-zoom отключен на мобилках
- **Sidebar Guard** — Сайдбар и кредиты скрыты для неавторизованных пользователей

---

## 📊 Бизнес-логика

### Кредитная система
- Новый пользователь получает **1500 кредитов**
- Кредиты списываются за генерации
- Кредиты можно докупить
- Подписка даёт ежемесячное пополнение

### Тарифные планы

| План | Кредиты/мес | Возможности |
|---|---|---|
| **FREE** | 20 | Базовые модели |
| **PRO** | — | Расширенные модели, приоритет |
| **ENTERPRISE** | — | Все модели, API-доступ, поддержка |

### Биллинг
- Привязка платежных карт (номер, срок, CVV, баланс, лимит)
- Карта по умолчанию
- Списание с баланса карты при покупке
- Списание с лимита карты при покупке
- Просроченные карты → только удаление

---

## 🔄 Потоки данных

### Авторизация (Google OAuth)
```
Пользователь → /v1/auth/google → Google OAuth → callback →
JWT генерация → redirect на frontend с токеном →
ClientLayout декодирует JWT → login() → fetch /auth/me →
обновление стора (user, credits, planId, preferences)
```

### Генерация изображения
```
Frontend (промт, модель, настройки) → POST /v1/generations →
BullMQ очередь → GenerationProcessor →
AI Provider (OpenRouter) → результат →
Сохранение в StorageProvider → GenerationResult →
Frontend получает URL результата
```

### Покупка подписки
```
Frontend → POST /v1/billing/subscribe (planId, paymentMethodId) →
chargeDefaultCard() → вычитание из баланса и лимита карты →
Создание/обновление Subscription → CreditTransaction →
Frontend обновляет planId и credits в Zustand
```

---

## 📁 Ключевые файлы

| Файл | Назначение |
|---|---|
| `apps/frontend/app/ClientLayout.tsx` | Главный layout: auth init, touch gestures, sidebar/topbar |
| `apps/frontend/app/layout.tsx` | Root layout: шрифты, viewport, providers |
| `apps/frontend/components/layout/Topbar.tsx` | Верхняя панель: лого, кредиты, auth кнопки |
| `apps/frontend/components/layout/Sidebar.tsx` | Боковая навигация (анимированная) |
| `apps/frontend/store/index.ts` | Zustand сторы (Auth, Generation, UI) |
| `apps/frontend/lib/api.ts` | Axios instance с JWT interceptor |
| `apps/backend-api/src/main.ts` | NestJS bootstrap (CORS, Swagger, Helmet) |
| `apps/backend-api/src/app.module.ts` | Корневой модуль (все импорты) |
| `apps/backend-api/src/auth/auth.service.ts` | Логика авторизации |
| `apps/backend-api/src/billing/billing.service.ts` | Логика биллинга |
| `packages/database/prisma/schema.prisma` | Схема базы данных |
| `render.yaml` | Конфигурация деплоя на Render |
| `docker-compose.prod.yml` | Production Docker стек |

---

## 🚧 Статус разработки и TODO

### ✅ Готово
- [x] Архитектура и база данных (Prisma Schema)
- [x] Backend API (все модули)
- [x] OAuth авторизация (Google)
- [x] Frontend (все страницы)
- [x] Админ-панель
- [x] Биллинг (карты, подписки, списания)
- [x] Профиль (настройки, аватар, внешний вид)
- [x] Мобильные жесты (свайпы, pull-to-refresh)
- [x] Деплой на Render.com
- [x] Docker-конфигурация (для self-hosted)

### 🔜 В работе / Запланировано
- [ ] История транзакций и PDF-инвойсы
- [ ] Админка управления тарифами (динамические цены)
- [ ] Промокоды
- [ ] Полноценная интеграция AI-провайдеров (помимо OpenRouter)
- [ ] Webhooks для статуса генерации
- [ ] Email-уведомления
- [ ] Worker-сервис (отдельный процесс для очередей)
- [ ] Тесты (unit, e2e)
- [ ] CI/CD pipeline (GitHub Actions)
