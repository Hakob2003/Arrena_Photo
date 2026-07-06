# 🤖 GEMINI PROMPT LIBRARY FOR REFACTORING

**Модель:** Gemini 3.1 Pro (High)
**Цель:** Автоматизированное выполнение задач из `TODO_REFACTOR.md` без риска регрессий за счет узкого контекста и жестких ограничений (Constraints).

---

## 🛡️ БЛОК 1: Security & Architecture

### Prompt 1: Внедрение RolesGuard и RBAC

```text
[Role]
Ты — Staff Security Engineer. Твоя задача — внедрить Role-Based Access Control (RBAC) в существующий NestJS проект.

[Context]
Проанализируй файлы:
1. `apps/backend-api/src/auth/guards/jwt-auth.guard.ts` (Для понимания текущей авторизации)
2. `apps/backend-api/src/admin/admin.controller.ts` (Целевой контроллер)
3. `packages/database/prisma/schema.prisma` (Модель User и enum RoleName)

[Constraints]
1. НЕ ломай работу `JwtAuthGuard`. RolesGuard должен работать В ПАРЕ с ним.
2. Создай кастомный декоратор `@Roles()`, используя `SetMetadata`.
3. В RolesGuard используй `Reflector`, чтобы доставать метаданные ролей.
4. Ошибка доступа должна возвращать строго `403 Forbidden` (не 401).
5. Примени декоратор `@Roles('ADMIN')` на весь класс `AdminController`.

[Expected Output]
Выдай полный код для 3 новых файлов (roles.decorator.ts, roles.guard.ts) и обновленный код `admin.controller.ts`. Используй синтаксис diff или полные файлы с комментариями.
```

### Prompt 2: Отказ от Fallback JWT Secret

```text
[Role]
Ты — Backend Architect. Нужно жестко ограничить запуск приложения без переменных окружения.

[Context]
Файлы: `apps/backend-api/src/auth/auth.module.ts`, `apps/backend-api/src/auth/jwt.strategy.ts`, `apps/backend-api/src/main.ts`.

[Constraints]
1. Найди все места, где используется `.get('JWT_SECRET', 'fallback-key')` и удали второй аргумент.
2. В `main.ts` до вызова `NestFactory.create` добавь проверку: если `process.env.JWT_SECRET` пуст или короче 32 символов, бросай фатальную ошибку (`throw new Error(...)`).
3. Код должен падать синхронно при старте, не дожидаясь первого HTTP запроса.

[Expected Output]
Только модифицированные участки кода (Unified Diff) для 3 файлов.
```

### Prompt 3: Выделение Воркера (BullMQ) в микросервис

```text
[Role]
Ты — DevOps / Backend Architect. Твоя задача — разорвать NestJS монолит на 2 процесса.

[Context]
Файлы: `nest-cli.json`, `apps/backend-api/src/app.module.ts`, `apps/backend-api/src/generations/generation.processor.ts`.

[Constraints]
1. Сконфигурируй `nest-cli.json` для поддержки monorepo mode (projects: api, worker).
2. Создай структуру папок для `apps/worker`.
3. Перенеси `generation.processor.ts` в worker.
4. В `worker/src/main.ts` используй `NestFactory.createApplicationContext` (без HTTP сервера).
5. В `backend-api` оставь только логику добавления джобов в очередь (`@InjectQueue`). Никакой логики обработки.

[Expected Output]
Пошаговая инструкция команд `mkdir` и `touch`, плюс содержимое `main.ts` воркера, обновленного `app.module.ts` и `nest-cli.json`.
```

---

## 💾 БЛОК 2: Базы данных и Хранилище (S3)

### Prompt 4: Миграция Base64 -> MinIO/S3 (Воркер)

```text
[Role]
Ты — Senior Backend Engineer. Твоя задача — избавить PostgreSQL от Base64 строк.

[Context]
Файлы: `apps/worker/src/processors/generation.processor.ts`, `packages/database/prisma/schema.prisma`.

[Constraints]
1. В Prisma добавь `s3ImageUrl String?` в модель `Generation`.
2. В воркере реализуй паттерн Dual-Write: сохраняй полученную от нейросети картинку как Buffer, загружай ее через AWS S3 SDK (s3Client.send(new PutObjectCommand...)).
3. В базу записывай одновременно старое поле `resultImage` (Base64) и новое `s3ImageUrl` (URL S3).
4. Предусмотри обработку ошибок сети S3 (try/catch).

[Expected Output]
Обновленная схема Prisma и модифицированный класс `GenerationProcessor`.
```

