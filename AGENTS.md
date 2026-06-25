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
