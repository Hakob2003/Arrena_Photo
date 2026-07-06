# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 1)
**Эпики:** Phase 1 (Security) & Phase 2 (Architecture & Worker)
**Формат:** Каждая задача содержит исчерпывающий контекст для разработчика (или AI агента).

---

## 🛡️ EPIC 1: Zero-Trust Security (Фаза 1)
Критические уязвимости, подлежащие устранению до любого публичного релиза.

### [SEC-001] Демонтаж открытого эндпоинта `setup-admin`
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`, `apps/backend-api/src/auth/auth.service.ts`
- **Проблема:** Метод `setup-admin` доступен без авторизации. Любой GET-запрос может сбросить пароль администратора на дефолтный `admin123`.
- **Задачи (Task Breakdown):**
  1. Удалить декоратор `@Get('setup-admin')` из контроллера.
  2. Удалить метод `setupAdmin()` из сервиса.
  3. Написать CLI-скрипт `scripts/create-admin.ts` для создания первого админа через консоль сервера.
- **Definition of Done (DoD):** Вызов `GET /api/v1/auth/setup-admin` возвращает HTTP 404. В кодовой базе нет строки `admin123`.

### [SEC-002] Внедрение строгой проверки ролей (RBAC) в Admin API
- **Priority:** P0 (Critical)
- **Dependencies:** SEC-001
- **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/admin/admin.controller.ts`, `apps/backend-api/src/auth/guards/roles.guard.ts`
- **Проблема:** В `AdminController` висит только `JwtAuthGuard`. Рядовой пользователь с валидным JWT может вызывать админские методы, например, начислять себе кредиты.
- **Задачи:**
  1. Создать кастомный декоратор `@Roles()`.
  2. Создать `RolesGuard`, который проверяет `req.user.role === 'ADMIN'`.
  3. Применить `@UseGuards(JwtAuthGuard, RolesGuard)` и `@Roles('ADMIN')` на уровне класса `AdminController`.
- **DoD:** Попытка GET `api/v1/admin/users` с токеном обычного юзера возвращает HTTP 403 Forbidden (а не 401 Unauthorized).

### [SEC-003] Искоренение статического JWT-ключа (Fallback)
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/auth.module.ts`, `apps/backend-api/src/auth/jwt.strategy.ts`
- **Проблема:** В случае отсутствия `process.env.JWT_SECRET`, система использует запасной ключ, что позволяет хакеру сгенерировать валидный токен локально и отправить на сервер.
- **Задачи:**
  1. Убрать fallback `super-secret-key-change-me-in-production`.
  2. В `main.ts` добавить валидацию конфигурации через `Joi` (или ручной `throw new Error`), чтобы приложение падало (CrashLoopBackOff) при запуске без `JWT_SECRET`.
- **DoD:** Приложение не стартует без явно заданного сильного JWT_SECRET.

### [SEC-004] Защита OAuth Flow от перехвата токена (XSS / History Leak)
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 6h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`, `apps/frontend/lib/auth.ts`
- **Проблема:** После логина через Google, сервер редиректит на `?token=eyJ...`. Токен остается в логах Cloudflare, логах Nginx и истории браузера.
- **Задачи:**
  1. Изменить метод `googleAuthCallback`. Вместо редиректа с параметром генерировать HttpOnly Secure Cookie.
  2. Либо реализовать обмен короткоживущего `auth_code` на JWT через отдельный POST-запрос с фронтенда.
- **DoD:** Токен больше не передается в query-параметрах URL ни при каких обстоятельствах.