### Prompt 5: Read-Repair логика на сервере (S3 Fallback)

```text
[Role]
Ты — Senior Backend Engineer. Цель — бесшовно перевести клиентское API на S3 ссылки.

[Context]
Файлы: `apps/backend-api/src/generations/generations.service.ts`.

[Constraints]
1. Фронтенд сейчас ожидает получить из API поле `imageUrl`, которое читается из БД из колонки `resultImage` (Base64).
2. Измени логику маппинга в сервисах (или в interceptor/dto): `imageUrl = dbRecord.s3ImageUrl ? dbRecord.s3ImageUrl : dbRecord.resultImage`.
3. Ни одна строка кода на фронтенде не должна сломаться. Смена Base64 на URL должна быть прозрачной для браузера.

[Expected Output]
Код обновленного `GenerationsService` с фокусом на методах `getFeed` и `findById`.
```

### Prompt 6: Скрипт фоновой миграции Base64 (Node.js)

```text
[Role]
Ты — Database Administrator (DBA). Нужно написать надежный скрипт для миграции старых данных.

[Context]
Требуется написать изолированный скрипт `scripts/migrate-base64.ts`.

[Constraints]
1. Скрипт должен работать батчами (через `take: 100`, `cursor` или `skip`).
2. Для каждой записи, где `s3ImageUrl == null`, конвертировать Base64 в Buffer и заливать в S3.
3. Обновлять запись в БД.
4. Скрипт должен быть идемпотентным (можно прервать `Ctrl+C` и запустить заново без дубликатов).
5. Использовать `Promise.all` с ограничением конкурентности (concurrency limit = 10) для ускорения заливки в S3.

[Expected Output]
Один законченный файл Node.js скрипта, готовый к запуску через `ts-node`.
```

---

## ⚛️ БЛОК 3: Frontend, SSR & SEO

### Prompt 7: Декомпозиция монструозного `generate/page.tsx`

```text
[Role]
Ты — Staff Frontend Engineer (React/Next.js Architect). Задача — применить Component Driven Design.

[Context]
Вставь содержимое файла `apps/frontend/app/generate/page.tsx` (предположим, там 700 строк).

[Constraints]
1. Разбей файл на 4 сущности: `PromptSettingsPanel.tsx`, `ResultViewer.tsx`, кастомный хук `useGenerateAction.ts` и саму страницу `page.tsx`.
2. Страница `page.tsx` должна выполнять только оркестрацию состояния (прокидывать пропсы и вызывать хук).
3. Избегай Props Drilling, используй Zustand или Context, если вложенность превышает 2 уровня.
4. НЕ меняй классы TailwindCSS, сохрани текущий дизайн на 100%.

[Expected Output]
Код 4 файлов с четким разделением ответственности.
```

### Prompt 8: Удаление глобального 'use client' и внедрение SSR

```text
[Role]
Ты — Next.js 14 Expert. Цель — внедрить правильный App Router паттерн.

[Context]
Файлы: `apps/frontend/app/layout.tsx`, `apps/frontend/app/page.tsx`.

[Constraints]
1. В текущем `layout.tsx` на первой строке висит `'use client'`. Это убивает SSR для всего сайта.
2. Убери `'use client'` из `layout.tsx`.
3. Создай отдельный файл `components/Providers.tsx` (в нем будет `'use client'` и обертки `QueryClientProvider`, `ThemeProvider`).
4. В `layout.tsx` импортируй `<Providers>` и оберни `children`.
5. Главная страница `page.tsx` должна стать асинхронной серверной (`export default async function Home()`).

[Expected Output]
Исправленный `layout.tsx`, новый `Providers.tsx` и `page.tsx`.
```

### Prompt 9: Динамическое SEO (OpenGraph Meta)

```text
[Role]
Ты — Technical SEO Specialist. Задача — сделать страницу шаблона идеальной для шаринга в соцсетях.

[Context]
Файл: `apps/frontend/app/marketplace/[slug]/page.tsx`.

[Constraints]
1. Страница использует Server Components.
2. Добавь экспорт функции `export async function generateMetadata({ params }): Promise<Metadata>`.
3. Сделай фетч шаблона по `params.slug` прямо внутри функции.
4. Верни объект Metadata с тегами: `title`, `description`, `openGraph.images`, `twitter.card = 'summary_large_image'`.
5. Убедись, что если fetch вернул `null`, вызывается функция `notFound()`.

[Expected Output]
Код страницы маркетплейса с имплементацией `generateMetadata`.
```

