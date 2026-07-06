# 🔍 AUDIT_REPORT — Arrena Photo (AI Template Studio)

**Дата:** 2026-06-30  
**Уровень:** Staff Engineer / Architecture Review  
**Цель:** Production readiness для масштабируемого коммерческого SaaS

---

## 1. АРХИТЕКТУРА

### 1.1 Структура проекта — ⭐ 7/10

**Плюсы:**

- Monorepo с pnpm workspaces — правильный подход для SaaS
- Разделение на `apps/backend-api`, `apps/frontend`, `packages/database`, `packages/shared-types`
- NestJS модульная архитектура на бэкенде
- Next.js App Router на фронтенде

**Проблемы:**

#### 🔴 CRITICAL — Файловый мусор в корне и в apps/backend-api

**Описание:** В корне проекта и в `apps/backend-api/` находятся десятки скриптов-одноразовок: `check_deployed.js`, `check_generate.js`, `fix.js`, `test_import.js`, `send-report.js`, `send-screenshot.js`, `take-screenshot.js`, `extract_logo.py`, `check_prod.js`, `check_prod_errors.js`, `test_prod.js`, `check_nav.js`, а также `test-watermark.js`, `test-opacity.js`, `test-watermark-gradient.js`, `test-watermark-logo.js`, `update-prompts.js`, `downgrade.ts`, `watermark_test*.jpg`, `prod_screenshot.png`, `screenshot*.png`, `prompts_catalog_100plus.csv` и другие.

**Почему проблема:** Загрязняет репозиторий, путает новых разработчиков, ломает сборку TypeScript (мы уже столкнулись с проблемой `dist/main.js` из-за `downgrade.ts`). Некоторые содержат хардкод URL и токены.

**Последствия:** Утечка данных, нестабильная сборка, снижение maintainability.

**Как исправить:** Удалить все файлы-одноразовки или вынести их в `scripts/` с `.gitignore`.

---

#### 🟡 HIGH — Worker пакет пустой

**Описание:** `apps/worker/` содержит только `README.md`. Вся обработка очередей BullMQ встроена в бэкенд (`generation.processor.ts`).

**Почему проблема:** Нарушает декларированную архитектуру. При масштабировании невозможно отдельно масштабировать воркеры.

**Последствия:** При высокой нагрузке бэкенд-сервер обслуживает и HTTP, и тяжёлые задачи генерации одновременно. Один упавший job может повлиять на API.

**Как исправить:** Вынести `GenerationProcessor` в отдельный `apps/worker`, который подключается к Redis и обрабатывает очередь.

---

#### 🟡 HIGH — `packages/shared-types` и `packages/ui-kit` пустые/не используются

**Описание:** Созданы, но не содержат shared-типов. Фронтенд дублирует типы через `any`.

**Как исправить:** Определить общие DTO/типы в `shared-types` и импортировать в оба приложения.

---

## 2. БЕЗОПАСНОСТЬ

### 🔴🔴 CRITICAL — Хардкод пароля админа в исходном коде

**Файл:** `auth.service.ts:87`

```typescript
const adminHash =
  "$2a$10$EAlG/EoWQ9dTZ8JiIaeAY.k5IDkxmz.HT0EKpq.y2ZI9.H1bkUV9S"; // admin123
```

**Почему проблема:** Пароль `admin123` захардкожен и задокументирован комментарием. Любой с доступом к коду может войти как админ.

**Последствия:** Полный захват системы через `GET /v1/auth/setup-admin`.

**Критичность:** 🔴 CRITICAL

**Как исправить:**

1. Удалить эндпоинт `setup-admin` или защитить его одноразовым токеном из env.
2. Генерировать пароль из переменной окружения.
3. Немедленно сменить пароль в production.

---

### 🔴🔴 CRITICAL — Эндпоинт /auth/setup-admin доступен без аутентификации

**Файл:** `auth.controller.ts:38-42`

**Описание:** Любой может вызвать `GET /v1/auth/setup-admin` и создать/перезаписать учётную запись админа.

**Последствия:** Злоумышленник может получить полный контроль над системой.

**Как исправить:** Удалить в production или ограничить гвардом + секретным токеном.

---

### 🔴 CRITICAL — Admin контроллер без проверки роли

**Файл:** `admin.controller.ts:9`

```typescript
@UseGuards(JwtAuthGuard)  // ← Только аутентификация, БЕЗ проверки роли!
```

