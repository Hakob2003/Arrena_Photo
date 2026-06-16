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
