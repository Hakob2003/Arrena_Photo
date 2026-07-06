# 📋 TODO REFACTOR BACKLOG — Объемная версия (1-10/100)

## 🛡️ Блок: Security - Authentication

### [SEC-001] Удаление эндпоинта `/auth/setup-admin`

- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`, `apps/backend-api/src/auth/auth.service.ts`
- **Проблема:** Любой пользователь сети может вызвать GET `/auth/setup-admin` и сбросить/создать администратора с паролем `admin123`.
- **Задачи:**
  1. Найти и удалить декоратор `@Get('setup-admin')` и соответствующий метод в `AuthController`.
  2. В `AuthService` удалить логику хардкодного создания юзера `admin@arrena.ai`.
- **DoD:** Эндпоинт полностью недоступен (404 Not Found).

### [SEC-002] Создание CLI-инструмента для сидирования администратора

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `packages/database/prisma/seed.ts`
- **Проблема:** После удаления `/setup-admin` нет легитимного способа создать админа при деплое.
- **Задачи:**
  1. Создать `seed.ts` для Prisma.
  2. Использовать пакет `dotenv` для чтения `process.env.SUPERADMIN_EMAIL` и `SUPERADMIN_PASSWORD`.
  3. Хэшировать пароль через `bcrypt.hash(password, 12)`.
  4. Сохранять администратора с `role = 'ADMIN'`.
- **DoD:** Команда `pnpm db:seed` создает супер-админа без хардкода в кодовой базе.

### [SEC-003] Исключение Fallback-ключей для JWT

- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/auth.module.ts`, `apps/backend-api/src/auth/jwt.strategy.ts`
- **Проблема:** Использование `config.get('JWT_SECRET', 'super-secret')` позволяет взломать токены, если ENV переменная не прокинута.
- **Задачи:**
  1. Удалить второй аргумент (fallback) из всех вызовов `configService.get('JWT_SECRET')`.
- **DoD:** Приложение использует только секрет из ENV-окружения.

### [SEC-004] Валидация наличия JWT секрета при старте приложения

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Приложение может запуститься без JWT-ключа, что приведет к непредсказуемому поведению.
- **Задачи:**
  1. В функции `bootstrap()` добавить проверку: если `JWT_SECRET` undefined или меньше 32 символов — вызывать `Logger.fatal()` и `process.exit(1)`.
- **DoD:** Сервер падает при запуске, если не настроен сильный секретный ключ.

### [SEC-005] Переход с Query параметров на HttpOnly Cookies для OAuth

- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`, `apps/frontend/lib/api.ts`
- **Проблема:** После логина через Google токен передается в URL `?token=...`, оседая в истории браузера.
- **Задачи:**
  1. В `googleAuthCallback` использовать `res.cookie('access_token', token, { httpOnly: true, secure: true, sameSite: 'strict' })`.
  2. Убрать редирект с query-параметрами.
- **DoD:** Токен недоступен через JavaScript (защита от XSS), передается автоматически в заголовках.

### [SEC-006] Защита от CSRF атак при использовании Cookies

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Переход на Cookies открывает вектор для Cross-Site Request Forgery (CSRF).
- **Задачи:**
  1. Установить и настроить пакет `csurf` (или `@nestjs/csrf`).
  2. Настроить выдачу CSRF-токена для фронтенда.
- **DoD:** Все мутирующие методы (POST, PUT, DELETE) требуют `X-CSRF-Token`.

### [SEC-007] Шифрование OAuth токенов провайдеров в базе данных

- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/common/utils/encryption.util.ts`, `auth.service.ts`
- **Проблема:** Токены сторонних провайдеров (Google, VK) хранятся как plain-text.
- **Задачи:**
  1. Написать `EncryptionUtil` на базе `crypto.createCipheriv` (алгоритм `aes-256-gcm`).
  2. Зашифровать все токены при записи в Prisma.
