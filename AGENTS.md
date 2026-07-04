<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project scope

Frontend of a to-do app (tasks with groups, categories, subtasks, habits and notifications). Data comes from an external REST API, consumed exclusively through the tRPC layer. These instructions apply to all code in this repository.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **tRPC v11** + **TanStack Query v5** (`@trpc/react-query`)
- **Zod v4** for validation
- **react-hook-form** + `@hookform/resolvers/zod` for forms
- **Tailwind v4** + shadcn/Radix (`src/components/ui`), `lucide-react` for icons, `sonner` for toasts
- Package manager is **pnpm** (never npm/yarn)

## Mandatory checks

After any code change, **always** run and fix before considering it done:

```bash
pnpm exec tsc --noEmit
pnpm lint
```

## HTTP flow (mandatory pattern)

All data travels through this chain — never fetch directly from a component or add a route outside of it:

```
page.tsx (server) → *Client.tsx ("use client") → hook (src/hooks/use-*.ts)
  → tRPC router (src/server/trpc/routers/*.ts) → ctx.fetch (service layer) → REST API
```

1. **tRPC router** (`src/server/trpc/routers/`): `import "server-only"`, procedures use `protectedProcedure`/`publicProcedure`, **every input validated with a Zod schema**, calls go through `ctx.fetch.get/post/patch/delete<T>()` and errors are wrapped with `mapApiError(e)`. Register new routers in `root.ts`.
2. **Service layer** (`src/services/http.ts`): the existing `createHttp` is the only HTTP exit point. Don't duplicate clients; follow the existing pattern for new services (e.g. `notificationService.ts`).
3. **Hooks** (`src/hooks/use-*.ts`): one file per domain, `"use client"`, exposing `trpc.<router>.<proc>.useQuery/useMutation`. Mutations invalidate via `trpc.useUtils()`, show success toasts with `sonner` and use `onError: showError`. Optimistic updates follow the `use-tasks.ts` pattern (`getQueryKey` + `onMutate`/rollback).
4. **Components** consume hooks only — never `trpc` or `fetch` directly.

## Types

- Domain/API types live in `src/types/` (e.g. `api.ts`, `task-modal.ts`) and are **exported** from there — Zod schemas export their inferred type when shared.
- Local `type`/`interface` inside components are fine for props and internal shapes (e.g. `interface Props`); don't export them if nothing else uses them.

## Components and pages

- **Reuse before creating**: look in `src/components/ui` and existing feature components first; create a new component only as a last resort. Prefer generalizing an existing one over duplicating.
- **Page pattern**: `page.tsx` is always a thin Server Component that imports a `*Client.tsx` (`"use client"`) — e.g. `dashboard/page.tsx` → `DashboardClient.tsx`. Keep everything that doesn't need interactivity on the server.

## Don'ts

- Don't over-engineer: no "for the future" abstractions, extra layers, or variations of things that already exist.
- Don't leave dead code: remove imports, props, state and components that became unused after a change.
