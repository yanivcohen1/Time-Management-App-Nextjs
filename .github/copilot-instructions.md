# Copilot Instructions for `my-next-app`

## Project snapshot
- A single Next.js App Router project (`src/app`) with TypeScript enabled.
- Global layout (`src/app/layout.tsx`) wraps every page in Radix UI `Theme` and Geist fonts; include the provider if you add new root-level wrappers.
- Styling mixes Tailwind CSS v4 utilities (imported once in `globals.css`) with Radix UI primitives; prefer Radix components plus light utility classes for spacing.

## Key files & patterns
- `src/app/page.tsx`: current home page, implements the "FocusFlow" todo dashboard using Radix `Tabs`, `Card`, `Flex`, etc. Treat it as the reference for component composition and TypeScript data typing.
- `src/app/globals.css`: defines design tokens (`--background`, `--foreground`) and a gradient backdrop. Extend variables here instead of duplicating inline colors.
- `public/`: static SVG assets from the template. New assets go here and should be referenced with `/asset.svg` paths.

## UI & state conventions
- Keep client components marked with `"use client"` when they rely on hooks (`useState`, `useMemo`, Radix interactive widgets).
- Todo items use the `TodoItem` type (id/text/completed/createdAt). Reuse or extend this type rather than redefining shapes.
- Use helper factories like `createTodo` when generating new items so IDs remain consistent (`crypto.randomUUID` fallback is already included).

## Navigation & routing
- New pages belong under `src/app/<route>/page.tsx`. If the route needs shared UI, add a colocated `layout.tsx`.
- When creating common chrome (menus, footers), update the top-level layout so every route inherits consistent navigation.
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