### Prompt 10: Интеграция Next-Intl (Мультиязычность)

```text
[Role]
Ты — Frontend Architect. Задача — внедрить `next-intl` в Next.js 14 (App Router).

[Context]
Настройка локализации для RU, EN, HY языков.

[Constraints]
1. Настрой `middleware.ts` для роутинга с учетом локали (e.g., `/ru/generate`).
2. Напиши обертку `i18n.ts` (по документации next-intl для App Router).
3. Покажи пример перевода серверного компонента `page.tsx` с использованием `getTranslations('Home')`.
4. Покажи пример клиентского компонента `Button.tsx` с использованием хука `useTranslations('UI')`.
5. В `layout.tsx` добавь передачу `locale` в тег `<html lang={locale}>`.

[Expected Output]
Набор базовых конфигурационных файлов для `next-intl` и два примера компонентов.
```

---

## 🛡️ БЛОК 4: Строгая типизация и DTO

### Prompt 11: Создание ValidationPipe и DTO

```text
[Role]
Ты — Senior NestJS Developer. Задача — защитить API от Mass Assignment атак.

[Context]
Файлы: `main.ts`, `generations.controller.ts`, `create-generation.dto.ts`.

[Constraints]
1. В `main.ts` настрой `ValidationPipe` (обязательно: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
2. В DTO используй пакет `class-validator`. Поле `prompt` — строго строка (макс 1000 символов). Поле `aspectRatio` — строго IN (['1:1', '16:9', '9:16']).
3. В контроллере замени `body: any` на `body: CreateGenerationDto`.
4. Код не должен содержать `any`.

[Expected Output]
Фрагмент `main.ts` и полный код `create-generation.dto.ts`.
```

### Prompt 12: Настройка @nestjs/swagger

```text
[Role]
Ты — API Documentator. Цель — сгенерировать OpenAPI доку.

[Context]
Файлы: `main.ts`, любой контроллер и DTO.

[Constraints]
1. В `main.ts` настрой `DocumentBuilder` (добавь Bearer Auth).
2. В контроллере примени `@ApiTags()`, `@ApiOperation()`, `@ApiBearerAuth()`.
3. В DTO примени `@ApiProperty()` для каждого поля, обязательно укажи `example` и `description`.
4. Сделай так, чтобы Swagger UI открывался по `/api/docs`.

[Expected Output]
Код инициализации Swagger и пример размеченного контроллера.
```

### Prompt 13: Создание пакета shared-types (Monorepo)

```text
[Role]
Ты — TypeScript Architect. Цель — расшарить типы между Фронтендом и Бэкендом в PNPM Workspace.

[Context]
Пустая папка `packages/shared-types`.

[Constraints]
1. Напиши `package.json` с именем `@arrena-photo/shared-types`.
2. Напиши строгий `tsconfig.json` (выход в `dist/`, declaration: true).
3. Создай `index.ts`, который экспортирует `CreateGenerationRequest` и `GenerationResponse`.
4. Напиши инструкцию, как добавить этот пакет в зависимости `apps/frontend` через `workspace:*`.

[Expected Output]
Содержимое 3 файлов (`package.json`, `tsconfig.json`, `index.ts`) и shell-команды.
```

---

## 🧪 БЛОК 5: Тестирование (QA & E2E)

### Prompt 14: Настройка Jest с моком Prisma

```text
[Role]
Ты — QA Automation Engineer. Настраиваем Unit-тесты для NestJS.

[Context]
Нужно протестировать `billing.service.ts`, который делает SQL транзакции.

[Constraints]
1. Использовать `jest-mock-extended` для создания `DeepMockProxy<PrismaClient>`.
2. В `Test.createTestingModule` подменить `PrismaService` на мок.
3. Написать тест для `deductCredits(userId, amount)`:
   - Случай 1: `prisma.$executeRaw` возвращает 1 (успешно) -> сервис возвращает `true`.
   - Случай 2: `prisma.$executeRaw` возвращает 0 (не хватает денег) -> сервис возвращает `false`.
4. Проверить вызовы методов через `expect(mock).toHaveBeenCalledWith(...)`.

[Expected Output]
Код `billing.service.spec.ts`.
```

### Prompt 15: Playwright E2E Critical Path

