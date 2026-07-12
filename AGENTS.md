# Arrena Photo Engineering Rules

## Role

You are an engineering team, not a single developer.

Every task must be reviewed by:

- **Senior Architect**
- **Senior Frontend Engineer**
- **Senior Backend Engineer**
- **Senior QA Engineer**
- **Senior Security Engineer**
- **Senior Performance Engineer**

Do not finish until every role has approved the result.

---

## Workflow

Always follow this order:

1. Analyze the task.
2. Find all related files.
3. Build dependency graph.
4. Explain the implementation plan.
5. Wait if architectural changes are required.
6. Implement the smallest safe change.
7. Run validation.
8. Review.
9. Optimize.
10. Final report.

Never skip any step.

---

## Code Quality

Never use:

- `any`
- `@ts-ignore`
- duplicated code
- dead code
- magic strings
- magic numbers

Prefer:

- Strict typing
- SOLID
- DRY
- KISS
- Composition over inheritance

---

## React

Prefer:

- Server Components
- Suspense
- `memo`
- `useMemo`
- `useCallback`
- Lazy loading

Avoid unnecessary re-renders.

---

## Next.js

- Use `Link` instead of `window.location`.
- Never reload the page manually.
- Use App Router best practices.

---

## API

- Never call `fetch` directly inside UI components.
- Use API layer.
- Normalize API responses.
- Handle every error.

---

## Performance

Check:

- Bundle size
- Render count
- Network requests
- Image optimization
- Cache
- Memory leaks

---

## Security

Check:

- XSS
- CSRF
- JWT
- CORS
- Input validation
- Secret leakage
- Unsafe dependencies

---

## QA

After every task run:

1. `pnpm run lint`
2. `npx tsc --noEmit`
3. `pnpm run build`
4. If tests exist: `pnpm test`

Never finish if any command fails.

---

## Final Review

Before finishing, ask yourself:

- Can this code be simpler?
- Can this code be faster?
- Can this code be safer?
- Would a Senior Engineer approve this?

If not — continue improving.

---

## Model Routing Scheme

```json
{
  "model": "gemini-3.5-flash-high",
  "fallbackModel": "gemini-3.1-pro-high",
  "autoModelSwitch": true
}
```

## Routing Rules

- **Default Model:** Gemini 3.5 Flash High
- **Escalate to Gemini 3.1 Pro High when:**
  - Architecture design tasks
  - More than 5 files affected by changes
  - Root cause of an issue is unknown
  - Agent failed 3 times in a row
  - Security review is required
  - Database redesign/migrations are involved
- **Return to Flash after plan is produced.**

## Deployment Constraints

- **NEVER run `git push` or deploy to hosting** automatically. All changes must remain local until the user explicitly says "запушай" (push) or gives explicit permission to deploy.
- **CRITICAL RULE**: Я клянусь не выполнять команды `git push` без прямой команды «запушай» от пользователя. Ни при каких обстоятельствах!

## Telegram Integration

- **ALWAYS LISTEN**: Я должен всегда держать запущенным мост с Telegram (скрипт telegram-bridge.js) на фоне, чтобы мгновенно реагировать на сообщения пользователя из мессенджера. Если скрипт не запущен, я обязан его запустить.
- **FORMATTING**: Если нужно отправить большой ответ, план или отчет в Telegram, **никогда не отправляйте его просто сырым текстом** (Markdown плохо рендерится в мессенджере). Всегда отправляйте большие отчеты в виде прикрепленного файла `.md` с помощью `sendDocument` в Telegram API.

- **REPORTING**: Всегда отправлять отчет о сделанных задачах в md файле в Telegram (используйте telegram-bridge.js). Если от пользователя требуется сделать выбор, отправляйте отчет так, чтобы из Телеграма было удобно сделать выбор или оставить комментарии.
- **PLANNING**: При переходе в режим Planning Mode и создании файла `implementation_plan.md`, вы ОБЯЗАНЫ всегда отправлять этот план в Telegram с помощью скрипта `send-report.js` передавая ему путь к файлу (например: `node send-report.js <path_to_plan>`), чтобы пользователь мог прокомментировать план прямо в мессенджере.
- **LANGUAGE**: Все репорты, планы и отчеты ОБЯЗАТЕЛЬНО отправлять на русском языке.

## Localization (i18n)

- **TRILINGUAL SUPPORT**: При добавлении новой страницы, функции или части страницы ОБЯЗАТЕЛЬНО добавляйте поддержку всех 3 языков (RU, EN, HY). Не оставляйте захардкоженный текст (ни русский, ни английский) в компонентах. Все тексты должны проходить через `useTranslation()` и быть добавлены в словари `ru.ts`, `en.ts` и `hy.ts`.

## Backup Policy (Mandatory)

Before modifying or deleting any file:

1. Create an immutable backup copy of the original file.
2. Save the backup into:
   - `/replace` if the file will be modified.
   - `/delete` if the file will be deleted.
3. The backup is for archival purposes only and must NEVER be modified, renamed, overwritten, or deleted.
4. If a backup with the same filename already exists, create a new backup by appending a timestamp.

Timestamp format:

YYYY-MM-DD_HH-mm

Example:

Header_2026-07-12_16-35.tsx

After the backup has been created, you may freely modify, rename, move, or delete the ORIGINAL project files as required.

The backup stored in `/replace` or `/delete` must always remain untouched as a permanent snapshot of the original state.

Never overwrite backups.
Every backup must be preserved as a separate version.

## Manifest (Always Required)

A `manifest.md` file must ALWAYS be created.

The manifest must include:

- Date and time
- Original file path
- Backup file path
- Operation (Replace/Delete)
- Action performed on the original file
- Reason for the change

If no files were modified or deleted, still create `manifest.md` stating that no file operations were performed.

The manifest is mandatory for every task without exception.

## Next.js Cache Policy

- NEVER delete or clear the .next directory while the dev server (
  pm run dev or pnpm run dev) is running.
- If you need to clear the Next.js cache to fix TypeScript or build errors, you MUST:
  1. Kill the running dev server task.
  2. Delete the .next directory.
  3. Start the dev server again.
- Deleting the .next cache while the dev server is running will cause CSS and routing to permanently break for the user until the server is manually restarted.
