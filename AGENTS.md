# LifeOS: agent guide

Read this first. It applies to Claude Code, Codex and any other coding agent working in this repo.

## What this is

A self-improvement platform: one web app with several tools (Money first, then Tasks, then Training). Each tool later gets its own Flutter app that uses the same API.

Work is tracked by task ID (P0-01, P1-02, ...) in `LifeOS-Tracker.xlsx`. When asked to do a task ID, do only that task.

## Layout

```
apps/web        Next.js (App Router), the platform UI
apps/api        NestJS REST API + Prisma + OpenAPI
packages/shared Zod schemas and types used by web and api (built with tsup, CJS + ESM)
packages/config shared tsconfig base
docker-compose.yml  Postgres 16
```

## Commands

```bash
pnpm install && pnpm --filter api db:generate     # fresh clone setup
pnpm db:up | db:down | db:logs                    # Postgres via docker compose
pnpm dev                                          # web :3000, api :4000 (prefix /api/v1)
pnpm typecheck | lint | format:check | build | test
pnpm --filter api exec prisma migrate dev --name <name>
pnpm --filter api db:generate                     # REQUIRED after every migrate or schema change
pnpm --filter @lifeos/shared build                # after editing packages/shared
```

API docs (development only): http://localhost:4000/docs, spec at /docs-json.

## Environment

- Postgres runs in Docker on host port **5431**. `DATABASE_URL` is in the root `.env`.
- A new API env var goes in three places: `apps/api/src/config/env.ts` (Zod), `.env.example`, and your local `.env`. Web vars go in `apps/web/src/env.ts` and `apps/web/.env.example`.
- Never commit `.env`, and never paste real tokens or secrets into chats or issues.

## Version pins and gotchas

- **TypeScript 6.x everywhere.** TypeScript 7 has no compiler API, so `tsup --dts` fails. Do not upgrade until tsup supports it.
- **Prisma 7.x stable** (7.10.1 when this was written). CLI, `@prisma/client` and `@prisma/adapter-pg` must share one version. Do not use RC or `next` tags.
- `prisma migrate dev` does **not** generate the client in Prisma 7. Always run `prisma generate` after it.
- The client is generated to `apps/api/src/generated/prisma` (gitignored, CommonJS via `moduleFormat = "cjs"`). Import from `../generated/prisma/client`. Never edit generated files.
- `prisma.config.ts` loads the root `.env`. The app connects through `@prisma/adapter-pg` in `PrismaService`.
- **Zod 4.** OpenAPI schemas come from `z.toJSONSchema(schema, { target: "openapi-3.0" })` via `apps/api/src/common/openapi.ts`. We deliberately do not use `nestjs-zod`.
- Prisma's CLI adds helper folders (`.agents`, `.claude`, `.windsurf`, `skills-lock.json`) to `apps/api`. They are gitignored; leave them on disk.
- API lint is `oxlint --type-aware`. Web uses ESLint from create-next-app. Prettier runs on commit via husky + lint-staged.

## Architecture rules

- **Modular monolith.** Each tool lives in its own module folder. Tools never import each other; they share only `auth`, `users`, `common` and `prisma`.
- Controllers handle HTTP only. Services hold business rules. Only services or repositories talk to Prisma.
- **Validation:** schemas live in `packages/shared` and are used by both the API and web forms. The API uses `ZodValidationPipe(schema)`. New endpoints also get `@ZodBody`, `@ZodResponse` and `@ApiErrors` so the OpenAPI spec stays accurate.
- **Auth:** a global `JwtAuthGuard` protects every route unless it has `@Public()`. Web uses httpOnly cookies (`access_token`, `refresh_token`). Mobile sends `x-client: mobile` and gets tokens in the JSON body, then uses `Authorization: Bearer`. Refresh tokens are opaque, HMAC-hashed in the database and rotated; reusing an old one revokes its whole family. Do not change this design without asking.
- **Errors:** everything goes through `AllExceptionsFilter` and returns `{ statusCode, error, message, errors?, path, timestamp }`. Throw Nest `HttpException`s.
- **Ownership:** every query on user data must filter by the authenticated user's id. No exceptions.

## Money rules (non-negotiable)

- Store amounts as integer minor units (`BigInt` in Prisma), never floats. Amounts are positive; the transaction type (INCOME, EXPENSE, TRANSFER) gives the sign.
- Every amount has a currency. Default is MAD. Format only at the UI edge with `Intl`.
- Account balances are computed from transactions, never stored as editable numbers.
- `BigInt` does not serialize to JSON. Convert at the API boundary and document the chosen format here when P2-01 settles it.
- Money logic needs unit tests (target 90% coverage).

## Frontend rules

- Locales: `en`, `fr`, `ar` via next-intl. No hard-coded user-facing strings. Arabic is RTL.
- Use logical CSS utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`). Never `left`/`right`. `components.json` has `"rtl": true`, so `shadcn add` converts new components itself.
- Light is the default theme, dark is available (`.dark`). Never use raw hex in components; use tokens from `apps/web/src/app/globals.css` (`bg-background`, `bg-card`, `text-muted-foreground`, `bg-primary`, `text-income`, `text-expense`).
- Accent: the platform is purple. A wrapper with `data-tool="money" | "tasks" | "training"` swaps `--primary` to that tool's color (Money teal, Tasks blue, Training orange), so shadcn components re-theme automatically. The app shell sets `data-tool` from the route.
- Style: flat surfaces, 2px borders instead of shadows, rounded corners, chunky buttons with a darker bottom lip (`Button` in `components/ui/button.tsx`). Keep data tables and charts calm.
- Fonts: Nunito (Latin) with Baloo Bhaijaan 2 (Arabic). Money uses `tabular-nums`.
- UI components are shadcn/ui (Radix) in `apps/web/src/components/ui`.
- Planned stack: React Hook Form + Zod, TanStack Query, Recharts.
- RTL: direction comes from `DirectionProvider` in the locale layout. Icons that point a direction (chevrons, arrows, "back") get `rtl:rotate-180` (or `rtl:-scale-x-100`). Never use `space-x-*`, use `gap-*`.
- Money amounts (sign + currency + number) render inside `<bdi dir="ltr">` so signs and currency never reorder in RTL. User-written text (task titles, notes, names) gets `dir="auto"`.
- Tools are defined once in `features/tools/registry.ts` (login showcase, later the sidebar switcher). New tool = registry entry + `[data-tool="<id>"]` block in `globals.css` + messages `Tools.<id>.*` + a preview in `previews.tsx`.
- App shell: the active tool comes from the pathname (`activeToolId` in `features/shell/navigation.ts`) and is set as `data-tool` on the shell root (repeat it on portals like Sheet). Sidebar links per context live in `navigation.ts`; flip `enabled: true` when a page ships.

## Working style

- One tracker task at a time. Small commits using conventional messages (`feat:`, `fix:`, `chore:`).
- Before saying a task is done: `pnpm typecheck && pnpm lint && pnpm --filter api build`.
- Ask before: changing auth, writing a migration that drops data, adding a dependency for something we already solve, or upgrading a major version.
- Never edit an applied migration. Create a new one.
- CI (`.github/workflows/ci.yml`) runs shared build, prisma generate, typecheck, lint, format:check, test and build on every push and PR. Keep it green. A new required env var needs a dummy value in the workflow.