### [SEC-005] Шифрование токенов сторонних провайдеров в БД
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/auth/auth.service.ts`
- **Проблема:** При привязке аккаунта VK/Google, мы сохраняем их `accessToken` в БД в открытом виде (plain text). Дамп базы приведет к компрометации аккаунтов юзеров.
- **Задачи:**
  1. Создать `CryptoUtil` (AES-256-GCM шифрование).
  2. Шифровать токены перед записью в Prisma, дешифровать перед использованием.
- **DoD:** Дамп таблицы `User` не содержит читаемых OAuth токенов.

---

## 🏗️ EPIC 2: Architecture & Worker Extraction (Фаза 2)
Разделение монолита для отказоустойчивости и решения проблемы `setTimeout`.

### [ARC-001] Инициализация микросервиса Worker
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 4h
- **Target Files:** `nest-cli.json`, `apps/worker/*`
- **Проблема:** `GenerationProcessor` крутится в том же процессе, что и REST API.
- **Задачи:**
  1. Выполнить команду превращения репозитория в NestJS Monorepo.
  2. Создать приложение `worker`.
  3. Настроить `tsconfig.json` и пути для сборки `worker` отдельно от `api`.
- **DoD:** Появляется возможность запустить `pnpm start worker` как независимый процесс без HTTP-контроллеров.

### [ARC-002] Миграция логики генерации в Worker
- **Priority:** P0 (Critical)
- **Dependencies:** ARC-001
- **Est. Time:** 8h
- **Target Files:** `apps/worker/src/processor/generation.processor.ts`, `apps/worker/src/services/*`
- **Проблема:** Провайдеры OpenAI/Replicate импортируются в API-сервер.
- **Задачи:**
  1. Переместить классы провайдеров, сервисы водяных знаков в `worker`.
  2. Зарегистрировать BullMQ Consumer внутри `worker`.
- **DoD:** API-сервер больше не содержит зависимостей OpenAI/Replicate (только кладет payload в BullMQ).

### [ARC-003] Рефакторинг задержек для тарифа FREE
- **Priority:** P1 (High)
- **Dependencies:** ARC-002
- **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** `setTimeout(30000)` в коде воркера. Блокирует обработку задач других пользователей.
- **Задачи:**
  1. Убрать `setTimeout` из `GenerationProcessor`.
  2. В `BackendAPI` при вызове `queue.add()` добавить опцию `delay: 30000` для пользователей с планом `free`.
- **DoD:** Воркер не простаивает 30 секунд. Задача просто "невидима" для него первые 30 секунд.

### [ARC-004] Интеграция Health Checks для Воркера
- **Priority:** P2 (Medium)
- **Dependencies:** ARC-001
- **Est. Time:** 2h
- **Target Files:** `apps/worker/src/health/health.controller.ts`
- **Проблема:** Docker Swarm / Kubernetes не может понять, жив ли Worker, так как он слушает только Redis.
- **Задачи:**
  1. Поднять на воркере минимальный Express сервер (на порту 3001).
  2. Сделать эндпоинт `/health`, проверяющий соединение с Redis и Postgres.
- **DoD:** Контейнер воркера корректно поддерживает Docker HEALTHCHECK.

### [ARC-005] Graceful Shutdown (Мягкая остановка воркера)
- **Priority:** P1 (High)
- **Dependencies:** ARC-002
- **Est. Time:** 3h
- **Target Files:** `apps/worker/src/main.ts`
- **Проблема:** При деплое новой версии контейнер завершается SIGTERM сигналом. Воркер убивается посередине генерации картинки, деньги юзера списаны, картинка не готова.
- **Задачи:**
  1. Включить `app.enableShutdownHooks()`.
  2. Настроить BullMQ Worker закрываться грациозно: `worker.close()`, ждать завершения текущего джоба (до 30 сек).
- **DoD:** При обновлении контейнера ни одна задача в статусе `PROCESSING` не прерывается грубо.

---
*Ожидает генерации следующей части (Эпики: Базы данных, Типизация).*


# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 2)
**Эпики:** Phase 3 (Database & Storage Migration)

---

## 💾 EPIC 3: Storage & Database Optimization (Фаза 3)

### [DB-001] Подготовка инфраструктуры MinIO (S3)
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `docker-compose.prod.yml`, `apps/backend-api/src/storage/storage.service.ts`
- **Проблема:** Нет инфраструктуры для хранения картинок вне БД.
- **Задачи:**
  1. Добавить `minio` сервис в `docker-compose`.
  2. Установить `aws-sdk/client-s3` или `minio` пакет.
  3. Написать класс `StorageService` с методом `uploadBuffer(buffer: Buffer, mimetype: string, key: string)`.
- **DoD:** `StorageService.uploadBuffer` успешно сохраняет файл в локальный MinIO и возвращает публичный URL.

### [DB-002] Внедрение Dual-Write для генераций
- **Priority:** P0 (Critical)
- **Dependencies:** DB-001, ARC-002
- **Est. Time:** 4h
- **Target Files:** `packages/database/prisma/schema.prisma`, `apps/worker/src/processor/generation.processor.ts`
- **Проблема:** Worker пишет Base64 прямо в БД.
- **Задачи:**
  1. Добавить `s3ImageUrl String?` в таблицу `Generation`.
  2. Выполнить `prisma db push` (в dev) или миграцию.
  3. В воркере после получения картинки, прогонять ее через `StorageService` и писать в БД сразу два поля: старое `resultImage` и новое `s3ImageUrl`.
- **DoD:** Новые генерации появляются и в виде Base64, и в MinIO (с URL в `s3ImageUrl`). Фронтенд не ломается.

### [DB-003] Адаптация API для приоритета S3
- **Priority:** P1 (High)
- **Dependencies:** DB-002
- **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** Фронтенд ожидает `imageUrl`, который сейчас мапится строго на `resultImage`.
- **Задачи:**
  1. В `mapGeneration()` или DTO-трансформере отдавать `imageUrl = gen.s3ImageUrl || gen.resultImage`.
- **DoD:** API отдает S3 ссылку, если она есть, иначе fallback на Base64. Картинки на клиенте продолжают работать.

### [DB-004] Скрипт миграции старых данных (Base64 -> S3)
- **Priority:** P1 (High)
- **Dependencies:** DB-003
- **Est. Time:** 6h
- **Target Files:** `scripts/migrate-base64-to-s3.ts`
- **Проблема:** В базе остаются гигабайты старых Base64 изображений.
- **Задачи:**
  1. Написать Node.js скрипт. Использовать пакет `prisma`.
  2. Выбирать батчами по 100 записей `where: { s3ImageUrl: null, resultImage: { not: null } }`.
  3. Конвертировать Base64 -> Buffer -> S3.
  4. Обновлять запись в БД. Обернуть в `try/catch`.
- **DoD:** Скрипт может быть запущен в фоне, он идемпотентен, выводит прогресс-бар в консоль. По окончании работы в БД нет ни одной записи без `s3ImageUrl`.

### [DB-005] Удаление колонки Base64 и очистка БД
- **Priority:** P2 (Medium)
- **Dependencies:** DB-004
- **Est. Time:** 2h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Даже после удаления данных колонка существует в схеме, а TOAST таблицы фрагментированы.
- **Задачи:**
  1. Удалить колонку `resultImage` из схемы Prisma.
  2. Сгенерировать миграцию: `pnpm prisma migrate dev --name remove_base64_column`.
  3. Вручную запустить команду `VACUUM FULL "Generation";` на PostgreSQL сервере.
- **DoD:** Дамп таблицы `Generation` весит килобайты, а не гигабайты.

### [DB-006] Оптимизация схемы БД (Индексы и Foreign Keys)
- **Priority:** P2 (Medium)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Отсутствие каскадного удаления и индексов для сортировки `createdAt`.
- **Задачи:**
  1. Добавить `onDelete: Cascade` для всех связей с `User` (генерации, шаблоны, транзакции).
  2. Добавить `@@index([createdAt(sort: Desc)])` в `Generation` и `Transaction`.
  3. Добавить `@@index([userId, createdAt(sort: Desc)])` для оптимизации личной истории юзера.
- **DoD:** EXPLAIN ANALYZE для запроса ленты (Feed) показывает использование `Index Scan` вместо `Seq Scan`. Время ответа < 50ms.


# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 3)
**Эпики:** Phase 4 (Type Safety & Contracts)

---

## 🛡️ EPIC 4: Type Safety & API Contracts (Фаза 4)

### [TYP-001] Инициализация пакета `@arrena-photo/shared-types`
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 2h
- **Target Files:** `packages/shared-types/package.json`, `pnpm-workspace.yaml`
- **Проблема:** Бэкенд и фронтенд дублируют интерфейсы или используют `any`.
- **Задачи:**
  1. Создать базовую структуру пакета в `packages/shared-types`.
  2. Настроить `tsconfig.json` для сборки в `dist`.
  3. Добавить зависимость в `backend-api` и `frontend` через `workspace:*`.
- **DoD:** Можно написать `import { Test } from '@arrena-photo/shared-types'` на фронте и бэке без ошибок компиляции.

### [TYP-002] Выделение DTO генерации в Shared Types
- **Priority:** P1 (High)
- **Dependencies:** TYP-001
- **Est. Time:** 3h
- **Target Files:** `packages/shared-types/src/generation.dto.ts`
- **Проблема:** Payload для `/api/v1/generations` не стандартизован.
- **Задачи:**
  1. Описать `CreateGenerationRequest` и `GenerationResponse`.
  2. Заменить использование `any` в `generations.service.ts` на бэкенде.
  3. Обновить `lib/api.ts` на фронтенде для использования этих типов в Axios.
- **DoD:** Полное совпадение типов от Axios.post до Prisma.create.

### [TYP-003] Внедрение class-validator на Backend
- **Priority:** P0 (Critical)
- **Dependencies:** TYP-002
- **Est. Time:** 5h
- **Target Files:** `apps/backend-api/src/main.ts`, `apps/backend-api/src/**/*.dto.ts`
- **Проблема:** NestJS не валидирует входящие данные, доверяя клиенту.
- **Задачи:**
  1. В `main.ts` включить `ValidationPipe(whitelist: true, forbidNonWhitelisted: true)`.
  2. Создать классы DTO, имплементирующие интерфейсы из `shared-types`.
  3. Добавить декораторы `@IsString()`, `@IsNotEmpty()`, `@MaxLength()` во все DTO контроллеров (Auth, Admin, Generation).
- **DoD:** Отправка `{ "prompt": 123 }` возвращает `400 Bad Request` с понятным текстом ошибки от NestJS, не доходя до бизнес-логики.

### [TYP-004] Рефакторинг декоратора @CurrentUser
- **Priority:** P2 (Medium)
- **Dependencies:** None
- **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/decorators/current-user.decorator.ts`
- **Проблема:** Декоратор возвращает `any`.
- **Задачи:**
  1. Определить строгий интерфейс `JwtPayload { id: string; email: string; role: RoleName }`.
  2. Типизировать возврат декоратора.
  3. Удалить все `req: any` из параметров контроллеров, заменив на `@CurrentUser() user: JwtPayload`.