- **DoD:** В таблице `User` в колонках `providerAccessToken` лежат нечитаемые бинарные данные.

### [SEC-008] Скрипт миграции старых паролей (Опционально)

- **Priority:** P3 (Low) | **Est. Time:** 3h
- **Target Files:** `scripts/rehash-passwords.ts`
- **Проблема:** Если ранее использовался слабый алгоритм хэширования, нужно перехэшировать.
- **Задачи:** Написать скрипт, сканирующий старые пароли и просящий юзеров сбросить их при входе (или перехэширующий, если возможно).
- **DoD:** План перевода на сильный bcrypt.

### [SEC-009] Ротация JWT Refresh токенов

- **Priority:** P2 (Medium) | **Est. Time:** 5h
- **Target Files:** `apps/backend-api/src/auth/auth.service.ts`
- **Проблема:** Бесконечные или статичные refresh-токены могут быть украдены.
- **Задачи:**
  1. При каждом использовании refresh-токена генерировать новую пару (Access + Refresh).
  2. Инвалидировать старый refresh-токен в базе данных.
- **DoD:** Украденный refresh-токен можно использовать только один раз (сработает защита Reuse Detection).

### [SEC-010] Механизм принудительного отзыва сессий (Logout Everywhere)

- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/auth/auth.service.ts`, `User` Prisma model
- **Проблема:** Пользователь не может выйти со всех устройств при подозрении на взлом.
- **Задачи:**
  1. Добавить поле `tokenVersion` (Int) в таблицу `User`.
  2. Вшивать `tokenVersion` в payload JWT.
  3. Если версия в токене не совпадает с БД — отклонять запрос. При "Logout Everywhere" делать `tokenVersion++`.
- **DoD:** Сброс пароля или нажатие кнопки "Выйти со всех устройств" моментально инвалидирует все выданные ранее JWT.

# 📋 TODO REFACTOR BACKLOG — Объемная версия (11-20/100)

## 🛡️ Блок: Security - Authorization (RBAC & Rate Limits)

### [SEC-011] Создание Role-Based Access Control (RBAC) Guard'а

- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/auth/guards/roles.guard.ts`
- **Проблема:** В системе нет единого механизма проверки ролей, кроме примитивного `JwtAuthGuard`.
- **Задачи:**
  1. Имплементировать `CanActivate` интерфейс для `RolesGuard`.
  2. Использовать `Reflector` для извлечения необходимых ролей из контекста декоратора `@Roles()`.
  3. Сравнивать `req.user.role` с требуемым массивом ролей.
- **DoD:** `RolesGuard` корректно блокирует запросы и возвращает HTTP 403 Forbidden.

### [SEC-012] Создание декоратора `@Roles`

- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/decorators/roles.decorator.ts`
- **Проблема:** Нет стандартного способа указать требуемую роль для маршрута.
- **Задачи:**
  1. Написать кастомный декоратор: `export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);`.
- **DoD:** Декоратор доступен для импорта и поддерживает строгую типизацию из Prisma enum `RoleName`.

### [SEC-013] Применение RolesGuard на Admin API

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/admin/admin.controller.ts`
- **Проблема:** В данный момент любой пользователь с токеном может делать запросы в админку.
- **Задачи:**
  1. Повесить `@UseGuards(JwtAuthGuard, RolesGuard)` на класс `AdminController`.
  2. Повесить `@Roles(RoleName.ADMIN)` на весь класс.
- **DoD:** Ни один эндпоинт админки не доступен для юзера с `RoleName.USER`.

### [SEC-014] Применение RolesGuard на генерацию изображений (Бан система)

- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/generations.controller.ts`
- **Проблема:** Забаненные пользователи все еще могут вызывать генерации, если их JWT не истек.
- **Задачи:**
  1. Добавить роль `BANNED` в Prisma.
  2. Запретить доступ к `GenerationsController` для пользователей с этой ролью.
- **DoD:** Роль `BANNED` мгновенно отрезает доступ к платному API.

### [SEC-015] Настройка Rate Limiting (DDoS защита)

- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/app.module.ts`
- **Проблема:** Отсутствие лимитов на количество HTTP-запросов (потенциальный DDoS или брутфорс).
- **Задачи:**
  1. Установить `@nestjs/throttler`.
  2. Настроить глобальный лимит (например, 100 запросов в минуту с одного IP).
- **DoD:** При превышении лимита сервер возвращает `429 Too Many Requests`.

### [SEC-016] Специфичный Rate Limit на эндпоинты аутентификации

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`
- **Проблема:** Злоумышленник может брутфорсить `/login`, проверяя 10,000 паролей в секунду.
- **Задачи:**
  1. Настроить жесткий Throttler для `/login` и `/register` (не более 5 попыток в минуту с одного IP).
- **DoD:** Брутфорс паролей экономически и технически нецелесообразен.

### [SEC-017] Внедрение Helmet (HTTP Security Headers)

- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Отсутствие базовых заголовков безопасности (X-XSS-Protection, Strict-Transport-Security).
- **Задачи:**
  1. Установить пакет `helmet`.
  2. Подключить `app.use(helmet())` в `bootstrap()`.
- **DoD:** Инструменты сканирования уязвимостей выдают класс A для HTTP заголовков сервера.

### [SEC-018] Настройка CORS Policy

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Сейчас CORS разрешает запросы с любых источников (`*`), что является уязвимостью.
- **Задачи:**
  1. Настроить CORS: `origin: [process.env.FRONTEND_URL, 'http://localhost:3000']`.
  2. Разрешить только определенные методы (GET, POST, PUT, DELETE).
- **DoD:** Сторонние сайты не могут отправлять AJAX-запросы к нашему API от имени пользователя.

### [SEC-019] Аудит зависимостей (NPM Audit)

- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `package.json`, CI/CD
- **Проблема:** Сторонние npm-пакеты могут содержать известные CVE уязвимости.
- **Задачи:**
  1. Настроить `pnpm audit` в рамках CI/CD пайплайна.
  2. Обновить устаревшие пакеты с критическими уязвимостями.
- **DoD:** В логах сборки отсутствуют предупреждения уровня High и Critical.

### [SEC-020] Изоляция данных пользователей (Tenancy check)

- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** Риск Insecure Direct Object Reference (IDOR). Если юзер передаст `generationId` чужой картинки в метод удаления, он может удалить чужую работу.
- **Задачи:**
  1. Провести ревью всех методов `delete`, `update`, `findOne`.
  2. Убедиться, что везде стоит `where: { id: dto.id, userId: req.user.id }`.
- **DoD:** 100% гарантия, что юзер не имеет доступа к записями других юзеров по прямым ID.

# 📋 TODO REFACTOR BACKLOG — Объемная версия (21-30/100)

## 🏗️ Блок: Architecture - Worker Extraction

### [WRK-021] Настройка NestJS Monorepo структуры

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `nest-cli.json`, `apps/`
- **Проблема:** Текущая структура не предназначена для нескольких самостоятельных приложений.
- **Задачи:**
  1. Выполнить конфигурацию `nest-cli.json` для поддержки monorepo mode.
  2. Настроить директорию `apps/worker`.
- **DoD:** `pnpm run build` успешно компилирует оба приложения по отдельности.

### [WRK-022] Создание точки входа для Worker'а

- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/worker/src/main.ts`, `apps/worker/src/worker.module.ts`
- **Проблема:** Воркер должен стартовать без прослушивания HTTP-порта, чтобы не конфликтовать с основным API.
- **Задачи:**
  1. Создать `main.ts` использующий `createMicroservice` (или просто `createApplicationContext`).
  2. Подключить `BullModule.forRoot()` с доступом к Redis.
- **DoD:** Процесс висит в фоне и не биндит порт 4000.

