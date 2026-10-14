# Project Initialization

## Overview

This document records the manual initialization of the **Chat with PDF** project. The frontend and backend were initialized separately to allow explicit configuration during setup.

**Package manager:** Bun

## Project Structure

```text
chat-w-pdf/
├── backend/              # NestJS application
├── frontend/             # Next.js application
└── docs/                 # Project documentation
```

> The structure above shows the intended top-level directories; additional generated files are omitted.

## 1. Backend — NestJS

The backend uses the official NestJS TypeScript starter repository.

From the project root:

```bash
git clone https://github.com/nestjs/typescript-starter.git backend
cd backend
bun install
```

**Source:** https://github.com/nestjs/typescript-starter

> The clone target is documented as `backend` to match the subsequent `cd backend` command. If the repository was cloned under another name, rename or move it accordingly.

## 2. Frontend — Next.js

From the project root:

```bash
bunx create-next-app@latest
```

The interactive installer was used instead of accepting all recommended defaults.

| Configuration prompt | Recorded selection |
| --- | --- |
| Project name | `frontend` |
| Use recommended Next.js defaults | No — customize settings |
| TypeScript | Not specified in recorded output |
| Linter | ESLint |
| React Compiler | Not specified in recorded output |
| Tailwind CSS | Not specified in recorded output (Tailwind CSS v4 was subsequently detected) |
| `src/` directory | Yes (inferred from generated file paths) |
| App Router | Yes (inferred from generated `src/app/globals.css`) |
| Cache Components | Not specified in recorded output |
| Customize import alias | Not specified in recorded output |
| Import alias | `@/*` |
| Include `AGENTS.md` | Not specified in recorded output |
| Anonymous agent feedback | Not specified in recorded output |

> **Verification needed:** The original terminal transcript lists several Yes/No prompts without showing the selected answers. Confirm those settings from the generated configuration files before treating them as finalized decisions.

## 3. UI Components — shadcn/ui

Navigate to the frontend directory:

```bash
cd frontend
bunx --bun shadcn@latest init
```

### Selected configuration

| Setting | Value |
| --- | --- |
| Component library | Base UI |
| Preset | Nova |
| Framework detected | Next.js |
| Tailwind CSS detected | v4 |
| Package manager used | Bun |

### Initialization results

The CLI successfully completed its preflight checks, validated the import alias, wrote `components.json`, installed dependencies, updated fonts, and updated the global stylesheet.

Created files:

```text
src/components/ui/button.tsx
src/lib/utils.ts
```

Updated file:

```text
src/app/globals.css
```

The CLI reported:

```text
Project initialization completed.
You may now add components.
```

### Button component

The button component was explicitly requested after initialization:

```bash
bunx --bun shadcn@latest add button
```

The CLI skipped `src/components/ui/button.tsx` because it already existed and appeared identical. No overwrite was necessary.

## 4. Setup Status

| Component | Status |
| --- | --- |
| NestJS starter repository | Cloned |
| Backend dependencies | Installed with Bun |
| Next.js application | Initialized |
| shadcn/ui | Initialized (Base UI + Nova) |
| Button component | Already present |
| PostgreSQL | Not covered in this document |
| Vector database | Not covered in this document |

## Notes

- The installation steps above document the commands already run; they are not an instruction to reinstall the project.
- Configuration choices not visible in the supplied terminal transcript remain unconfirmed.
- Runtime checks, database setup, environment variables, and deployment configuration are outside the scope of this initialization record.
