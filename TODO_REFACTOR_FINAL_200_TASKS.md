# 🔥 ПОЛНЫЙ БЭКЛОГ РЕФАКТОРИНГА (200 ЗАДАЧ, УРОВЕНЬ STAFF ENGINEER)

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


# 📋 TODO REFACTOR BACKLOG — Объемная версия (41-50/100)

## 💾 Блок: Database Cleanup & Typings Init

### [DB-041] Настройка Foreign Keys (OnDelete Cascade)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Удаление пользователя невозможно, так как висят связанные транзакции и генерации.
- **Задачи:** Установить `onDelete: Cascade` для таблиц `Generation`, `Transaction`, `Watermark`.
- **DoD:** `prisma db push` успешно применяется, удаление юзера автоматически подчищает его историю.

### [DB-042] Создание индекса для запросов по пользователю
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Задачи:** В таблицу `Generation` добавить `@@index([userId, createdAt(sort: Desc)])`.
- **DoD:** Вкладка "Моя история" на клиенте открывается мгновенно даже при 100 000+ генерациях в БД.

### [DB-043] Внедрение Soft Delete (Опционально)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `packages/database/prisma/schema.prisma`, `backend-api`
- **Проблема:** Случайное удаление данных нельзя восстановить.
- **Задачи:** Добавить поле `deletedAt DateTime?`. Изменить логику сервисов, чтобы они использовали `where: { deletedAt: null }`.
- **DoD:** Записи не удаляются физически, а просто помечаются флагом.

### [TYP-044] Инициализация Workspace пакета shared-types
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `packages/shared-types/package.json`
- **Задачи:** Создать `package.json` с именем `@arrena-photo/shared-types`. Настроить `main` на `dist/index.js` и `types` на `dist/index.d.ts`.
- **DoD:** Пакет виден из корня через `pnpm -w ls`.

### [TYP-045] Настройка tsconfig.json для shared-types
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `packages/shared-types/tsconfig.json`
- **Задачи:** Настроить `compilerOptions`: `declaration: true`, `outDir: "./dist"`, `strict: true`.
- **DoD:** Команда `tsc -b` успешно компилирует типы в папку `dist`.

### [TYP-046] Экспорт Enum'ов из базы данных в shared-types
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `packages/shared-types/src/enums.ts`
- **Проблема:** Фронтенд дублирует строки "PENDING", "COMPLETED" руками.
- **Задачи:** Экспортировать `GenerationStatus`, `RoleName`, `TransactionStatus`.
- **DoD:** Фронтенд использует Enum'ы из пакета, опечатки невозможны.

### [TYP-047] Типизация запроса CreateGenerationRequest
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `packages/shared-types/src/requests/generation.request.ts`
- **Задачи:** Описать интерфейс входящих данных для `/generations` (prompt, aspectRatio, modelId).
- **DoD:** Строгое понимание на фронте, какие ключи можно отправлять.

### [TYP-048] Типизация ответа GenerationResponse
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `packages/shared-types/src/responses/generation.response.ts`
- **Задачи:** Описать структуру возвращаемых данных. Не возвращать приватные поля юзера (пароли и тд).
- **DoD:** Фронтенд точно знает, какие поля вернутся с бэкенда.

### [TYP-049] Интеграция shared-types в frontend
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/package.json`
- **Задачи:** Добавить `"@arrena-photo/shared-types": "workspace:*"` в зависимости. Выполнить `pnpm i`.
- **DoD:** Фронтенд успешно резолвит пакет.

### [TYP-050] Интеграция shared-types в backend-api
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/package.json`
- **Задачи:** Добавить `"@arrena-photo/shared-types": "workspace:*"` в зависимости бэкенда.
- **DoD:** Бэкенд успешно резолвит пакет.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (51-60/100)

## 🛡️ Блок: Strict Types & Class Validator

### [TYP-051] Внедрение ValidationPipe на Бэкенде
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Сейчас контроллеры принимают что угодно, и это летит в базу.
- **Задачи:** Настроить глобальный pipe: `new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- **DoD:** Любые лишние поля в payload будут автоматически отбрасываться сервером или возвращать 400.

### [TYP-052] Создание CreateGenerationDto с валидацией
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/dto/create-generation.dto.ts`
- **Задачи:** Имплементировать интерфейс `CreateGenerationRequest` в виде класса. Добавить `@IsString()`, `@MaxLength(1000)` для поля `prompt`.
- **DoD:** Запрос с prompt > 1000 символов возвращает ошибку 400.

### [TYP-053] Создание DTO для логина и регистрации
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/auth/dto/*.dto.ts`
- **Задачи:** Описать `RegisterDto` (email, password) с `@IsEmail()` и `@MinLength(8)`. Описать `LoginDto`.
- **DoD:** Регистрация с паролем '123' невозможна на уровне фреймворка.

### [TYP-054] Типизация JwtPayload
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `packages/shared-types/src/types/jwt.type.ts`
- **Задачи:** Создать интерфейс для внутренностей токена `{ id, email, role }`.
- **DoD:** Декодер токенов на фронте возвращает типизированный объект.

### [TYP-055] Рефакторинг декоратора @CurrentUser
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/decorators/current-user.decorator.ts`
- **Задачи:** Удалить `any`, типизировать возврат декоратора интерфейсом `JwtPayload`.
- **DoD:** В контроллерах TS подсказывает автокомплитом поля юзера.

### [TYP-056] Внедрение Swagger в NestJS
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Нет документации API для фронтенд разработчиков.
- **Задачи:** Установить `@nestjs/swagger`. Настроить `DocumentBuilder` и запустить на `/api/docs`.
- **DoD:** При переходе на localhost:4000/api/docs открывается интерфейс Swagger.

### [TYP-057] Разметка контроллеров Swagger декораторами
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/**/*.controller.ts`
- **Задачи:** Добавить `@ApiTags()`, `@ApiOperation()`, `@ApiBearerAuth()` ко всем контроллерам.
- **DoD:** В Swagger красиво сгруппированы эндпоинты по разделам (Auth, Generations, Admin).

### [TYP-058] Разметка DTO Swagger декораторами
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/**/*.dto.ts`
- **Задачи:** Использовать `@ApiProperty({ example: 'test@mail.com' })` для всех DTO.
- **DoD:** Swagger генерирует правильные JSON-схемы для примеров запросов.

### [TYP-059] Полная очистка кодовой базы от `any` (Бэкенд)
- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/**/*.ts`
- **Проблема:** В проекте все еще остаются фрагменты с `any` (особенно в сервисах интеграций).
- **Задачи:** Пройтись поиском по `: any` и заменить на конкретные интерфейсы.
- **DoD:** Команда `tsc --noEmit --strict` не выдает ошибок.

### [TYP-060] Типизация Axios клиента на Фронтенде
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/lib/api.ts`
- **Задачи:** Переписать методы `api.post()`, `api.get()` с использованием дженериков: `api.post<GenerationResponse>(...)`.
- **DoD:** В UI компонентах переменная `data` строго типизирована (отсутствует `any`).


# 📋 TODO REFACTOR BACKLOG — Объемная версия (61-70/100)

## ⚛️ Блок: Frontend Refactoring & App Router

### [FE-061] Удаление глобального `'use client'`
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/layout.tsx`, `apps/frontend/app/page.tsx`
- **Проблема:** Все страницы рендерятся на клиенте, убивая преимущества Next.js 14.
- **Задачи:** Убрать `'use client'` с корневых файлов. Провайдеры (Query, Redux) вынести в отдельный `<Providers>` компонент с `'use client'`.
- **DoD:** Корневой Layout — серверный компонент.

### [FE-062] Рефакторинг главной страницы `generate/page.tsx` (Шаг 1)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/generation/PromptSettings.tsx`
- **Задачи:** Выделить логику ввода промпта, выбора модели и aspect-ratio в Dumb Component.
- **DoD:** Компонент полностью независим и принимает состояние через props.

### [FE-063] Рефакторинг главной страницы (Шаг 2)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/generation/ResultViewer.tsx`
- **Задачи:** Вынести область отображения картинки (Skeleton, Image, Error Message) в отдельный компонент.
- **DoD:** Компонент инкапсулирует логику показа результатов.

