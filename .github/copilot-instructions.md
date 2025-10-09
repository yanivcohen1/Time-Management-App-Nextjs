# Copilot Instructions for `my-next-app`

## Project snapshot
- Next.js App Router project (`src/app`) with TypeScript and a Radix UI + Tailwind v4 design system.
- Global layout (`src/app/layout.tsx`) wraps every page in Radix UI `Theme`, Geist fonts, and the shared `AuthProvider`; include both wrappers when adding new providers.
- Primary routes: main menu (`/`), todo workspace (`/todo`), login (`/login`), user dashboard (`/user`), admin overview (`/admin`), and quick-link deep links (`/user/inter/[id]`).
- Styling mixes Tailwind utilities (imported once in `globals.css`) with Radix primitives; extend design tokens in `globals.css` instead of hard-coding colors.

## Key files & patterns
- `src/app/page.tsx`: command-center menu showing available workspaces with role-aware CTA buttons.
- `src/app/todo/page.tsx`: "FocusFlow" todo dashboard using Radix `Tabs`, `Card`, and `Flex`; treat as the reference for data typing (`TodoItem`) and Radix composition.
- `src/app/login/page.tsx`: credential form that calls the auth context and redirects on success; keep it client-only.
- `src/app/user/page.tsx`: protected user workspace with quick links to other routes.
- `src/app/user/inter/[id]/page.tsx`: dynamic quick-link detail page that reads the `id` param and guards access via `ProtectedPage`.
- `src/app/admin/page.tsx`: admin-only metrics view built on `ProtectedPage`.
- `src/app/auth-context.tsx`: client-side auth state with localStorage persistence; exposes `AuthProvider`, `useAuth`, and `useRoleGuard` helpers.
- `src/components/protected-page.tsx`: wrapper that enforces allowed roles, redirects unauthorized visitors, and renders page chrome.
- `src/components/header-nav.tsx`: Radix button-based header that reflects auth state and handles login/logout actions.
- `src/app/globals.css`: defines design tokens (`--background`, `--foreground`) and a gradient backdrop.
- `public/`: static SVG assets from the template. New assets go here and should be referenced with `/asset.svg` paths.

## UI & state conventions
- Keep client components marked with `"use client"` when they rely on hooks (`useState`, `useMemo`, Radix interactive widgets).
- Todo items use the `TodoItem` type (id/text/completed/createdAt). Reuse or extend this type rather than redefining shapes; leverage `createTodo` when generating new entries.
- Auth state lives in `AuthProvider` and persists to `localStorage`; call `useAuth()` for login/logout helpers and `useRoleGuard()` for booleans.

## Authentication & access control
- Auth roles are `"user"` and `"admin"`; demo credentials are `user/user123` and `admin/admin123`.
- Wrap gated views with `ProtectedPage` and pass `allowedRoles`; the component handles redirects when visitors aren’t signed in or lack privileges.
- The header and main menu both read the auth state to disable or reroute protected links—reuse their patterns when adding new gated navigation.

## Navigation & routing
- New pages belong under `src/app/<route>/page.tsx`. If the route needs shared UI, add a colocated `layout.tsx`.
- `HeaderNav` is included globally and should surface any new destinations; gate links via role checks instead of hiding them outright.
- Quick-link deep links follow the `/user/inter/[id]` pattern; use `notFound()` for unknown IDs to keep the UX consistent.
- Prefer Radix navigation primitives (e.g., `Tabs`, `NavigationMenu`, `DropdownMenu`) over raw HTML lists for visual parity.

## Tooling & commands
- Package manager: Yarn (lockfile committed). Use `yarn add` / `yarn remove`.
- Common scripts:
  - `yarn dev` – launch dev server (Turbopack).
  - `yarn build` – production build.
  - `yarn lint` – project-wide ESLint (Flat config extending `next/core-web-vitals`).
- Tailwind is configured via the top-level `@import "tailwindcss";` in `globals.css`; no `tailwind.config.js` is present, so use default tokens and CSS variables.

## Working style tips
- Co-locate small utilities/types with the component that owns them unless they are shared globally.
- Favor Radix variants (`variant="surface" | "ghost" | "soft"`, `size` props) for styling before reaching for custom CSS.
- Respect accessibility helpers already in place (form `aria-label`, label-wrapped checkboxes). Mirror that approach when adding interactive elements.

Use this guide as the quick-start reference when adding features or refactoring pages. Update it whenever you introduce new architectural patterns, dependencies, or workflows.