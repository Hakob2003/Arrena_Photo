# 🔥 ПОЛНЫЙ БЭКЛОГ РЕФАКТОРИНГА (100 ЗАДАЧ)

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