### [FE-064] Создание хука `useGenerate`
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/hooks/useGenerate.ts`
- **Задачи:** Перенести весь код вызова API, обработки ошибок, запуска поллинга статуса в этот кастомный хук.
- **DoD:** Страница `generate/page.tsx` импортирует 3-4 компонента и хук, становясь читаемой (менее 100 строк).

### [FE-065] Рефакторинг Zustand Auth Store
- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/store/auth.store.ts`
- **Проблема:** Токен хранится в localStorage, что вызывает FOUC при загрузке.
- **Задачи:** Убрать persist middleware для токена. Читать юзера из запроса к `/api/v1/auth/me` при старте приложения (или из серверных кук).
- **DoD:** Токен лежит только в HTTPOnly cookie.

### [FE-066] Настройка Next.js Middleware для приватных роутов
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/middleware.ts`
- **Проблема:** Защищенные роуты рендерятся на клиенте перед редиректом.
- **Задачи:** Написать middleware, проверяющий наличие куки `access_token`. Если нет — редирект `NextResponse.redirect(new URL('/login', request.url))`. Защитить роуты `/generate`, `/profile`, `/billing`.
- **DoD:** Попытка зайти на `/generate` инкогнито мгновенно кидает на логин без загрузки JS.

### [FE-067] SSR на странице Маркетплейса шаблонов
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/app/marketplace/page.tsx`
- **Проблема:** Каталог шаблонов подгружается аяксом, не индексируется Google.
- **Задачи:** Сделать страницу асинхронной: `export default async function Marketplace()`. Делать `fetch` на сервере.
- **DoD:** `curl` запрос страницы маркетплейса возвращает HTML с заполненным списком шаблонов.

### [FE-068] SSR для публичной страницы отдельной генерации
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/g/[id]/page.tsx`
- **Задачи:** Имплементировать страницу `/g/[id]` (расшаренная генерация). Рендерить картинку, промпт и автора на сервере.
- **DoD:** Готовая страница для шеринга в соцсети.

### [FE-069] Оптимизация шрифтов (Next Font)
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/layout.tsx`
- **Проблема:** Шрифты грузятся через внешний CSS, вызывая сдвиг макета (Layout Shift).
- **Задачи:** Использовать `next/font/google`. Загружать шрифты на сервере и прокидывать CSS-переменные.
- **DoD:** Показатель CLS (Cumulative Layout Shift) в Lighthouse равен 0.

### [FE-070] Замена тегов `<img>` на `<Image>`
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/**/*.tsx`
- **Проблема:** Изображения не сжимаются.
- **Задачи:** Заменить `<img>` на `next/image` с настроенным доменом `minio`/`s3`.
- **DoD:** Оптимизация LCP (Largest Contentful Paint) в Lighthouse.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (71-80/100)

## 🔍 Блок: Frontend SEO, i18n & Polishing

### [FE-071] Настройка динамических Meta-тегов (OpenGraph)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/g/[id]/page.tsx`
- **Задачи:** Добавить экспорт функции `generateMetadata({ params })`. Формировать `og:title`, `og:image` на основе данных из БД.
- **DoD:** Отправка ссылки в Telegram отрисовывает превью именно с этой сгенерированной картинкой.

### [FE-072] Внедрение Sitemap.xml генератора
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/sitemap.ts`
- **Задачи:** Написать серверный генератор, который отдает статические роуты и динамические роуты публичных маркетплейс-шаблонов.
- **DoD:** Файл доступен по адресу `/sitemap.xml` и соответствует формату XML.

### [FE-073] Внедрение Robots.txt генератора
- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/robots.ts`
- **Задачи:** Закрыть от индексации `/profile`, `/billing`, `/admin`. Разрешить `/` и `/marketplace`.
- **DoD:** Доступен корректный `/robots.txt`.

### [FE-074] Рефакторинг файлов i18n (Локализация)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/locales/`
- **Проблема:** Захардкоженный текст в компонентах на русском или английском.
- **Задачи:** Просканировать все UI компоненты. Перенести весь текст в словари (`ru.json`, `en.json`, `hy.json`).
- **DoD:** В `return (<div>...</div>)` компонентов нет "сырого" текста, только вызовы `t('key')`.

### [FE-075] Исправление Viewport для a11y (Доступность)
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/layout.tsx`
- **Задачи:** Удалить `maximum-scale=1` и `user-scalable=no` из настроек Viewport.
- **DoD:** Пользователи с нарушениями зрения могут делать зум страницы на смартфонах.

### [FE-076] Обработка 404 (Not Found)
- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/not-found.tsx`
- **Задачи:** Создать кастомную и красивую страницу 404 в стиле приложения (с кнопкой "На главную").
- **DoD:** Переход на несуществующий URL не показывает дефолтную страницу Next.js.

### [FE-077] Обработка 500 (Server Error) на клиенте
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/error.tsx`
- **Задачи:** Создать кастомную Error Boundary с кнопкой "Try again".
- **DoD:** Фатальная ошибка рендера не крашит весь сайт белым экраном.

### [FE-078] Удаление лишних CSS зависимостей (Tailwind Cleanup)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `tailwind.config.js`
- **Задачи:** Настроить `content` пути строго по используемым директориям, чтобы purgeCSS корректно удалял неиспользуемые классы.
- **DoD:** Вес CSS бандла уменьшен.

### [FE-079] Создание Theme Toggle (Dark/Light mode)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/ThemeToggle.tsx`
- **Задачи:** Использовать `next-themes` для бесшовного переключения тем (с поддержкой SSR без моргания).
- **DoD:** Смена темы сохраняется при перезагрузке страницы.

### [FE-080] Анимации для пустых состояний (Empty States)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/history/page.tsx`
- **Задачи:** Добавить красивый заглушечный компонент (иллюстрация + текст), если у пользователя нет истории генераций.
- **DoD:** Пустая история выглядит профессионально и направляет к действию.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (81-90/100)

## 🧪 Блок: QA Automation (Jest, Playwright)

### [QA-081] Установка и конфигурация Jest
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/jest.config.js`
- **Задачи:** Настроить окружение тестирования для NestJS (ts-jest). Написать тестовый мок для глобальных логгеров.
- **DoD:** Jest запускается за секунды и находит файлы `.spec.ts`.

### [QA-082] Создание мока БД (Prisma Mock)
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/test/prisma.mock.ts`
- **Задачи:** Установить `jest-mock-extended`. Написать фабрику `mockDeep<PrismaClient>()`.
- **DoD:** Unit-тесты не требуют реального подключения к PostgreSQL.

### [QA-083] Unit-тест: AuthService (Регистрация)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/auth/auth.service.spec.ts`
- **Задачи:** Написать тест на: 1) успешное создание юзера, 2) провал при дубликате email, 3) успешное хэширование пароля.
- **DoD:** `auth.service.ts` покрыт тестами на 90%.

### [QA-084] Unit-тест: BillingService (Транзакции)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/billing/billing.service.spec.ts`
- **Задачи:** Тест на атомарное списание кредитов (return false, если не хватает). Тест на начисление кредитов.
- **DoD:** `billing.service.ts` покрыт на 100%.

### [QA-085] Unit-тест: RolesGuard
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/guards/roles.guard.spec.ts`
- **Задачи:** Написать тесты на логику проверки массива ролей юзера из `ExecutionContext`.
- **DoD:** Guard гарантированно отбрасывает не те роли.

### [QA-086] Установка и конфигурация Playwright
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `playwright.config.ts`
- **Задачи:** Настроить Chromium/Webkit среды. Установить параметр `webServer` для запуска frontend на `localhost:3000` перед стартом тестов.
- **DoD:** Playwright корректно запускает изолированный браузер.

### [QA-087] E2E тест: Страница Логина и Регистрации
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `tests/e2e/auth.spec.ts`
- **Задачи:** Прокликивание флоу регистрации (ввод email, пароля, submit). Проверка редиректа на страницу `/generate`.
- **DoD:** Автоматический браузер проходит регистрацию.

### [QA-088] E2E тест: Флоу Генерации картинки
- **Priority:** P0 (Critical) | **Est. Time:** 5h
- **Target Files:** `tests/e2e/generation.spec.ts`
- **Задачи:** Мокирование API запроса к бэкенду. Проверка, что после клика "Generate" появляется Loader, а затем картинка-результат.
- **DoD:** Критический путь покрыт стабильным тестом.

### [QA-089] E2E тест: Проверка Admin Panel (Доступ запрещен)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `tests/e2e/admin-security.spec.ts`
- **Задачи:** Авторизоваться как обычный юзер, попробовать перейти на `/admin`. Проверить, что возникает редирект или страница "Доступ запрещен".
- **DoD:** Тест доказывает безопасность админки на клиенте.

### [QA-090] Интеграция Coverage-репортов
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `jest.config.js`
- **Задачи:** Включить `collectCoverage: true`. Настроить `coverageThreshold` (минимум 70% на весь проект).
- **DoD:** Запуск тестов выдает красивую таблицу покрытия. Скрипт падает, если покрытие ниже 70%.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (91-100/100)

## 🚀 Блок: DevOps, CI/CD & Observability

### [DEV-091] Очистка корня проекта (Scripts)
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `/` (Корень проекта)
- **Задачи:** Убрать `send-report.js`, `test.py` и прочий мусор в папку `scripts/tools/`.
- **DoD:** В корне только файлы конфигурации (package.json, tsconfig и т.д.).

### [DEV-092] Написание Multi-Stage Dockerfile для Backend
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/Dockerfile`
- **Задачи:** Написать Stage 1 (builder) и Stage 2 (runner). Устанавливать в runner только production-зависимости.
- **DoD:** Образ бэкенда занимает <250MB и не содержит компиляторов TypeScript.

