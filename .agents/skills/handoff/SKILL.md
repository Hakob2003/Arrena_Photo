---
name: handoff
description: "Generate a complete handoff report when ending a session. Summarize all work done, changed files, completed tasks, remaining tasks, known issues, architecture decisions, verification commands, and next steps. Designed for seamless continuation by another AI model."
---

# Handoff Workflow

## Purpose

When a session is ending (Gemini context limit, model switch, etc.), generate a comprehensive handoff document so another AI model can continue seamlessly.

## Required Sections

The handoff report MUST include ALL of the following:

### 1. Summary of Work

- What was the original task/goal
- What was accomplished
- What was NOT accomplished

### 2. Changed Files

- Full list of every file created, modified, or deleted
- Brief description of what changed in each file

### 3. Completed Tasks

- Checklist of all completed items

### 4. Remaining Tasks

- Checklist of all pending items with priority

### 5. Known Issues

- Any bugs, warnings, or problems discovered
- Workarounds applied

### 6. Architecture Decisions

- Key decisions made and rationale
- Trade-offs chosen

### 7. Commands to Verify

```bash
# List exact commands to verify current state
pnpm run lint
npx tsc --noEmit
pnpm run build
pnpm run dev
```

### 8. Next Recommended Step

- The single most important thing to do next
- Context needed to do it

## Rules

- Do NOT omit any information.
- Be explicit — the next model has zero context.
- Include file paths, not just file names.
- Include code snippets for complex decisions.
- Save as artifact AND send to Telegram.