**Описание:** Любой аутентифицированный пользователь (не только ADMIN) может выполнять все административные действия: банить пользователей, менять тарифы, удалять модели, начислять кредиты.

**Последствия:** Privilege escalation. Рядовой пользователь получает полный админ-доступ.

**Как исправить:**

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN)
```

---

### 🔴 CRITICAL — JWT секрет с fallback на статическую строку

**Файлы:** `auth.module.ts:19`, `jwt.strategy.ts:16`

```typescript
secret: config.get("JWT_SECRET", "super-secret-key-change-me-in-production");
```

**Описание:** Если `JWT_SECRET` не задан в env, используется статический fallback. Все JWT-токены могут быть подделаны.

**Как исправить:** Выбросить ошибку при старте, если `JWT_SECRET` не задан. Никаких fallback.

---

### 🔴 CRITICAL — Токен JWT передаётся в URL при OAuth callback

**Файл:** `auth.controller.ts:62`

```typescript
res.redirect(`${...}/login?token=${access_token}`);
```

**Описание:** Токен утекает через URL: логи сервера, Referer-заголовки, история браузера.

**Как исправить:** Использовать одноразовый код (authorization code flow) — обмен на токен через POST.

---

### 🟡 HIGH — Нет ENCRYPTION_KEY в .env.example

**Описание:** `EncryptionUtil` требует `ENCRYPTION_KEY` (32 символа), но в `.env.example` его нет. Если не задан — runtime crash.

**Как исправить:** Добавить в `.env.example`, валидировать при старте приложения.

---

### 🟡 HIGH — OAuth токены хранятся как plain text в БД

**Файл:** `schema.prisma:152-153`

```
accessToken  String?
refreshToken String?
```

**Как исправить:** Шифровать через `EncryptionUtil`.

---

## 3. КАЧЕСТВО КОДА

### 🔴 CRITICAL — Массовое использование `any` (~50+ мест)

**Описание:** По всему бэкенду: `req: any`, `data: any`, `body: any`, `user: any`. На фронте: `useState<any[]>` повсеместно.

**Последствия:** Потеря type-safety, баги которые TypeScript должен ловить на компиляции. Делает TS бессмысленным.

**Как исправить:** Создать proper DTO/interfaces. Для контроллеров использовать `@CurrentUser()` декоратор с типизированным `User`.

---

### 🟡 HIGH — Дублирование кода маппинга генераций

**Файлы:** `generations.service.ts:152-171` и `generations.service.ts:264-285`

**Описание:** Логика маппинга `imageUrl`, `driveFileId`, `drivePathPrefix` дублируется в `getHistory` и `getFeed`.

**Как исправить:** Извлечь в `private mapGenerationResult()`.

---

### 🟡 HIGH — Дублирование JWT decode на фронтенде

**Файлы:** `ClientLayout.tsx:54-61`, `login/page.tsx:26-33`, `login/page.tsx:57-60`

**Описание:** Одна и та же логика `JSON.parse(atob(token.split('.')[1]))` повторяется 3+ раза.

**Как исправить:** Создать утилиту `parseJwtPayload(token)`.

---

### 🟢 MEDIUM — `generate/page.tsx` — 687 строк

**Описание:** Монолитный компонент. Содержит логику генерации, UI, состояние, API-вызовы, dropzone, fullscreen, cancel modal — всё в одном файле.

**Как исправить:** Декомпозировать на: `GenerationForm`, `GenerationResult`, `GenerationHistory`, `CancelModal`, `useGeneration` hook.

---

## 4. БАЗА ДАННЫХ

### 🟡 HIGH — Нет индекса на `Generation.createdAt`

**Описание:** Feed и history сортируют по `createdAt DESC`. Без индекса — full table scan при масштабировании.

**Как исправить:**

```prisma
@@index([createdAt])
@@index([userId, createdAt])
```

---

### 🟡 HIGH — Отсутствие soft-delete

**Описание:** `deleteUser`, `deleteTemplate` — жёсткое удаление. Данные невосстановимы.

**Как исправить:** Добавить `deletedAt DateTime?` + фильтр `where: { deletedAt: null }`.

---

### 🟢 MEDIUM — Нет миграций, используется `prisma db push`

**Описание:** `render.yaml:29` — `prisma db push --accept-data-loss`. В production это опасно.

**Как исправить:** Перейти на `prisma migrate deploy`.

---

## 5. ПРОИЗВОДИТЕЛЬНОСТЬ

### 🔴 CRITICAL — Base64 изображения хранятся в БД

**Файл:** `generation.processor.ts:132`

```typescript
finalImageUrl = `data:image/jpeg;base64,${base64String}`;
```

**Описание:** Watermarked images сохраняются как base64 строки в PostgreSQL (`GenerationResult.imageUrl`). Одно изображение ~500KB-2MB в base64.

**Последствия:** БД раздувается экспоненциально. Запросы на feed/history тянут мегабайты текста. PostgreSQL не предназначен для blob storage.

**Как исправить:** Загружать watermarked buffer в S3/MinIO, хранить URL.

---

### 🟡 HIGH — Искусственная задержка генерации

**Файл:** `generation.processor.ts:82-88`

```typescript
let delayMs = 30000; // FREE plan: 30 секунд
await new Promise((resolve) => setTimeout(resolve, delayMs));
```

**Описание:** Для FREE плана добавляется 30-секундный `setTimeout`. Это тратит ресурсы сервера (worker заблокирован на 30 сек, делая ничего).

**Как исправить:** Использовать `delay` опцию BullMQ при добавлении в очередь, а не блокировать worker.

---

### 🟡 HIGH — Feed загружает 50 записей без пагинации

**Файл:** `generations.service.ts:248` — `take: 50`, без `skip`, без cursor-based pagination.

**Как исправить:** Добавить пагинацию и infinite scroll.

---

### 🟢 MEDIUM — Нет кэширования на бэкенде

**Описание:** Каждый запрос на `/generations/models`, `/auth/me`, `/billing` идёт напрямую в PostgreSQL.

**Как исправить:** Добавить Redis-кэш для частых read-запросов.

---

## 6. REACT / NEXT.JS

### 🟡 HIGH — Все страницы — client-side ('use client')

**Описание:** Даже страницы, которые могут быть SSR/SSG (landing, feed, templates), помечены как `'use client'`. Это убивает SEO и увеличивает bundle size.

**Как исправить:** Landing page, templates catalog, feed — делать Server Components с клиентскими интерактивными островками.

---

### 🟡 HIGH — Нет React.memo / useMemo для тяжёлых списков

**Описание:** Списки карточек в feed, gallery, templates — перерендериваются при каждом изменении state.

---

### 🟢 MEDIUM — Двойной Toaster

**Файл:** `layout.tsx:35` (`<Toaster />` от sonner) + `ClientLayout.tsx:8` (`<Toaster />` от react-hot-toast). Два toast-системы одновременно.

**Как исправить:** Выбрать одну.

---

## 7. SEO

### 🔴 CRITICAL — Практически полное отсутствие SEO

- **Нет** `robots.txt`
- **Нет** `sitemap.xml`
- **Нет** Open Graph метаданных
- **Нет** структурированных данных
- **Нет** canonical URL
- Title статический: `"AI Template Studio | Premium SaaS"` — одинаковый на всех страницах
- Все страницы — `'use client'`, контент не виден поисковикам

**Как исправить:** Добавить `app/robots.ts`, `app/sitemap.ts`, per-page `generateMetadata()`, OG-изображения.

---

## 8. ТЕСТИРОВАНИЕ

### 🔴 CRITICAL — Тесты полностью отсутствуют

- 0 unit tests
- 0 integration tests
- 0 E2E tests
- Playwright установлен как devDependency, но нет ни одного test-файла

**Покрытие: 0%**

---

## 9. ACCESSIBILITY

### 🟡 HIGH — Частичная accessibility

- `aria-label` добавлены на некоторые кнопки (сделали ранее)
- `alt` тексты добавлены на некоторые изображения
- `:focus-visible` стили добавлены
- **Но:** нет ARIA для модалок, нет skip-links, нет keyboard navigation для dropdowns, нет announcements для screen readers
- `userScalable: false` в viewport — нарушение WCAG 1.4.4

---

## 10. DevOps

### 🟡 HIGH — CI/CD без тестов и линтинга

**Файл:** `.github/workflows/deploy.yml`

**Описание:** Pipeline: checkout → SSH → git pull → docker-compose up. Нет шагов: lint, typecheck, test, build-check.

**Как исправить:** Добавить `pnpm tsc --noEmit && pnpm test` перед деплоем.

---

### 🟡 HIGH — Render Free plan limitations

**Описание:** Все сервисы на `plan: free`. Render free tier: автосон через 15 мин неактивности, 750 часов/месяц.

**Последствия:** Cold starts 30-60 секунд. Не годится для production SaaS.

---

## 11. AI-ЧАСТЬ

### 🟡 HIGH — Авто-создание моделей и провайдеров

**Файл:** `generations.service.ts:29-44`

**Описание:** Если AI модель не найдена, она создаётся автоматически с `isFree: true`. Если нет провайдера — создаётся «Mock Provider».

**Последствия:** Засорение БД фантомными записями. Пользователь может генерировать с несуществующими моделями.

**Как исправить:** Убрать auto-create, выбросить 404.

---

### 🟡 HIGH — `(global as any).usePicsumMock`

**Файл:** `generation.processor.ts:68,74`

**Описание:** Глобальная переменная для переключения mock-режима. Не конфигурируема, не персистентна.

**Как исправить:** Использовать environment variable.

---

## 12. ЗАВИСИМОСТИ

### 🟡 HIGH — Устаревшие пакеты

| Пакет         | Текущая  | Проблема                                                   |
| ------------- | -------- | ---------------------------------------------------------- |
| `react-query` | `3.39.3` | Deprecated, переименован в `@tanstack/react-query` v5      |
| `eslint`      | `10.5.0` | Несовместим с `eslint-config-next` (ошибка в логах сборки) |

### 🟢 MEDIUM — Дублирующие зависимости

- `react-hot-toast` + `sonner` — два toast-системы
- `@headlessui/react` + `@base-ui/react` + shadcn — три UI-системы

---

## 13. UI/UX

### 🟢 MEDIUM — Нет глобального Error Boundary с красивым UI

### 🟢 MEDIUM — Захардкоженные тексты на разных языках

**Описание:** Встречаются: `'Нельзя сделать просроченную карту основной'`, `'Карта не найдена'`, `'Ошибка оплаты'` — в бэкенде на русском. На фронте тоже встречаются незатянутые через i18n.

---

## 14. ОЦЕНКИ (1-10)

| Категория          | Оценка       |
| ------------------ | ------------ |
| Архитектура        | 6            |
| Frontend           | 6            |
| Backend            | 5            |
| Безопасность       | **2**        |
| Производительность | 5            |
| UX                 | 7            |
| UI                 | 8            |
| Accessibility      | 4            |
| Масштабируемость   | 4            |
| Поддерживаемость   | 5            |
| Качество кода      | 4            |
| Тестирование       | **1**        |
| **Общая оценка**   | **4.7 / 10** |

---

## 15. PRODUCTION READINESS

### ❌ Нельзя выкатывать в production

**Блокирующие проблемы (CRITICAL):**

1. **Открытый `/auth/setup-admin`** — любой может стать админом
2. **Admin API без проверки роли** — любой пользователь = админ
3. **Хардкод пароля админа** в исходном коде (`admin123`)
4. **JWT секрет с fallback** — токены подделываемы
5. **Base64 изображения в PostgreSQL** — БД взорвётся
6. **0% тестов** — невозможно гарантировать стабильность
7. **Полное отсутствие SEO** — проект невидим для поисковиков

---

## 16. ИТОГ

### 1. Допустил бы ты этот проект в production?

**Нет.** 7 критических проблем безопасности и архитектуры делают это невозможным.

### 2. Допустил бы после исправления только критических?

**Условно да**, для ограниченной beta с < 100 пользователей. Для масштабного запуска нужно исправить также HIGH-проблемы.

### 3. Нанял бы ты разработчика, написавшего этот код?

**Junior+ / Middle.** Видно понимание архитектурных концепций (monorepo, RBAC, BullMQ, providers). Но критические пробелы в безопасности, полное отсутствие тестов и злоупотребление `any` указывают на недостаток production-опыта.

### 4. Три самые сильные стороны:

1. **UI/UX дизайн** — визуально привлекательный, анимации, два скина (Luxury/Neon), responsive
2. **Продуктовая полнота** — auth, billing, marketplace, templates, AI generation, admin panel, i18n
3. **Инфраструктурная зрелость** — Docker Compose, Prometheus, Grafana, Render deploy, BullMQ

### 5. Пять самых серьёзных проблем:

1. **Безопасность** — открытый setup-admin, admin без ролей, JWT fallback
2. **0 тестов** — абсолютный стоп-фактор для production
3. **Base64 в PostgreSQL** — архитектурный антипаттерн, БД не масштабируется
4. **Массовый `any`** — TypeScript используется формально, не защищает
5. **Нет разделения API/Worker** — вертикальное масштабирование невозможно