### [DEV-093] Написание Dockerfile для Worker
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/worker/Dockerfile`
- **Задачи:** Аналогичный билд процесс, но точка запуска `dist/main.js` указывает на воркер-приложение.
- **DoD:** Воркер запускается в изолированном контейнере.

### [DEV-094] Оптимизация docker-compose.prod.yml
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `docker-compose.prod.yml`
- **Задачи:** Добавить сервисы `api`, `worker`, `postgres`, `redis`, `minio`. Настроить `depends_on` с использованием healthchecks.
- **DoD:** Поднятие стека происходит одной командой и без ошибок падений в первые секунды.

### [DEV-095] Интеграция Sentry в Backend API
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/common/filters/sentry.filter.ts`
- **Задачи:** Установить `@sentry/node`. Подключить глобальный фильтр для отправки HTTP 500 исключений.
- **DoD:** Бросание `throw new Error('Test')` отображается в дашборде Sentry.

### [DEV-096] Интеграция Sentry в Frontend (Next.js)
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/sentry.client.config.ts`, `sentry.server.config.ts`
- **Задачи:** Настроить официальный пакет `@sentry/nextjs`. Игнорировать мелкие ошибки (`ResizeObserver loop`).
- **DoD:** Ошибки браузера клиента автоматически прилетают разработчику.

### [DEV-097] Интеграция Prometheus (Метрики)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/app.module.ts`
- **Задачи:** Подключить `@willsoto/nestjs-prometheus`. Открыть эндпоинт `/metrics` (желательно защитить его базовой авторизацией).
- **DoD:** Метрики (CPU, RAM, HTTP запросы) экспортируются сервером.

### [DEV-098] Создание PR-Check пайплайна (GitHub Actions)
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `.github/workflows/pr.yml`
- **Задачи:** Написать workflow для Pull Requests. Запускать: `pnpm lint`, `pnpm typecheck`, `pnpm test:cov`.
- **DoD:** GitHub блокирует слияние веток, если тесты или линтер упали.

### [DEV-099] Создание Deploy пайплайна (GitHub Actions)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `.github/workflows/deploy.yml`
- **Задачи:** Настроить билд Docker-образов при пуше в `main` и деплой на сервер (через SSH или Render Deploy Hook).
- **DoD:** Изменения в коде автоматически (CD) доставляются на продакшен сервер после прохождения тестов.

### [DEV-100] Обновление README.md проекта
- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `README.md`
- **Задачи:** Написать актуальную инструкцию по локальному запуску всего стека (`pnpm install`, `docker-compose up db redis minio`, `pnpm start:dev`).
- **DoD:** Новый разработчик (или AI) может запустить проект локально за 10 минут, просто прочитав README.

---
**[КОНЕЦ 100 ЗАДАЧ БЭКЛОГА]**


# 📋 TODO REFACTOR BACKLOG — Объемная версия (101-110/200)

## ⚡ Блок: Real-time & WebSockets (Отказ от Polling)

### [RT-101] Инициализация WebSocket Gateway в NestJS
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/events/events.gateway.ts`
- **Зависимости:** ARC-002
- **Проблема:** Фронтенд использует HTTP-поллинг каждые 2 секунды для проверки статуса картинки, что убивает сервер.
- **Задачи:**
  1. Установить `@nestjs/websockets` и `@nestjs/platform-socket.io`.
  2. Создать класс `EventsGateway` с декоратором `@WebSocketGateway({ cors: true })`.
  3. Настроить метод `handleConnection` для проверки JWT токена.
- **DoD:** Клиент может успешно установить `ws://` соединение с бэкендом, неавторизованные сокеты сбрасываются.

### [RT-102] Настройка Redis Pub/Sub для WebSocket
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/adapters/redis-io.adapter.ts`
- **Зависимости:** RT-101
- **Проблема:** Если мы запустим несколько инстансов API сервера, сокеты не будут знать друг о друге (Client A подключен к Node 1, а событие пришло на Node 2).
- **Задачи:**
  1. Установить `@socket.io/redis-adapter` и `redis`.
  2. Создать кастомный `RedisIoAdapter`.
  3. В `main.ts` применить `app.useWebSocketAdapter(new RedisIoAdapter(app))`.
- **DoD:** Сообщения транслируются через Redis, обеспечивая горизонтальное масштабирование веб-сокетов.

### [RT-103] Интеграция Воркера с Redis Pub/Sub
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Зависимости:** RT-102
- **Проблема:** Воркер (в отдельном процессе) должен как-то сказать API-серверу, что картинка готова.
- **Задачи:**
  1. При статусе `COMPLETED` в BullMQ, воркер делает `redis.publish('socket-events', JSON.stringify({ userId, event: 'generation.done', payload }))`.
- **DoD:** Сообщения от воркера доходят до API сервера в реальном времени.

### [RT-104] Маршрутизация событий конкретному пользователю
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/events/events.gateway.ts`
- **Зависимости:** RT-103
- **Проблема:** Одно событие не должно улетать всем подключенным клиентам (утечка приватных данных).
- **Задачи:**
  1. При подключении делать `client.join(userId)`.
  2. При получении события из Redis делать `server.to(userId).emit('generation.done', payload)`.
- **DoD:** Пользователь получает уведомление только о своей сгенерированной картинке.

### [RT-105] Интеграция Socket.io на Фронтенде
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/hooks/useSocket.ts`
- **Зависимости:** RT-104
- **Проблема:** На клиенте нет логики работы с WS.
- **Задачи:**
  1. Установить клиентский `socket.io-client`.
  2. Написать хук `useSocket()`, который инициализирует соединение, прокидывая JWT из Cookies.
  3. Добавить слушатель: `socket.on('generation.done', (data) => queryClient.invalidateQueries('history'))`.
- **DoD:** Фронтенд автоматически обновляет UI при готовности картинки без поллинга.

### [RT-106] Демонтаж старого HTTP-поллинга
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/components/generation/GenerationResult.tsx`
- **Зависимости:** RT-105
- **Задачи:** Удалить `setInterval` и рекурсивные вызовы `fetchStatus()` из компонентов. Очистить логику.
- **DoD:** Network Tab в браузере пуст во время ожидания генерации (нет HTTP спама).

### [RT-107] Обработка статуса FAILED через WebSockets
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Зависимости:** RT-103
- **Задачи:** Если генерация падает с ошибкой, отправлять `redis.publish(..., { event: 'generation.failed' })`. На фронте показывать `toast.error('Сбой генерации, кредиты возвращены')`.
- **DoD:** Юзер мгновенно узнает о сбое, не ожидая бесконечно.

### [RT-108] Индикатор прогресса генерации (Progress Bar)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/worker/src/providers/replicate.provider.ts`
- **Зависимости:** RT-103
- **Проблема:** Генерация занимает до 20 секунд, юзер не понимает, зависло ли всё.
- **Задачи:** Если API Replicate/OpenAI поддерживает webhook stream, транслировать прогресс (10%... 50%... 90%) в Redis Pub/Sub -> WebSocket. На фронте менять ширину Progress Bar.
- **DoD:** Пользователь видит плавную полосу загрузки.