- **DoD:** TypeScript подсвечивает ошибку, если обратиться к `user.username` (так как этого поля нет в Payload).

### [TYP-005] Генерация Swagger / OpenAPI Документации
- **Priority:** P2 (Medium)
- **Dependencies:** TYP-003
- **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/main.ts`, `apps/backend-api/src/**/*.controller.ts`
- **Проблема:** Документации API не существует.
- **Задачи:**
  1. Подключить `@nestjs/swagger`.
  2. Разметить контроллеры декораторами `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`.
  3. Разметить DTO декораторами `@ApiProperty()`.
- **DoD:** По адресу `/api/docs` доступен Swagger UI со всеми эндпоинтами проекта.


# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 4)
**Эпики:** Phase 5 (Frontend Architecture, SSR & SEO)

---

## ⚛️ EPIC 5: Frontend Architecture & SEO (Фаза 5)

### [FE-001] Декомпозиция монолита `generate/page.tsx`
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 6h
- **Target Files:** `apps/frontend/app/generate/page.tsx`, `apps/frontend/components/generation/*`
- **Проблема:** Файл содержит 700 строк неструктурированного кода (UI, Логика, API, Состояние).
- **Задачи:**
  1. Вынести панель настроек в `PromptSettingsPanel.tsx`.
  2. Вынести блок результата в `GenerationResultView.tsx`.
  3. Вынести логику вызова API в кастомный хук `useGenerateAction.ts`.
  4. Главный файл должен выполнять только оркестрацию (передачу пропсов).
- **DoD:** Файл `generate/page.tsx` содержит менее 150 строк кода.

### [FE-002] Внедрение SSR на публичных страницах
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 5h
- **Target Files:** `apps/frontend/app/marketplace/page.tsx`, `apps/frontend/app/layout.tsx`
- **Проблема:** Глобальный `'use client'` и Client-Side Fetching ломают индексацию SEO.
- **Задачи:**
  1. Убрать `'use client'` из корневого `layout.tsx`.
  2. На странице Marketplace переписать логику получения шаблонов на серверный вызов напрямую к БД или к API (`await fetch(...)`).
  3. Использовать `<Suspense>` для Loading States.
- **DoD:** Страница Marketplace рендерит HTML со списком шаблонов при отключенном JavaScript в браузере (Google Bot Friendly).

### [FE-003] Динамические Мета-теги (OpenGraph)
- **Priority:** P1 (High)
- **Dependencies:** FE-002
- **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/marketplace/[slug]/page.tsx`
- **Проблема:** При шеринге ссылки на шаблон в Telegram показывается дефолтный логотип сайта.
- **Задачи:**
  1. Экспортировать `generateMetadata` из страницы шаблона.
  2. Подтягивать данные шаблона по slug.
  3. Формировать теги `og:title`, `og:description`, `og:image`.
- **DoD:** Telegram/Twitter корректно отрисовывает превью конкретного шаблона при шаринге прямой ссылки.

### [FE-004] Рефакторинг состояния Zustand (Auth Store)
- **Priority:** P1 (High)
- **Dependencies:** SEC-004
- **Est. Time:** 4h
- **Target Files:** `apps/frontend/store/auth.store.ts`, `apps/frontend/middleware.ts`
- **Проблема:** Хранение токена в `localStorage` не безопасно и вызывает моргание UI при загрузке.
- **Задачи:**
  1. Убрать токен из Zustand. Хранить его только в HTTP-Only cookies.
  2. Создать Next.js Middleware, который проверяет куку токена при доступе к защищенным роутам (`/generate`, `/profile`) и редиректит на `/login`, если токена нет, не дожидаясь рендера клиента.
- **DoD:** Страница `/generate` не мигает при прямом переходе (сразу показывает либо контент, либо редиректит на `/login` на уровне сервера).

### [FE-005] Внедрение Next/Image и удаление обычных <img>
- **Priority:** P2 (Medium)
- **Dependencies:** None
- **Est. Time:** 2h
- **Target Files:** Весь `apps/frontend`
- **Проблема:** Сырые теги `<img>` не оптимизируют размер, ухудшая Core Web Vitals (LCP).
- **Задачи:**
  1. Заменить все `<img src={...}>` на `<Image src={...} alt="..." width={..} height={..} />`.
  2. Настроить `remotePatterns` в `next.config.js` для домена S3/MinIO.
- **DoD:** Lighthouse Report показывает зеленый скор для пункта "Properly size images" и "Serve images in next-gen formats".


# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 5)
**Эпики:** Phase 6 (QA & Testing Automation)

---

## 🧪 EPIC 6: QA & Testing Automation (Фаза 6)

### [QA-001] Настройка Jest и инфраструктуры тестирования
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `apps/backend-api/jest.config.js`, `apps/backend-api/test/setup.ts`
- **Проблема:** Отсутствие фреймворка тестирования.
- **Задачи:**
  1. Установить `jest`, `ts-jest`, `@types/jest`, `jest-mock-extended`.
  2. Настроить конфиг для обхода алиасов (e.g. `@arrena-photo/shared-types`).
  3. Добавить команды `test:unit`, `test:cov` в `package.json`.
- **DoD:** Запуск `pnpm run test:unit` проходит без ошибок инициализации и находит 0 тестов.

### [QA-002] Unit-тестирование BillingService
- **Priority:** P0 (Critical)
- **Dependencies:** QA-001
- **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/billing/billing.service.spec.ts`
- **Проблема:** Бизнес-критичная логика не покрыта тестами.
- **Задачи:**
  1. Изолировать сервис от БД с помощью Prisma Mock.
  2. Написать тест успешного списания кредитов (return true).
  3. Написать тест неудачного списания из-за нехватки баланса (return false).
  4. Написать тест начисления кредитов админом.
- **DoD:** Покрытие `billing.service.ts` > 90% (Coverage Report).

### [QA-003] Настройка E2E тестирования с Playwright
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `playwright.config.ts`, `apps/frontend/package.json`
- **Проблема:** Нет автоматической проверки критического пути пользователя в браузере.
- **Задачи:**
  1. Установить `@playwright/test` в монорепу (в корень или в отдельный пакет `packages/e2e`).
  2. Настроить запуск локального веб-сервера (Frontend) и API в конфиге `webServer` перед тестами.
- **DoD:** Команда `pnpm run test:e2e` поднимает среду и открывает Chromium.

### [QA-004] E2E-тест: Критический путь "Логин -> Генерация"
- **Priority:** P1 (High)
- **Dependencies:** QA-003
- **Est. Time:** 5h
- **Target Files:** `tests/e2e/generation.spec.ts`
- **Проблема:** Нет гарантии, что основная фича (Генерация) не сломана рефакторингом.
- **Задачи:**
  1. Написать тест на авторизацию тестового юзера.
  2. Переход на страницу `/generate`.
  3. Мокирование сетевого запроса к OpenAI/Replicate (чтобы не тратить реальные лимиты).
  4. Ожидание появления превью-картинки на странице.
- **DoD:** Тест проходит стабильно, без flaky-ошибок. Добавлен `page.waitForSelector('.generation-result-image')`.

### [QA-005] Внедрение GitHub Actions пайплайна (CI)
- **Priority:** P0 (Critical)
- **Dependencies:** QA-001, QA-003
- **Est. Time:** 4h
- **Target Files:** `.github/workflows/ci.yml`
- **Проблема:** Код попадает в `main` без проверок.
- **Задачи:**
  1. Создать CI workflow для триггера `pull_request`.
  2. Шаги: Setup Node -> pnpm install -> Lint -> TypeCheck (tsc) -> Unit Tests -> E2E Tests (опционально, если инфраструктура позволяет).
  3. Настроить правила ветки `main` в GitHub: запретить merge без прохождения проверок (Status Checks Require).
- **DoD:** PR-ы с ошибками компиляции помечаются красным крестиком и кнопка Merge блокируется.


# 📋 TODO REFACTOR BACKLOG — Arrena Photo (Часть 6/ФИНАЛ)
**Эпики:** Phase 7 (DevOps, Observability & Scaling)

---

## 🚀 EPIC 7: DevOps, Observability & Scaling (Фаза 7)

### [DEV-001] Санация репозитория (Repository Hygiene)
- **Priority:** P2 (Medium)
- **Dependencies:** None
- **Est. Time:** 2h
- **Target Files:** Root directory (`telegram-bridge.js`, `start_ide.js`, `.bat` files)
- **Проблема:** Корень проекта замусорен одноразовыми и тестовыми скриптами.
- **Задачи:**
  1. Создать папку `scripts/tools/` и переместить туда все утилитарные скрипты.
  2. Актуализировать секцию `scripts` в `package.json`, чтобы они запускались через `pnpm run tool:bridge` и т.д.
- **DoD:** В корне проекта лежат только конфиги (`package.json`, `docker-compose.yml`, `pnpm-workspace.yaml`).

### [DEV-002] Внедрение Multi-Stage Dockerfile для Backend
- **Priority:** P1 (High)
- **Dependencies:** None
- **Est. Time:** 4h
- **Target Files:** `apps/backend-api/Dockerfile`, `apps/worker/Dockerfile`
- **Проблема:** Тяжелые Docker-образы (тянут `devDependencies`).
- **Задачи:**
  1. Написать Multi-Stage Dockerfile (этапы `builder` и `runner`).
  2. Убедиться, что в production образ попадают только `node_modules` с флагом `--prod` и скомпилированная папка `dist`.
  3. Запуск Node.js процесса от имени пользователя `node` (security requirement).
- **DoD:** Размер собранного Docker-образа бэкенда не превышает 250 MB.

### [DEV-003] Интеграция Sentry (Error Tracking)
- **Priority:** P0 (Critical)
- **Dependencies:** None
- **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/common/filters/sentry.filter.ts`, `apps/frontend/sentry.edge.config.ts`
- **Проблема:** Отсутствие мониторинга ошибок (Observability).
- **Задачи:**
  1. Добавить `@sentry/node` и `@sentry/nestjs` в бэкенд. Настроить глобальный Exception Filter.
  2. Добавить `@sentry/nextjs` во фронтенд.
  3. Пробрасывать `SENTRY_DSN` через переменные окружения.
- **DoD:** Ошибка HTTP 500 на сервере и `TypeError` в браузере клиента моментально прилетают в дашборд Sentry.

### [DEV-004] Интеграция Метрик Prometheus / Grafana
- **Priority:** P2 (Medium)
- **Dependencies:** None
- **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/app.module.ts`, `docker-compose.prod.yml`
- **Проблема:** Нет понимания производительности (Request Time, CPU Usage, BullMQ Queue Length).
- **Задачи:**
  1. Установить `@willsoto/nestjs-prometheus`.
  2. Включить эндпоинт `/metrics` в приложении.
  3. Настроить `prometheus.yml` для скрейпинга метрик с бэкенда и воркера.
- **DoD:** В Grafana видны графики RPS (Requests Per Second) и количества активных воркеров.

### [DEV-005] Настройка Health Checks для Docker Compose
- **Priority:** P1 (High)
- **Dependencies:** ARC-004
- **Est. Time:** 2h
- **Target Files:** `docker-compose.prod.yml`
- **Проблема:** Контейнер `backend-api` пытается стартовать до того, как Postgres готов к соединениям.
- **Задачи:**
  1. Добавить блок `healthcheck` к контейнерам `postgres` и `redis` (использовать `pg_isready` и `redis-cli ping`).
  2. Добавить блок `depends_on: postgres: condition: service_healthy` к `backend-api`.
- **DoD:** При команде `docker-compose up -d` бэкенд не падает с ошибкой `Connection Refused` к базе данных.


