Для Antigravity IDE действительно лучше разбить проект на несколько крупных этапов. Тогда ИИ не будет пытаться создать тысячи файлов сразу и качество кода будет выше.

## Этап 1. Архитектура и база данных

Создай архитектуру SaaS-платформы AI Template Studio.

Основная идея:
Пользователь загружает фото, выбирает шаблон, выбирает AI-модель, запускает генерацию и получает результат.

Технологии:

Frontend:

* Next.js 15
* TypeScript
* TailwindCSS
* Shadcn UI

Backend:

* NestJS
* Prisma
* PostgreSQL
* Redis
* BullMQ

Требуется:

1. Спроектировать всю архитектуру проекта.
2. Создать полную структуру директорий.
3. Создать Prisma Schema.
4. Создать ER Diagram.
5. Создать SQL миграции.
6. Создать модели:

User
Role
Session
Template
TemplateCategory
TemplateTag
TemplateVersion
Generation
GenerationResult
AIProvider
AIModel
AIConnection
StorageProvider
StorageConnection
MarketplaceItem
Purchase
Subscription
CreditTransaction
Review
Notification
AuditLog

7. Учесть мультитенантность.
8. Учесть RBAC.
9. Учесть масштабирование.
10. Подготовить архитектуру для тысяч шаблонов и миллионов генераций.

Сгенерируй production-ready архитектуру без упрощений.

---

## Этап 2. Backend API

Используя ранее созданную архитектуру и Prisma Schema, создай полный backend.

Технологии:

* NestJS
* Prisma
* PostgreSQL
* Redis
* BullMQ
* JWT
* Swagger

Создай:

Auth Module
Users Module
Roles Module
Templates Module
Marketplace Module
Generation Module
AI Providers Module
Storage Module
Admin Module
Analytics Module
Billing Module
Notification Module

Реализуй:

* JWT авторизацию
* OAuth
* RBAC
* Rate Limiting
* Audit Logs
* API Versioning
* Swagger OpenAPI

Создай:

* DTO
* Services
* Controllers
* Guards
* Interceptors
* Validators
* Error Handling

Генерация изображений должна работать через очередь BullMQ.

Подготовь код production уровня.

---

## Этап 3. AI-интеграции

Создай систему подключения AI-провайдеров.

Поддержать:

OpenAI
Google Gemini
Google Imagen
Claude
DeepSeek
Qwen
Grok
Mistral
Stability AI
Black Forest Labs FLUX
Replicate
Fal AI
Hugging Face
ComfyUI
Automatic1111
Forge
Fooocus
InvokeAI
RunPod

Требования:

1. Единый интерфейс провайдера.
2. Подключение через API ключи пользователя.
3. Проверка доступности модели.
4. Получение списка моделей.
5. Генерация изображений.
6. Обработка ошибок.
7. Ограничение скорости запросов.
8. Логирование.
9. Возможность добавлять новые провайдеры без изменения существующего кода.

Использовать паттерны:

* Strategy
* Factory
* Adapter

Создать полностью рабочую архитектуру.

---

## Этап 4. Система шаблонов

Создай модуль шаблонов.

Каждый шаблон должен содержать:

* название
* описание
* категория
* теги
* обложка
* галерея
* промт
* негативный промт
* настройки модели
* рекомендуемые модели
* автор
* версия

Поддержать категории:

Anime
Realistic
Disney
Pixar
Marvel
Cyberpunk
Fantasy
LinkedIn
Business
Wedding
Fashion
Gaming
Pixel Art
Product Photography
Logo
Banner
YouTube Thumbnail
Instagram
TikTok

Функции:

* создание
* редактирование
* публикация
* архивирование
* версии
* импорт
* экспорт
* поиск
* фильтрация
* рекомендации

Сгенерировать весь backend код.

---

## Этап 5. Маркетплейс шаблонов

Создай Marketplace для шаблонов.

Возможности:

* бесплатные шаблоны
* платные шаблоны
* рейтинги
* отзывы
* коллекции
* избранное
* подписка на авторов

Для авторов:

* статистика продаж
* статистика скачиваний
* аналитика
* управление товарами

Для администрации:

* модерация
* жалобы
* блокировки
* выплаты

Создай полный backend и frontend код маркетплейса.

---

## Этап 6. Frontend

Создай frontend уровня Midjourney.

Технологии:

* Next.js 15
* TypeScript
* TailwindCSS
* Shadcn UI
* Framer Motion
* Zustand
* React Query

Стиль:

* Dark Theme
* Glassmorphism
* Premium UI
* Responsive Design

Страницы:

* Главная
* Генератор
* Шаблоны
* Маркетплейс
* Галерея
* Мои генерации
* Мои шаблоны
* Подключения AI
* Подключения облаков
* Профиль
* Админка

Создай все страницы, компоненты и состояние приложения.

---

## Этап 7. Админ-панель

Создай Enterprise Admin Panel.

Разделы:

Dashboard
Users
Templates
Marketplace
AI Providers
Cloud Providers
Generations
Billing
Analytics
Audit Logs
Settings

Добавить:

* таблицы
* фильтры
* графики
* экспорт
* массовые действия
* RBAC

Интерфейс должен быть похож на современные SaaS панели уровня Stripe и Vercel.

---

## Этап 8. Docker и деплой

Создай production инфраструктуру.

Требуется:

Docker
Docker Compose
Nginx
PostgreSQL
Redis
MinIO

Создать:

* Dockerfiles
* docker-compose.yml
* .env.example
* CI/CD
* Backup Scripts
* Monitoring

Поддержать деплой на:

* VPS
* Hetzner
* Oracle Free Tier
* Contabo
* домашний сервер

Сгенерировать полностью готовую инфраструктуру.

Такой подход обычно дает результат в 2–5 раз лучше, чем один огромный промт на весь проект. Начинай с Этапа 1, а после завершения каждого этапа проси Antigravity IDE: **"Продолжай с учетом уже созданного кода, ничего не переписывай без необходимости."** Это помогает избежать конфликтов и перезаписи файлов.