### [RT-109] Автоматический реконнект и оффлайн режим
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/hooks/useSocket.ts`
- **Задачи:** Настроить логику `socket.io` на автоматическое восстановление при обрыве интернета. Если сокет упал, временно переключаться на редкий HTTP поллинг (Fallback).
- **DoD:** При плохом мобильном интернете приложение не зависает намертво.

### [RT-110] Метрики WebSockets (Monitoring)
- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/events/events.gateway.ts`
- **Задачи:** Экспортировать метрику `active_websocket_connections` в Prometheus.
- **DoD:** В Grafana видно график текущих одновременных WebSocket подключений (помогает при балансировке).


# 📋 TODO REFACTOR BACKLOG — Объемная версия (111-120/200)

## 🗄️ Блок: Advanced Caching & Redis

### [RED-111] Внедрение CacheManager в NestJS
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/app.module.ts`
- **Задачи:** Установить `@nestjs/cache-manager` и `cache-manager-redis-store`. Подключить в глобальный модуль.
- **DoD:** Сервис `CacheManager` доступен для инъекции через `@Inject(CACHE_MANAGER)` в любом контроллере.

### [RED-112] Кэширование списка шаблонов (Marketplace)
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/templates/templates.controller.ts`
- **Проблема:** Каждый запрос к маркетплейсу дергает PostgreSQL.
- **Задачи:** Добавить `@UseInterceptors(CacheInterceptor)` и `@CacheKey('templates_all')`, `@CacheTTL(3600)` на метод `findAll()`.
- **DoD:** Ответы API по шаблонам отдаются из Redis за <5ms, полностью разгружая БД.

### [RED-113] Инвалидация кэша шаблонов при изменениях
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/admin/admin-templates.controller.ts`
- **Задачи:** При создании, удалении или редактировании шаблона администратором, вызывать `cacheManager.del('templates_all')`.
- **DoD:** Изменения в админке мгновенно появляются на маркетплейсе без ожидания часа.

### [RED-114] Кэширование профиля пользователя (User Profile)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/users/users.service.ts`
- **Проблема:** Метод `GET /auth/me` вызывается при каждом F5 на клиенте.
- **Задачи:** Кэшировать объект профиля юзера по ключу `user_profile:${userId}` на 5 минут. При изменении баланса кредитов (Billing) инвалидировать кэш `cacheManager.del()`.
- **DoD:** Существенное снижение нагрузки на БД при высоком онлайне.

### [RED-115] Настройка Redis Eviction Policy
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `docker-compose.prod.yml`
- **Проблема:** Redis может упасть от нехватки RAM (Out of Memory).
- **Задачи:** Задать флаг при запуске Redis контейнера: `--maxmemory 512mb --maxmemory-policy allkeys-lru`.
- **DoD:** Redis автоматически удаляет старые кэши, если память заканчивается.

### [RED-116] Идемпотентность транзакций оплаты (Redis Locks)
- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/billing/billing.service.ts`
- **Проблема:** Юзер может кликнуть "Оплатить" 10 раз за секунду, вызвав Race Condition при списании/начислении кредитов.
- **Задачи:** Внедрить пакет `redlock` (Redis-based distributed locks). Блокировать мьютекс по ключу `lock:billing:${userId}` на 2 секунды перед транзакцией.
- **DoD:** Невозможно списать баланс дважды при параллельных HTTP-запросах.

### [RED-117] Кэширование DNS и сторонних API ответов
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/providers/stripe.service.ts`
- **Задачи:** Если обращаемся к внешнему API для получения статичных цен (Stripe Prices), кэшировать их в Redis на 24 часа.
- **DoD:** Ускорение чекаута.

### [RED-118] Оптимизация сессий BullMQ (Queue UI)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/admin/bull-board.ts`
- **Задачи:** Подключить `@bull-board/nestjs`. Вывести UI очередей на `/admin/queues` под защитой Basic Auth или Admin Guard.
- **DoD:** Администратор визуально видит зависшие задачи, количество упавших джобов и может перезапустить их кнопкой "Retry".

### [RED-119] Отдельные БД для Cache и BullMQ
- **Priority:** P3 (Low) | **Est. Time:** 1h
- **Target Files:** `.env`
- **Задачи:** Настроить `REDIS_CACHE_URL=redis://localhost:6379/1` и `REDIS_QUEUE_URL=redis://localhost:6379/2`.
- **DoD:** Очистка кэша командой `FLUSHDB` (база 1) не убивает задачи в очереди (база 2).

### [RED-120] Мониторинг RAM потребления Redis
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `docker-compose.prod.yml`
- **Задачи:** Добавить `redis_exporter` для выгрузки метрик в Prometheus.
- **DoD:** В Grafana настроен алерт (Alert), если Redis упирается в 90% доступной памяти.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (121-130/200)

## 🗃️ Блок: Prisma Extensions & Advanced Database

### [DB-121] Внедрение Prisma Extensions (Soft Deletes)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `packages/database/src/client.ts`
- **Задачи:** Использовать новый синтаксис Prisma `prisma.$extends()`. Перехватывать запросы `delete` и `deleteMany`, заменяя их на `update({ deletedAt: new Date() })`.
- **DoD:** Любой разработчик вызывает `.delete()`, но физически данные не удаляются.

### [DB-122] Prisma Extensions: Автоматическое скрытие Soft-Deleted записей
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `packages/database/src/client.ts`
- **Задачи:** В том же Extension перехватывать методы `findMany`, `findUnique`, `findFirst`, автоматически добавляя `where: { deletedAt: null }`.
- **DoD:** Не нужно переписывать весь бэкенд. Удаленные записи магически "исчезают" для всего приложения.

### [DB-123] Таблица Audit Logs (Журнал действий)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Если кто-то удалил шаблон или выдал юзеру 1000 кредитов, невозможно найти крайнего.
- **Задачи:**
  1. Создать таблицу `AuditLog (id, action, userId, targetId, oldData, newData, createdAt)`.
  2. В Prisma Middleware (или Interceptor в Nest) писать лог при всех мутациях в админке.
- **DoD:** Полная прозрачность действий администраторов и системы.

### [DB-124] Партицирование таблицы Generations (Partitioning)
- **Priority:** P3 (Low) | **Est. Time:** 6h
- **Target Files:** `packages/database/prisma/migrations/`
- **Проблема:** Таблица `Generation` растет на миллионы строк в месяц. Скоро индексы перестанут влезать в RAM PostgreSQL.
- **Задачи:** Написать raw SQL миграцию для партицирования таблицы по месяцам (`PARTITION BY RANGE (createdAt)`).
- **DoD:** БД легко переваривает миллионы строк, архивирование старых данных сводится к `DROP PARTITION`.

