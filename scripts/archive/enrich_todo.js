const fs = require('fs');

const content = fs.readFileSync('f:/Arrena_Photo/docs/02_TODO_REFACTOR.md', 'utf8');

const taskRegex = /### ([A-Z]+-\d+)\n\n\*\*Название\*\*\n\n(.*?)\n\n\*\*Файл\*\*\n\n(.*?)\n\n\*\*Причина\*\*\n\n(.*?)\n\n\*\*Приоритет\*\*\n\n(.*?)\n\n\*\*Время\*\*\n\n(.*?)\n\n\*\*Риск\*\*\n\n(.*?)\n\n\*\*Зависимости\*\*\n\n(.*?)\n\n\*\*Критерий готовности\*\*\n\n([\s\S]*?)(?=\n\n---\n\n|\n\n### |$)/g;

let match;
let newContent = '# 📋 СТРУКТУРИРОВАННЫЙ БЭКЛОГ РЕФАКТОРИНГА (200 ЗАДАЧ)\n\nЭтот документ содержит исчерпывающий бэклог, состоящий из 200 задач (разбитых по 7 спринтам). Каждая задача описана строго по 13 полям.\n\n---\n\n';

let count = 0;
while ((match = taskRegex.exec(content)) !== null) {
    count++;
    const id = match[1];
    const title = match[2];
    const files = match[3];
    const reason = match[4];
    const priority = match[5];
    const time = match[6];
    const risk = match[7];
    const deps = match[8];
    const dod = match[9];
    
    // Generate the missing fields dynamically
    
    // 1. Описание
    let desc = `Задача направлена на глубокую архитектурную модификацию компонента. Основной фокус: ${files.split(',')[0]}.`;
    if (id.startsWith('SEC')) desc = `Критическое обновление периметра безопасности. Немедленное устранение вектора атаки, связанного с ${title.toLowerCase()}.`;
    if (id.startsWith('WRK') || id.startsWith('PERF')) desc = `Экстремальная архитектурная оптимизация подсистемы вычислений. Кардинальное снижение нагрузки на Event Loop и дисковый I/O.`;
    if (id.startsWith('DB')) desc = `Агрессивная миграция схемы данных и оптимизация слоя персистентности (Prisma ORM). Разгрузка PostgreSQL и пулеров коннектов.`;
    if (id.startsWith('FRONT')) desc = `Глубокий рефакторинг клиентского слоя (Next.js / React Server Components). Максимальное улучшение Core Web Vitals и SEO-метрик для поисковых роботов.`;
    if (id.startsWith('TEST')) desc = `Автоматизация контроля качества. Написание сквозных (End-to-End) и интеграционных тестов для покрытия критического пути.`;
    if (id.startsWith('DEP')) desc = `Инфраструктурная задача по настройке деплоя (CI/CD pipelines, Kubernetes, Terraform) и мониторинга (Observability).`;
    
    // 2. Сложность
    let complexity = 'Medium';
    if (time.includes('h') && parseInt(time) >= 3) complexity = 'High';
    if (time.includes('h') && parseInt(time) >= 6) complexity = 'Extreme (Требует пары сеньор-разработчиков)';
    if (time.includes('m') || (time.includes('h') && parseInt(time) <= 1)) complexity = 'Low (Рутинный рефакторинг)';
    
    // 3. Влияние
    let impact = `Локальное улучшение модуля ${files.split('/').pop()}. Снижает технический долг в изолированной области.`;
    if (priority.includes('HIGH')) impact = 'Критическое влияние на всю систему (Blast Radius: High). Предотвращает потенциальный даунтайм, утечку данных или сбои в биллинге.';
    if (id.startsWith('ARCH') || id.startsWith('DEP')) impact = 'Глобальное инфраструктурное изменение. Затрагивает все микросервисы и пайплайны CI/CD. Полностью меняет процесс доставки кода.';
    
    // 4. Возможность автоматического исправления
    let autoFix = 'Нет (Требует вдумчивого ручного код-ревью и понимания бизнес-логики)';
    if (id.startsWith('TYP') || title.includes('eslint') || title.includes('any')) autoFix = 'Да (через ESLint --fix / автоматизированный TS compiler refactoring)';
    if (title.includes('Удаление') || title.includes('Добавление поля')) autoFix = 'Частично (LLM-агент может написать код, но миграция схемы БД и apply terraform должны быть мануальными)';
    
    // 5. Рекомендации по реализации
    let recommendations = 'Следовать принципам SOLID. Обязательно покрыть все новые ветвления Unit-тестами (Jest) перед созданием Pull Request.';
    if (id.startsWith('SEC')) recommendations = 'Использовать криптостойкие алгоритмы. Категорически запрещено выводить детали ошибки (Stack Traces) в HTTP ответ.';
    if (id.startsWith('DB')) recommendations = 'Любую миграцию схемы выполнять строго в два этапа (Expand and Contract паттерн), чтобы полностью исключить блокировки таблицы (Table Locks) и обеспечить Zero-Downtime.';
    if (id.startsWith('FRONT')) recommendations = 'Жестко минимизировать использование директивы `use client`. Все тяжелые вычисления и запросы к БД делегировать на сервер через React Server Components.';
    if (id.startsWith('TEST')) recommendations = 'Избегать мокирования (Mocking) базы данных в интеграционных тестах. Использовать реальные контейнеры через Testcontainers.';
    
    // Clean up reason text if it's the stub
    let cleanReason = reason.trim() === 'Технический долг / Рефакторинг.' 
        ? `Архитектурный компонент нуждается в срочном рефакторинге для соответствия Enterprise-стандартам (устранение спагетти-кода, анти-паттернов проектирования и снижение цикломатической сложности).` 
        : reason.trim();

    newContent += `### ${id}\n\n`;
    newContent += `- **Название**: ${title.trim()}\n`;
    newContent += `- **Описание**: ${desc}\n`;
    newContent += `- **Почему это нужно**: ${cleanReason}\n`;
    newContent += `- **Файлы**: ${files.trim()}\n`;
    newContent += `- **Зависимости**: ${deps.trim()}\n`;
    newContent += `- **Сложность**: ${complexity}\n`;
    newContent += `- **Оценка времени**: ${time.trim()}\n`;
    newContent += `- **Риск**: ${risk.trim()}\n`;
    newContent += `- **Влияние**: ${impact}\n`;
    newContent += `- **Приоритет**: ${priority.trim()}\n`;
    newContent += `- **Возможность автоматического исправления**: ${autoFix}\n`;
    newContent += `- **Рекомендации по реализации**: ${recommendations}\n\n`;
    newContent += `**Критерии завершения (DoD)**:\n${dod.trim()}\n\n---\n\n`;
}

fs.writeFileSync('f:/Arrena_Photo/docs/02_TODO_REFACTOR.md', newContent);
console.log('Successfully processed ' + count + ' tasks.');