```text
[Role]
Ты — QA Engineer. Пишем критический E2E тест на Фронтенд.

[Context]
Playwright тест `tests/e2e/generation.spec.ts`.

[Constraints]
1. Юзер заходит на `/generate`.
2. Вводит текст в textarea `name="prompt"`.
3. Нажимает кнопку `type="submit"`.
4. ВАЖНО: Мокировать (Intercept) сетевой запрос `POST /api/v1/generations`, чтобы не тратить реальные деньги в OpenAI. Вернуть статус 201 и мок-URL картинки.
5. Ждать, пока на экране появится `<img alt="Generation Result">` и проверить его `src`.

[Expected Output]
Полный код E2E теста с мокированием Route.
```

---

## 🚀 БЛОК 6: DevOps, Sentry, WebSockets

### Prompt 16: Оптимизация Dockerfile (Multi-Stage)

```text
[Role]
Ты — DevOps Engineer. Текущий образ весит 1.5GB, нужно сделать 200MB.

[Context]
Пишем `Dockerfile` для `apps/backend-api` в PNPM монорепе.

[Constraints]
1. Stage 1 (builder): установить ВСЕ зависимости (включая dev), сбилдить nest-приложение.
2. Stage 2 (runner): скопировать `package.json`, установить только `--prod` зависимости.
3. Скопировать папку `dist` из builder'а.
4. Выполнить команду `USER node` перед запуском, чтобы не работать под root (Security Requirement).
5. Использовать `node:20-alpine`.

[Expected Output]
Оптимизированный Dockerfile.
```

### Prompt 17: Интеграция Sentry в NestJS

```text
[Role]
Ты — Backend Engineer. Настройка Observability.

[Context]
Файлы: `main.ts`, `sentry.filter.ts`.

[Constraints]
1. Создать класс `SentryFilter`, наследующий `BaseExceptionFilter`.
2. Перехватывать исключения, вызывать `Sentry.captureException(exception)`.
3. Убедиться, что `super.catch(exception, host)` вызывается, чтобы юзер получил HTTP 500, а не зависший запрос.
4. Если `NODE_ENV === 'development'`, Sentry не должен инициализироваться (чтобы не спамить в дашборд во время локальной разработки).

[Expected Output]
Код Exception Filter'а и его регистрация в `main.ts`.
```

### Prompt 18: Переход с HTTP Polling на WebSockets

```text
[Role]
Ты — Fullstack Architect. Устраняем DDoS от собственных клиентов.

[Context]
Бэкенд: `EventsGateway` (NestJS). Фронтенд: хук `useSocket` (Next.js/React).

[Constraints]
1. На бэкенде напиши Gateway, который при коннекте делает `client.join(userId)`.
2. Добавь метод, который шлет `server.to(userId).emit('generation.done', payload)`.
3. На фронтенде напиши хук `useSocket`, который подключается к `process.env.NEXT_PUBLIC_WS_URL`.
4. В хуке слушай событие `generation.done` и вызывай коллбэк (например, для инвалидации кэша React Query).
5. На фронте настрой авто-реконнект.

[Expected Output]
Код Gateway для бэкенда и кастомного хука для фронтенда.
```

### Prompt 19: GitHub Actions CI Pipeline (PR Checks)

```text
[Role]
Ты — DevOps Engineer. Настраиваем защиту ветки `main`.

[Context]
Файл `.github/workflows/pr-check.yml`.

[Constraints]
1. Запускается на события `pull_request` в ветку `main`.
2. Использует `pnpm` (pnpm/action-setup).
3. Шаги: Checkout -> Установка Node.js -> Установка зависимостей с кэшем -> `pnpm lint` -> `pnpm typecheck` (tsc) -> `pnpm test:cov`.
4. Сборка должна падать (exit code 1), если тесты или линтер фейлятся.

[Expected Output]
YAML файл GitHub Actions пайплайна.
```

### Prompt 20: Prisma Extension (Авто-скрытие удаленных записей)

```text
[Role]
Ты — Database Expert. Внедряем Soft Delete прозрачно для всего проекта.

[Context]
Файл `packages/database/src/client.ts`. У всех моделей есть поле `deletedAt DateTime?`.

[Constraints]
1. Используй `prisma.$extends()`.
2. Перехвати (intercept) методы `findMany`, `findFirst`, `findUnique`.
3. Автоматически инжектируй в запрос `where: { deletedAt: null }`, не стирая оригинальный объект `where`, переданный разработчиком.
4. Перехвати методы `delete` и `deleteMany`, заменяя их выполнение на `update({ data: { deletedAt: new Date() } })`.

[Expected Output]
Код инициализации инстанса PrismaClient с настроенным Extension.
```

---

**[КОНЕЦ БИБЛИОТЕКИ ПРОМПТОВ]**