### [DB-125] Вынос тяжелых JSON в отдельные таблицы
- **Priority:** P2 (Medium) | **Est. Time:** 4h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Колонка `Generation.metadata` (хранящая весь JSON ответ от OpenAI) делает таблицу слишком "широкой" и замедляет выборки ленты (Feed).
- **Задачи:** Вынести JSON в таблицу `GenerationMetadata` со связью 1-to-1.
- **DoD:** Запросы на получение списков (без JOIN'а метаданных) отрабатывают в 2 раза быстрее.

### [DB-126] Database Seeder для тестов (Factory Pattern)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `packages/database/test/factories.ts`
- **Задачи:** Создать утилиты для быстрой генерации mock-данных. Использовать пакет `faker.js`. Функция `UserFactory.create({ credits: 500 })`.
- **DoD:** Написание E2E тестов и наполнение локальной БД сводится к 2-м строкам кода.

### [DB-127] Настройка PgBouncer (Connection Pooling)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `docker-compose.prod.yml`, `.env`
- **Проблема:** NestJS Prisma создает много коннектов к БД. При 10 воркерах и 5 API подах мы упремся в лимит `max_connections` (обычно 100).
- **Задачи:** Добавить контейнер PgBouncer. Настроить Prisma на `postgresql://pgbouncer-url?pgbouncer=true`.
- **DoD:** Количество прямых соединений к Postgres никогда не превышает 20, а PgBouncer держит тысячи клиентских коннектов.

### [DB-128] Настройка Prisma Accelerate / Edge (Опционально)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `packages/database/src/client.ts`
- **Задачи:** Если Vercel Edge Functions будут использоваться для фронтенда, подключить `@prisma/extension-accelerate`.
- **DoD:** Возможность кэшировать запросы БД прямо на глобальных Edge-узлах.

### [DB-129] Перевод UUIDv4 на UUIDv7 (или CUID2)
- **Priority:** P2 (Medium) | **Est. Time:** 4h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Стандартные UUIDv4 не отсортированы по времени, что вызывает фрагментацию индексов (B-Tree) при вставках.
- **Задачи:** Заменить `@default(uuid())` на `@default(cuid())` в Prisma (CUID2) во всех новых таблицах.
- **DoD:** Скорость вставки `INSERT` не деградирует со временем по мере роста таблицы.

### [DB-130] Индекс для Full-Text Search
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `packages/database/prisma/schema.prisma`
- **Проблема:** Поиск шаблонов через `ILIKE '%...%'` не масштабируется.
- **Задачи:** Добавить PostgreSQL GIN индекс для `Template.name` и `Template.description`. Использовать `search` API в Prisma.
- **DoD:** Поиск по сотням тысяч шаблонов выполняется за миллисекунды.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (131-140/200)

## 📱 Блок: API Versioning & Mobile Support

### [API-131] Внедрение версионирования в NestJS (URI Versioning)
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Задачи:** Включить `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })`.
- **DoD:** Все эндпоинты по умолчанию доступны по префиксу `/api/v1/...`.

### [API-132] Отвязка авторизации от HttpOnly Cookie (Для Мобилок)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/auth/jwt.strategy.ts`
- **Проблема:** HttpOnly Cookies (внедренные в SEC-005) отлично работают в браузере, но iOS/Android приложениям проще передавать `Authorization: Bearer <token>`.
- **Задачи:** Изменить JWT Strategy так, чтобы она искала токен ИЛИ в Cookie `access_token`, ИЛИ в заголовке `Authorization`.
- **DoD:** Мобильные приложения (Flutter/React Native) могут использовать наше API без боли с Cookie-менеджерами.

### [API-133] Отвязка от Google OAuth Redirect (Для Мобилок)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/auth/auth.controller.ts`
- **Проблема:** Мобилки делают Google Sign-In на своей стороне через нативный SDK и получают `id_token`. Наш бэкенд этого не понимает.
- **Задачи:** Сделать эндпоинт `POST /api/v1/auth/google/verify-token`, который принимает `id_token` от мобилки, валидирует его через `google-auth-library` и выдает наш JWT.
- **DoD:** Мобильные разработчики могут авторизовать юзера в одно действие.

### [API-134] Pagination Strategy: Переход от Offset к Cursor (Keyset) Pagination
- **Priority:** P2 (Medium) | **Est. Time:** 5h
- **Target Files:** `apps/backend-api/src/generations/generations.controller.ts`
- **Проблема:** Пагинация `skip: 50000, take: 20` в PostgreSQL очень медленная (Offset Scanning).
- **Задачи:** Заменить API получения Feed'а. Вместо `page` и `limit`, принимать `cursor` (ID последней записи) и использовать `take`.
- **DoD:** Бесконечная лента (Infinite Scroll) в мобильном приложении работает быстро и без дублей, даже если во время скролла появляются новые картинки.

### [API-135] Адаптация DTO под строгие проверки мобильных платформ
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/**/*.dto.ts`
- **Задачи:** Использовать `@Transform()` из `class-transformer` для обработки boolean полей (мобилки иногда шлют `?isPublic=true` как строку, а Nest ожидает boolean).
- **DoD:** Отсутствуют ошибки "isPublic must be a boolean" из-за особенностей Android/iOS HTTP-клиентов.

### [API-136] Создание эндпоинта проверки версии (Force Update)
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/system/system.controller.ts`
- **Задачи:** Реализовать `GET /api/v1/system/config`. Возвращать `{ minClientVersion: "1.2.0", maintenanceMode: false }`.
- **DoD:** Мобильное приложение знает, когда нужно заблокировать юзера и попросить обновиться в AppStore.

### [API-137] Поддержка Push Уведомлений (FCM/APNS)
- **Priority:** P2 (Medium) | **Est. Time:** 6h
- **Target Files:** `apps/worker/src/notifications/`
- **Проблема:** WebSockets закрываются, когда мобильное приложение уходит в фон. Юзер не узнает, что картинка сгенерировалась.
- **Задачи:**
  1. Добавить таблицу `DeviceToken` в БД.
  2. Привязать Firebase Admin SDK в воркер.
  3. Отправлять Push, если задача занимала больше 1 минуты.
- **DoD:** Юзер получает уведомление "Твоя картинка готова!" прямо на экран смартфона.

### [API-138] Настройка Compression (Gzip/Brotli)
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Задачи:** Использовать пакет `compression` в NestJS.
- **DoD:** Ответы с массивами JSON (списки шаблонов) сжимаются в 5-10 раз, экономя трафик пользователям мобильного интернета.

### [API-139] Глубокие ссылки (Deep Links / Universal Links)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/.well-known/apple-app-site-association`
- **Задачи:** Настроить AASA файл на фронтенде, чтобы ссылки вида `arrena.ai/g/123` автоматически открывали iOS приложение, если оно установлено.
- **DoD:** Бесшовная интеграция веба и мобилки.

### [API-140] Оффлайн режим (Sync Queue) на клиенте
- **Priority:** P3 (Low) | **Est. Time:** 5h
- **Target Files:** `apps/frontend/lib/offlineSync.ts`
- **Задачи:** Если юзер кликает лайк или удаляет картинку без сети, сохранять действие в IndexedDB. При появлении интернета — делать фоновый sync с бэкендом.
- **DoD:** Приложение ощущается молниеносным ("Optimistic UI"), не блокируется лоадерами.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (141-150/200)

## 🌍 Блок: Internationalization (i18n) & Localization

### [I18N-141] Выбор архитектуры i18n для Next.js App Router
- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/middleware.ts`, `apps/frontend/app/[locale]/layout.tsx`
- **Проблема:** Старые методы i18n из Pages Router не работают корректно в Server Components.
- **Задачи:**
  1. Внедрить пакет `next-intl`.
  2. Перенести все страницы в структуру роутинга с `[locale]` (e.g. `/ru/generate`, `/en/generate`).
  3. Настроить middleware для авто-определения языка по заголовку `Accept-Language` и редиректа на правильный префикс.
- **DoD:** Приложение полностью поддерживает динамический язык URL.

### [I18N-142] Серверная локализация (Server Components i18n)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/[locale]/page.tsx`
- **Задачи:** Использовать функцию `getTranslations()` из `next-intl` внутри серверных компонентов, чтобы они отдавали клиенту уже переведенный HTML (важно для SEO!).
- **DoD:** Исходный HTML содержит правильный текст, пауки поисковиков видят переводы.

### [I18N-143] Клиентская локализация (Client Components i18n)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/**/*.tsx`
- **Задачи:** Использовать хук `useTranslations()` во всех интерактивных `'use client'` компонентах (кнопки, тосты, модалки).
- **DoD:** Ни одной захардкоженной строки в UI-компонентах (например, вместо "Сгенерировать" — `t('generate_btn')`).

### [I18N-144] Локализация SEO Мета-тегов
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/[locale]/layout.tsx`
- **Задачи:** В `generateMetadata({ params: { locale } })` использовать `getTranslations()` для формирования title и description в зависимости от языка.
- **DoD:** В Google появляются раздельные выдачи: для России "Arrena - ИИ Фото", для США "Arrena - AI Photo".

### [I18N-145] Локализация URL-параметров (hreflang)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/[locale]/layout.tsx`
- **Проблема:** Поисковики считают `/ru` и `/en` дубликатами, если нет связи.
- **Задачи:** Добавить теги `<link rel="alternate" hreflang="ru" href=".../ru" />` в `Metadata`.
- **DoD:** Google корректно связывает мультиязычные версии одной страницы.

### [I18N-146] Поддержка языков с другим направлением (RTL) - Опционально
- **Priority:** P4 (Low) | **Est. Time:** 4h
- **Target Files:** `tailwind.config.js`, `apps/frontend/app/[locale]/layout.tsx`
- **Задачи:** Если планируется Арабский язык (AR), добавить `dir="rtl"` в тег `<html>` и использовать Tailwind классы `ms-*`, `me-*` вместо `ml-*`, `mr-*`.
- **DoD:** Интерфейс зеркально отражается без поломки верстки.

### [I18N-147] Локализация ответов Бэкенда (API Messages)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/common/filters/sentry.filter.ts`
- **Проблема:** Бэкенд возвращает `Error: Insufficient credits`, что фронтенд показывает юзеру как есть (на английском).
- **Задачи:**
  1. Бэкенд должен возвращать Error Codes: `{ error: 'INSUFFICIENT_CREDITS' }`.
  2. Фронтенд перехватывает код в Axios Interceptor и показывает локализованный тост `t('errors.insufficient_credits')`.
- **DoD:** Бэкенд остается "языко-независимым" (agnostic), всю локализацию берет фронтенд.

### [I18N-148] Локализация Email писем
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/worker/src/mailer/mailer.service.ts`
- **Задачи:** Письма подтверждения регистрации (Reset Password) должны учитывать язык пользователя (сохраненный в БД `User.locale`). Создать шаблоны на 3-х языках.
- **DoD:** Русский пользователь получает письмо на русском.

### [I18N-149] Интеграция с платформой переводов (e.g., Crowdin, Lokalise)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `package.json`
- **Задачи:** Добавить скрипт для выгрузки словарей `en.json` и автоматической загрузки переведенных `ru.json`, `hy.json`.
- **DoD:** Переводчикам не нужно ковыряться в Git-репозитории.

### [I18N-150] Валидация типов i18n ключей (Strict TypeScript)
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `global.d.ts` (или конфиг `next-intl`)
- **Задачи:** Настроить TypeScript так, чтобы вызов `t('non_existing_key')` подсвечивался как ошибка компиляции.
- **DoD:** Разработчик не может опечататься в ключе перевода.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (151-160/200)

## 🎨 Блок: Advanced SEO, Caching & Performance

### [SEO-151] Настройка Edge Caching (Vercel/Cloudflare)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/marketplace/page.tsx`
- **Задачи:** Использовать Next.js `revalidate` API. Сконфигурировать `export const revalidate = 3600;` на публичных страницах.
- **DoD:** Страницы кэшируются на CDN Edge. TTFB (Time To First Byte) падает до <50ms для посетителей из любых стран.

### [SEO-152] On-Demand Revalidation
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/api/revalidate/route.ts`
- **Задачи:** Написать API эндпоинт во фронтенде. При добавлении шаблона админом, бэкенд дергает этот вебхук, чтобы моментально сбросить кэш конкретной страницы: `revalidatePath('/marketplace')`.
- **DoD:** Кэш вечный (быстрый), но обновляется мгновенно при реальных изменениях.

### [SEO-153] Внедрение JSON-LD Schema (Structured Data)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/marketplace/[slug]/page.tsx`
- **Проблема:** Google не понимает контекст (что это AI шаблон или Изображение).
- **Задачи:** Встроить `<script type="application/ld+json">` с разметкой схемы `SoftwareApplication` или `ImageObject`. Включить рейтинг, цену (Free) и автора.
- **DoD:** В Google Search появляются Rich Snippets (красивые карточки с рейтингом прямо в выдаче).

### [SEO-154] Оптимизация Largest Contentful Paint (LCP)
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/app/page.tsx`
- **Задачи:** Главный Hero-баннер или главная картинка должны загружаться приоритетно. Добавить `priority={true}` в `next/image` для первого экрана. Использовать `fetchPriority="high"`.
- **DoD:** Lighthouse показывает LCP < 2.5 сек.

### [SEO-155] Устранение Layout Shift (CLS) в Сетке шаблонов
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/marketplace/TemplateGrid.tsx`
- **Проблема:** Картинки в masonry-сетке загружаются прыжками, ломая верстку.
- **Задачи:** Задавать жесткий `aspect-ratio` или фиксированные `width/height` для скелетонов (placeholders), которые в точности совпадают с размерами финальной картинки.
- **DoD:** Страница загружается монолитно, элементы не сдвигаются.

### [PERF-156] Подключение Bundle Analyzer
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/next.config.js`
- **Задачи:** Установить `@next/bundle-analyzer`. Найти и удалить огромные библиотеки (например, `moment.js` заменить на `date-fns` или нативный API).
- **DoD:** Размер клиентского JS бандла уменьшен минимум на 20%.

### [PERF-157] Ленивая загрузка тяжелых компонентов (Lazy Loading)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/generate/page.tsx`
- **Задачи:** Использовать `next/dynamic` для импорта тяжелых модалок, тултипов или редакторов (например, React-Cropper для обрезки аватара).
- **DoD:** Эти компоненты грузятся по сети только в момент клика юзером.

### [PERF-158] Оптимизация шрифтов (Preloading)
- **Priority:** P2 (Medium) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/layout.tsx`
- **Задачи:** Убедиться, что критичные шрифты имеют `<link rel="preload">`. `next/font` делает это автоматически, нужно проверить конфигурацию (subsets).
- **DoD:** Нет блокировки рендера из-за загрузки .woff2 файлов.

### [PERF-159] Дедупликация API запросов на сервере
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/lib/api.ts`
- **Задачи:** Использовать React `cache()` для обертки запросов, если несколько серверных компонентов на одной странице делают одинаковый `fetch('/profile')`.
- **DoD:** На сервер бэкенда уходит только 1 HTTP запрос, даже если компонент вызван 5 раз.

### [PERF-160] Настройка Service Worker (PWA)
- **Priority:** P3 (Low) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/next.config.js`
- **Задачи:** Использовать `next-pwa`. Кэшировать статику и шрифты для работы в Offline. Добавить `manifest.json`.
- **DoD:** Приложение можно установить на домашний экран смартфона, оно открывается мгновенно как нативное (без панели браузера).


# 📋 TODO REFACTOR BACKLOG — Объемная версия (161-170/200)

## ✨ Блок: Micro-interactions & UI Polishing

### [UI-161] Внедрение Framer Motion (Анимации)
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/ui/`
- **Проблема:** Интерфейс резкий, появление элементов выглядит "дешево".
- **Задачи:** Обернуть модальные окна, dropdown-меню и тосты в `<motion.div>` с анимациями `opacity` и `y` (сдвиг).
- **DoD:** UI ощущается премиальным и плавным (Wow-эффект).

### [UI-162] Плавные переходы страниц (Page Transitions)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/app/template.tsx` (App Router feature)
- **Задачи:** Использовать файл `template.tsx` в сочетании с Framer Motion для создания Fade-in/Fade-out анимации при навигации между роутами.
- **DoD:** Страницы не "прыгают", а плавно перетекают друг в друга.

### [UI-163] Shimmer Effect для Loading States
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/ui/Skeleton.tsx`
- **Задачи:** Реализовать пульсирующие заглушки (Shimmer Skeletons) для формы генерации, истории и маркетплейса, которые появляются до загрузки данных.
- **DoD:** Вместо крутящегося спиннера юзер видит контуры будущего контента.

### [UI-164] Интерактивный Hover на карточках (Magic Glow)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/marketplace/TemplateCard.tsx`
- **Задачи:** Добавить CSS градиент, который следит за курсором мыши (mouse tracking glow) на карточках генераций.
- **DoD:** Дизайн соответствует топ-уровню (как на сайте Vercel или Linear).

### [UI-165] Toast Notification Manager (Sonner)
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/frontend/app/layout.tsx`
- **Проблема:** Дефолтные аллерты (или старые тосты) перекрывают UI и выглядят плохо.
- **Задачи:** Установить библиотеку `sonner`. Заменить все вызовы `alert()` и старых нотификаций.
- **DoD:** Красивые стекующиеся (stackable) тосты в углу экрана.

### [UI-166] Оптимистичные обновления UI (Optimistic Updates)
- **Priority:** P0 (Critical) | **Est. Time:** 4h
- **Target Files:** `apps/frontend/hooks/useLike.ts`
- **Проблема:** При лайке картинки юзер ждет 1 сек ответа от сервера, прежде чем сердечко закрасится.
- **Задачи:** Использовать функцию `onMutate` в React Query или `useOptimistic` в React 19. При клике МГНОВЕННО закрашивать сердечко, а если сервер вернул ошибку — откатывать состояние назад.
- **DoD:** Приложение ощущается мгновенным (Zero Latency Experience).

### [UI-167] Виртуализация длинных списков (Windowing)
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/history/GenerationList.tsx`
- **Проблема:** У активного юзера 500+ картинок в истории. Рендер 500 узлов DOM убивает браузер.
- **Задачи:** Использовать пакет `@tanstack/react-virtual` (или `react-window`). Рендерить только те 10 карточек, которые сейчас видны на экране.
- **DoD:** Скролл 1000 картинок держит стабильные 60 FPS на слабом смартфоне.

### [UI-168] Защита от потери введенных данных (Unsaved Changes)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/generate/PromptForm.tsx`
- **Задачи:** Если юзер ввел длинный промпт (Prompt) и случайно нажал кнопку "Назад" в браузере или обновил страницу, показывать `window.confirm('Вы не сохранили данные, точно уйти?')`.
- **DoD:** Предотвращение потери контекста и фрустрации пользователя.

### [UI-169] Контекстное меню (Right Click Menu)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/frontend/components/ui/ContextMenu.tsx`
- **Задачи:** Заменить стандартное меню правой кнопки мыши на сгенерированных картинках на кастомное UI меню ("Скачать HD", "Удалить", "Скопировать Промпт", "Сделать приватным").
- **DoD:** Нативный опыт (App-like feel).

### [UI-170] Поддержка Drag and Drop
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/components/generate/ImageToImage.tsx`
- **Задачи:** Реализовать зону (Dropzone) для перетаскивания исходных картинок (для режима Image-to-Image генерации) прямо с рабочего стола юзера.
- **DoD:** Удобный UX без необходимости кликать "Choose file".


# 📋 TODO REFACTOR BACKLOG — Объемная версия (171-180/200)

## 🔒 Блок: Advanced Security (MFA, Limits & Audits)

### [SEC-171] Внедрение Multi-Factor Authentication (MFA / 2FA)
- **Priority:** P2 (Medium) | **Est. Time:** 6h
- **Target Files:** `apps/backend-api/src/auth/mfa.service.ts`
- **Проблема:** Компрометация пароля приведет к потере аккаунта.
- **Задачи:**
  1. Реализовать генерацию TOTP секретов (`otplib`).
  2. Возвращать QR-код (URL `otpauth://`) для Google Authenticator.
  3. Требовать `/verify-totp` при логине, если у юзера `isMfaEnabled == true`.
- **DoD:** Защита аккаунта на банковском уровне.

### [SEC-172] Поддержка WebAuthn (Passkeys / FaceID) - Опционально
- **Priority:** P3 (Low) | **Est. Time:** 8h
- **Target Files:** `apps/backend-api/src/auth/webauthn.service.ts`
- **Задачи:** Внедрить пакет `@simplewebauthn`. Позволить логиниться через отпечаток пальца (TouchID) или FaceID на смартфонах без паролей.
- **DoD:** Логин в один клик без ввода паролей (Passwordless experience).

### [SEC-173] Модуль Audit & Anomaly Detection (Fraud Guard)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `apps/backend-api/src/security/fraud.service.ts`
- **Проблема:** Регистрация 100 аккаунтов для получения Free кредитов (Abuse).
- **Задачи:**
  1. Логировать IP адреса при регистрации.
  2. Блокировать регистрацию, если с одного IP/Subnet создано >5 аккаунтов за день.
- **DoD:** Автоматическая защита от создания ферм (Sybil attacks).

### [SEC-174] Шифрование параметров (Cursor / Pagination)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/common/utils/cursor.util.ts`
- **Проблема:** Юзер видит ID в курсоре `?cursor=UUID` и может угадывать данные.
- **Задачи:** Кодировать cursor payload в Base64 с простой солью (чтобы сделать его Opaque Token).
- **DoD:** Курсор выглядит как `opaque_v1_xyz...` и не раскрывает внутренние ID базы.

### [SEC-175] Strict Transport Security (HSTS) и Cookies Secure Flag
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Задачи:** Убедиться, что `Strict-Transport-Security: max-age=31536000; includeSubDomains` включен. Куки выдаются с `Secure: true` (работают только по HTTPS).
- **DoD:** Атака Man-in-the-Middle (Downgrade to HTTP) невозможна.

### [SEC-176] Защита от перебора OTP-кодов (Email Verification)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/auth/auth.service.ts`
- **Проблема:** 6-значный код верификации почты можно подобрать брутфорсом (10^6 комбинаций).
- **Задачи:** В Redis хранить количество попыток. Максимум 5 попыток, после чего код инвалидируется.
- **DoD:** Брутфорс 6-значного кода статистически невозможен.

### [SEC-177] Усиление Password Policy
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/auth/dto/register.dto.ts`
- **Задачи:** Настроить валидатор: минимум 8 символов, 1 заглавная буква, 1 цифра, 1 спецсимвол. Использовать `zxcvbn` библиотеку для отклонения популярных паролей ("qwerty", "password123").
- **DoD:** Юзер не может создать уязвимый аккаунт.

### [SEC-178] Content Security Policy (CSP) для Frontend
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/frontend/next.config.js`
- **Проблема:** Сайт уязвим к Cross-Site Scripting (XSS), если злоумышленник внедрит `<script src="hacker.com/steal.js">`.
- **Задачи:** Настроить CSP заголовки. Разрешить загрузку скриптов, картинок и коннектов (`connect-src`) ТОЛЬКО с наших доверенных доменов (S3, API, Google Analytics).
- **DoD:** Внедренный чужой JS скрипт просто блокируется браузером.

### [SEC-179] Удаление Stack Traces в Production
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/common/filters/global.filter.ts`
- **Проблема:** Иногда NestJS 500 ошибки могут сливать пути на сервере (`/app/src/...`).
- **Задачи:** В Exception Filter делать жесткий `return { statusCode: 500, message: 'Internal Server Error' }` для `NODE_ENV === 'production'`, без деталей. Детали уходят только в Sentry.
- **DoD:** Сервер молчит о своей внутренней структуре при падениях.

### [SEC-180] Аудит Stripe Webhooks
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/billing/stripe.controller.ts`
- **Проблема:** Хакер может послать POST запрос на `/webhooks/stripe` и "симулировать" успешную оплату, бесплатно пополнив счет.
- **Задачи:** Использовать `stripe.webhooks.constructEvent()` с проверкой подписи `STRIPE_WEBHOOK_SECRET` и Raw Buffer (не распарсенный JSON!).
- **DoD:** Сфабрикованный вебхук отбрасывается с ошибкой `400 Invalid Signature`.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (181-190/200)

## 📡 Блок: APM, Tracing & Advanced Logging

### [LOG-181] Переход на Pino Logger (Высокая производительность)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/main.ts`
- **Проблема:** Дефолтный логгер NestJS (через `console.log`) синхронный и медленный, потребляет CPU при больших нагрузках.
- **Задачи:** Установить `nestjs-pino` и `pino-http`.
- **DoD:** Логи пишутся асинхронно в формате JSON, не блокируя Event Loop.

### [LOG-182] Structured Logging (JSON)
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/logger/logger.module.ts`
- **Задачи:** Настроить Pino так, чтобы логи в stdout были строго в JSON (`{ "level": "info", "msg": "...", "userId": "123" }`).
- **DoD:** Такие системы, как ELK (Elasticsearch/Logstash/Kibana) или Datadog могут легко парсить и фильтровать наши логи.

### [LOG-183] Request ID Tracing (Correlation ID)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/common/middleware/request-id.middleware.ts`
- **Проблема:** В логах каша. Непонятно, какие логи принадлежат одному HTTP-запросу.
- **Задачи:** При входе запроса генерировать `x-request-id` (UUID). Использовать `AsyncLocalStorage` (Node 16+) для прокидывания этого ID во все слои сервисов. Добавлять его в каждый вызов Logger.
- **DoD:** В логах можно сделать поиск по `requestId` и увидеть весь путь от Controller до базы данных.

### [LOG-184] Прокидывание Trace ID в Worker (BullMQ)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/generations/generations.service.ts`
- **Задачи:** При `queue.add()` класть текущий `requestId` в данные джоба. Воркер читает его и инициализирует свой Logger с этим контекстом.
- **DoD:** Единый сквозной трейс: от клика юзера на фронте -> до обработки микросервисом в фоне.

### [LOG-185] Интеграция Sentry Performance Tracing
- **Priority:** P2 (Medium) | **Est. Time:** 3h
- **Target Files:** `apps/backend-api/src/main.ts`, `apps/frontend/sentry.client.config.ts`
- **Задачи:** Включить `tracesSampleRate: 0.1` (10% трейсов) в Sentry. Обернуть медленные методы (вызовы OpenAI, тяжелые SQL) в `Sentry.startTransaction()`.
- **DoD:** В дашборде Sentry появляются графики с указанием, какой участок кода (bottleneck) тормозит запрос больше всего.

### [LOG-186] Скрытие приватных данных (PII Redaction)
- **Priority:** P0 (Critical) | **Est. Time:** 1h
- **Target Files:** `apps/backend-api/src/logger/logger.module.ts`
- **Проблема:** В логи могут случайно попасть пароли, токены или номера карт при дампе Request Body.
- **Задачи:** Настроить в Pino маскировку `redact: ['req.headers.authorization', 'body.password', 'body.token']`.
- **DoD:** В лог-системе (которую могут читать джуниоры) никогда нет секретов `Bearer *****`.

### [LOG-187] Мониторинг времени (Time-to-Generate)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** `apps/worker/src/processors/generation.processor.ts`
- **Задачи:** Замерять время с момента взятия задачи до получения ответа от Replicate. Экспортировать как Histogram-метрику в Prometheus (`generation_duration_seconds`).
- **DoD:** Grafana показывает перцентили (P95, P99) скорости провайдера нейросети. Мы узнаем, если OpenAI начнет тупить.

### [LOG-188] Настройка Uptime Kuma (или Datadog Synthetics)
- **Priority:** P2 (Medium) | **Est. Time:** 2h
- **Target Files:** Внешняя инфраструктура
- **Задачи:** Поднять Uptime Kuma (или другой пингер), который каждые 30 секунд дергает `/api/v1/health`.
- **DoD:** При падении сервера администратору приходит звонок/СМС или пуш в Telegram в течение минуты.

### [LOG-189] Мониторинг баланса сторонних API
- **Priority:** P1 (High) | **Est. Time:** 3h
- **Target Files:** `apps/worker/src/health/api-balance.cron.ts`
- **Проблема:** У нас могут закончиться деньги на счету OpenAI или Replicate, генерации остановятся, а мы узнаем об этом только от злых юзеров.
- **Задачи:** Создать Cron-задачу (каждые 6 часов), которая дергает биллинг-апи провайдеров. Если баланс < $10 — шлет Critical alert в Slack/Telegram.
- **DoD:** Проактивный мониторинг финансов инфраструктуры.

### [LOG-190] Логирование бизнес-метрик (Business Intelligence)
- **Priority:** P3 (Low) | **Est. Time:** 2h
- **Target Files:** `apps/backend-api/src/billing/billing.service.ts`
- **Задачи:** Сделать логирование типа `event: 'USER_UPGRADED', plan: 'PRO', amount: 2000`. Эти логи отправляются в Mixpanel или Amplitude.
- **DoD:** Отдел маркетинга видит конверсии в реальном времени.


# 📋 TODO REFACTOR BACKLOG — Объемная версия (191-200/200)

## 🚢 Блок: Final Deployment, Scale & K8s

### [DEP-191] Миграция с Docker Compose на Docker Swarm (или K8s)
- **Priority:** P2 (Medium) | **Est. Time:** 6h
- **Target Files:** `docker-compose.yml`, `deploy/swarm/`
- **Проблема:** Обычный `docker-compose` не обеспечивает Zero-Downtime deploy на нескольких серверах.
- **Задачи:** Адаптировать конфигурацию для `docker stack deploy` (или написать Kubernetes Deployments).
- **DoD:** Команда `docker service update` обновляет контейнеры по одному (Rolling Update), юзеры не замечают прерывания связи.

### [DEP-192] Настройка Load Balancer / Reverse Proxy (Traefik / Nginx)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `traefik.yml`
- **Задачи:** Развернуть Traefik как Ingress Controller. Настроить автоматическое получение SSL-сертификатов (Let's Encrypt).
- **DoD:** Трафик маршрутизируется к API, Frontend и WebSockets корректно по HTTPS.

### [DEP-193] Настройка Horizontal Pod Autoscaler (HPA) для Воркеров
- **Priority:** P2 (Medium) | **Est. Time:** 4h
- **Target Files:** Infrastructure
- **Проблема:** Ночью серверов нужно мало (хватит 1 воркера), днем при наплыве трафика нужно 20 воркеров.
- **Задачи:** Использовать KEDA (Kubernetes Event-driven Autoscaling). Скейлить поды воркера на основе длины очереди BullMQ в Redis.
- **DoD:** Система автоматически заказывает сервера в облаке и масштабируется, если в очереди больше 100 джобов.

### [DEP-194] База Данных: Настройка Replication (Primary-Replica)
- **Priority:** P3 (Low) | **Est. Time:** 8h
- **Target Files:** `packages/database/src/client.ts`
- **Проблема:** Один PostgreSQL не справляется с чтением истории от 100,000 юзеров.
- **Задачи:** Развернуть Read Replica. В Prisma настроить `@prisma/extension-read-replicas`, чтобы тяжелые GET запросы (Marketplace, History) шли на реплику, а POST/PUT — на Primary.
- **DoD:** Распределение нагрузки БД.

### [DEP-195] Автоматизация бекапов БД (PostgreSQL & MinIO)
- **Priority:** P0 (Critical) | **Est. Time:** 3h
- **Target Files:** `scripts/backup.sh`, Crontab
- **Проблема:** Дата-центр сгорит — проект умрет.
- **Задачи:** Написать скрипт `pg_dump`, заливающий архив в удаленное S3 хранилище (например, AWS или другой провайдер) каждую ночь в 03:00.
- **DoD:** Проверенное и гарантированное восстановление базы из бекапа.

### [DEP-196] Защита от DDoS на уровне DNS (Cloudflare)
- **Priority:** P1 (High) | **Est. Time:** 2h
- **Target Files:** Cloudflare Dashboard
- **Задачи:** Включить проксирование (Оранжевое облако). Настроить WAF (Web Application Firewall) правила: блокировка подозрительных ботов (Bot Fight Mode).
- **DoD:** Синтетические L7 DDoS атаки блокируются до того, как достигнут нашего сервера.

### [DEP-197] CI/CD: Настройка Environments (Staging & Prod)
- **Priority:** P1 (High) | **Est. Time:** 4h
- **Target Files:** `.github/workflows/deploy-staging.yml`
- **Задачи:** Ветка `develop` автоматически деплоится на `staging.arrena.ai`. Ветка `main` деплоится на `arrena.ai` после ручного аппрува (Manual Approval) в GitHub Actions.
- **DoD:** QA инженер может тестировать фичи на отдельном сервере со своей БД, не трогая реальных пользователей.

### [DEP-198] Нагрузочное тестирование (Load Testing)
- **Priority:** P2 (Medium) | **Est. Time:** 5h
- **Target Files:** `tests/load/k6-script.js`
- **Задачи:** Написать скрипт на базе `k6`. Эмулировать 500 одновременных пользователей, авторизующихся и нажимающих "Generate".
- **DoD:** Отчет `k6` доказывает, что система держит 1000 RPS (Requests per second) без потери соединений и 500 ошибок.

### [DEP-199] Удаление Hardcoded IP-адресов
- **Priority:** P1 (High) | **Est. Time:** 1h
- **Target Files:** Весь проект
- **Проблема:** При масштабировании IP адреса узлов меняются динамически.
- **Задачи:** Заменить везде жесткие IP на DNS имена сервисов (например, `redis:6379`, `postgres:5432`, `http://backend-api:4000`).
- **DoD:** Инфраструктура полностью Portable.

### [DEP-200] Финальный Production Release Sign-off
- **Priority:** P0 (Critical) | **Est. Time:** 2h
- **Target Files:** `PRODUCTION_CHECKLIST.md`
- **Задачи:** Сгенерировать, заполнить и проставить галочки во всех пунктах документа `PRODUCTION_CHECKLIST.md`.
- **DoD:** Система готова к приему 1,000,000 пользователей. Запуск рекламной кампании.

---
**[КОНЕЦ ЭКСТЕНДЕД БЭКЛОГА: ЗАДАЧИ 101-200]**


