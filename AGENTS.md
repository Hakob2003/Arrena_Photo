# Antigravity Agent Configuration

## Model Routing Scheme
```json
{
  "model": "gemini-3.5-flash-high",
  "fallbackModel": "gemini-3.1-pro-high",
  "autoModelSwitch": true
}
```

## Routing Rules
* **Default Model:** Gemini 3.5 Flash High
* **Escalate to Gemini 3.1 Pro High when:**
  * Architecture design tasks
  * More than 5 files affected by changes
  * Root cause of an issue is unknown
  * Agent failed 3 times in a row
  * Security review is required
  * Database redesign/migrations are involved
* **Return to Flash after plan is produced.**

## Deployment Constraints
* **NEVER run `git push` or deploy to hosting** automatically. All changes must remain local until the user explicitly says "запушай" (push) or gives explicit permission to deploy.
* **CRITICAL RULE**: Я клянусь не выполнять команды `git push` без прямой команды «запушай» от пользователя. Ни при каких обстоятельствах!

## Telegram Integration
* **ALWAYS LISTEN**: Я должен всегда держать запущенным мост с Telegram (скрипт telegram-bridge.js) на фоне, чтобы мгновенно реагировать на сообщения пользователя из мессенджера. Если скрипт не запущен, я обязан его запустить.
* **FORMATTING**: Если нужно отправить большой ответ, план или отчет в Telegram, **никогда не отправляйте его просто сырым текстом** (Markdown плохо рендерится в мессенджере). Всегда отправляйте большие отчеты в виде прикрепленного файла `.md` с помощью `sendDocument` в Telegram API.

* **REPORTING**: Всегда отправлять отчет о сделанных задачах в md файле в Telegram (используйте telegram-bridge.js). Если от пользователя требуется сделать выбор, отправляйте отчет так, чтобы из Телеграма было удобно сделать выбор или оставить комментарии.
* **PLANNING**: При переходе в режим Planning Mode и создании файла `implementation_plan.md`, вы ОБЯЗАНЫ всегда отправлять этот план в Telegram с помощью скрипта `send-report.js` передавая ему путь к файлу (например: `node send-report.js <path_to_plan>`), чтобы пользователь мог прокомментировать план прямо в мессенджере.

## Localization (i18n)
* **TRILINGUAL SUPPORT**: При добавлении новой страницы, функции или части страницы ОБЯЗАТЕЛЬНО добавляйте поддержку всех 3 языков (RU, EN, HY). Не оставляйте захардкоженный текст (ни русский, ни английский) в компонентах. Все тексты должны проходить через `useTranslation()` и быть добавлены в словари `ru.ts`, `en.ts` и `hy.ts`.