### [WRK-023] Вынос BullMQ Consumer в пакет Worker

- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Проблема:** Консьюмер (потребитель задач) находится в том же модуле, что и веб-сервер.
- **Задачи:**
  1. Переместить декоратор `@Processor('generations')` из `backend-api` в `worker`.
  2. Убедиться, что `backend-api` теперь только добавляет задачи (`@InjectQueue`).
- **DoD:** При старте API без воркера, задачи накапливаются в Redis. При старте воркера — они мгновенно разгребаются.

### [WRK-024] Разделение зависимостей (OpenAI / Replicate)

- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/worker/src/providers/`
- **Проблема:** Тяжелые SDK для генерации загружаются в память HTTP-сервера.
- **Задачи:**
  1. Переместить классы `OpenAIProvider` и `ReplicateProvider` исключительно в модуль Воркера.
  2. API серверу оставить только контракты (DTO).
- **DoD:** В `apps/backend-api/package.json` удалены библиотеки провайдеров.

### [WRK-025] Устранение блокирующего setTimeout

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Проблема:** Строка `await new Promise(r => setTimeout(r, 30000))` полностью блокирует V8 Thread воркера.
- **Задачи:**
  1. Удалить `setTimeout` из логики обработки (`process()`).
- **DoD:** Воркер обрабатывает задачи мгновенно, без искусственных зависаний потока.

### [WRK-026] Умный delay на стороне Producer'а

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** Удаление `setTimeout` (WRK-025) убрало задержку для Free юзеров. Ее нужно вернуть грамотно.
- **Задачи:**
  1. При вызове `this.queue.add()`, передавать параметр `{ delay: 30000 }`, если тариф юзера `free`.
- **DoD:** BullMQ самостоятельно удерживает задачу в Redis 30 секунд, прежде чем отдать её воркеру.

### [WRK-027] Настройка Retry & Exponential Backoff

- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** Если OpenAI API отвечает `503 Service Unavailable`, задача падает и помечается как `FAILED`. Деньги юзера сгорают.
- **Задачи:**
  1. Настроить в BullMQ: `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`.
- **DoD:** При сетевой ошибке воркер автоматически повторяет запрос через 2с, затем через 4с, затем через 8с.

### [WRK-028] Обработка статуса FAILED с возвратом средств

- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Проблема:** Если задача падает окончательно (3 попытки исчерпаны), списанные кредиты не возвращаются пользователю.
- **Задачи:**
  1. Использовать хук `@OnQueueFailed()` в воркере (или блок `catch` при последней попытке).
  2. Делать вызов сервиса биллинга для возврата (Refund) потраченных кредитов.
- **DoD:** Юзер не теряет кредиты, если генерация упала по вине сервера или провайдера.

### [WRK-029] Имплементация Graceful Shutdown для Воркера

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/worker/src/main.ts`
- **Проблема:** При деплое Kubernetes убивает процесс SIGTERM сигналом, прерывая активную генерацию картинки.
- **Задачи:**
  1. Настроить перехват `SIGTERM`.
  2. Вызывать `app.close()`. BullMQ автоматически дождется завершения активных джобов перед выходом.
- **DoD:** Перезапуск контейнера не обрывает генерации на полпути.

### [WRK-030] Раздельные Docker-контейнеры

- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `docker-compose.prod.yml`, `apps/worker/Dockerfile`
- **Проблема:** Сейчас все крутится в одном контейнере.
- **Задачи:**
  1. Создать отдельный `Dockerfile` (или таргет в multi-stage) для `worker`.
  2. Добавить `ai-worker` сервис в `docker-compose`.
- **DoD:** Команда `docker-compose up --scale ai-worker=3` поднимает 1 API сервер и 3 воркера.

# 📋 TODO REFACTOR BACKLOG — Объемная версия (31-40/100)

## 💾 Блок: Database & Storage (Base64 Migration)

### [DB-031] Развертывание MinIO в инфраструктуре

- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `docker-compose.prod.yml`, `.env.example`
- **Проблема:** Отсутствие объектного хранилища S3.
- **Задачи:** Добавить MinIO в compose, задать креды (Root User/Password), настроить порты 9000 (API) и 9001 (Console).
- **DoD:** MinIO доступен на `localhost:9000`.

### [DB-032] Создание модуля Storage в NestJS

- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/worker/src/storage/storage.module.ts`, `storage.service.ts`
- **Проблема:** Нет кода для общения с S3 API.
- **Задачи:** Интегрировать библиотеку `minio` или `@aws-sdk/client-s3`. Создать метод `uploadImage(buffer: Buffer, filename: string)`.
- **DoD:** Метод успешно загружает Buffer в bucket и возвращает валидный public URL.

### [DB-033] Добавление s3ImageUrl в Prisma

- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** База не готова к новым URL.
- **Задачи:** Добавить поле `s3ImageUrl String?` в модель `Generation`. Создать миграцию `prisma migrate dev`.
- **DoD:** В таблице появилась новая колонка.

### [DB-034] Настройка паттерна Dual-Write в Воркере

- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Проблема:** Переход на S3 должен быть бесшовным.
- **Задачи:** Изменить логику сохранения. Писать `Base64` в `resultImage` и S3 ссылку в `s3ImageUrl` одновременно.
- **DoD:** При генерации новой картинки заполняются обе колонки.

### [DB-035] Модификация API для чтения из S3 (Read-Repair)

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Проблема:** Фронтенд все еще читает старую колонку.
- **Задачи:** В методе, возвращающем историю (Feed), отдавать приоритет S3: `imageUrl: gen.s3ImageUrl || gen.resultImage`.
- **DoD:** Если есть S3 ссылка, фронтенд рендерит ее. Иначе — Base64.

### [DB-036] Скрипт миграции исторических данных

- **Priority:** P0 (Critical) | **Est. Time:** 8h
- **Target Files:** `scripts/migrate-base64.ts`
- **Проблема:** Сотни мегабайт старых Base64 все еще лежат в БД, перегружая TOAST.
- **Задачи:**
  1. Написать скрипт, сканирующий `resultImage` порциями по 100 записей.
  2. Декодировать Base64 в Buffer -> Заливать в S3 -> Обновлять запись в БД.
  3. Выводить прогресс-бар в консоль.
- **DoD:** Скрипт успешно отработал, в базе 0 записей без `s3ImageUrl`.

### [DB-037] Nullify миграция (Удаление старых данных)

- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `scripts/nullify-base64.sql`
- **Проблема:** Записи скопированы, но старые мегабайты все еще занимают место.
- **Задачи:** Выполнить SQL: `UPDATE "Generation" SET "resultImage" = NULL WHERE "s3ImageUrl" IS NOT NULL`.
- **DoD:** Колонка `resultImage` стала пустой у 100% записей.

### [DB-038] Запуск VACUUM FULL в PostgreSQL

- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** Terminal
- **Проблема:** После `UPDATE = NULL` место на диске не освободилось (Postgres оставляет "мертвые кортежи").
- **Задачи:** Запустить `VACUUM FULL "Generation"`. Внимание: блокирует таблицу! Выполнять ночью.
- **DoD:** Размер файла БД на диске уменьшился до нормальных значений (килобайты вместо гигабайт).

### [DB-039] Удаление колонки resultImage из Prisma

- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Задачи:** Удалить старое поле `resultImage`. Создать и применить миграцию.
- **DoD:** Поле физически отсутствует в схеме.

### [DB-040] Оптимизация схемы: Индексы сортировки

- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Запрос `ORDER BY createdAt DESC` сканирует всю таблицу целиком.
- **Задачи:** Добавить `@@index([createdAt(sort: Desc)])`.
- **DoD:** Ускорение выборок ленты в 10-100 раз при больших объемах данных.
