# Copilot Instructions

## Project

Next.js 15 App Router, TypeScript, SCSS Modules, NextAuth v5, React 19.

---

## File naming

**All files and folders use kebab-case.**

```
my-component.tsx
my-component.module.scss
some-util.ts
use-my-hook.ts
```

This applies to every file in the project — components, hooks, utilities, services, styles, routes.
The only exceptions are Next.js conventions that require a specific name: `page.tsx`, `layout.tsx`, `route.ts`, `middleware.ts`, `not-found.tsx`, `loading.tsx`, `error.tsx`.

---

## Creating a new component

### Where to place a component

Components are organized into three categories:

```
src/components/
├── shared/    ← generic, reusable UI primitives (no business logic)
├── widgets/   ← self-contained UI blocks composed from shared + logic
└── features/  ← user-facing feature units tied to a specific domain
```

| Layer       | Examples                                      | Rules                                                                         |
| ----------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| `shared/`   | `button`, `input`, `badge`, `spinner`         | No domain knowledge, no data fetching, no server actions. Pure UI.            |
| `widgets/`  | `room-card`, `user-avatar`, `score-table`     | May contain domain types and light logic. Composed from `shared/` primitives. |
| `features/` | `join-room-form`, `login-form`, `select-room` | Tied to a specific feature. May call server actions, use hooks, own state.    |

> When in doubt: if it could live in any project → `shared`. If it belongs to this app's domain but isn't a full feature → `widgets`. If it owns user interaction for one specific flow → `features`.

### Folder structure

```
src/components/shared/my-component/
├── my-component.tsx        ← component implementation
├── my-component.module.scss ← scoped styles
└── index.ts                ← public re-export
```

### 1. `my-component.tsx`

- Named export only (no default exports)
- Props interface defined in the same file
- Extend native HTML attributes when wrapping a native element (`ButtonHTMLAttributes`, `InputHTMLAttributes`, etc.)
- Use `cn()` from `@/utils/lib` for conditional class composition
- Use `data-*` attributes for style variants instead of dynamic class name strings

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/lib";
import styles from "./my-component.module.scss";

type Props = HTMLAttributes<HTMLDivElement> & {
	variant?: "primary" | "secondary";
};

export const MyComponent: FC<Props> = ({
	variant = "primary",
	className,
	...props
}) => {
	return (
		<div
			{...props}
			data-variant={variant}
			className={cn(styles.root, className)}
		/>
	);
};
```

### 2. `my-component.module.scss`

- Single root class `.root` (or a descriptive semantic name if clearer)
- Variants via `[data-variant="..."]` attribute selectors — never via separate modifier classes
- Hover/active/disabled states defined once in the base rule using `filter: brightness()` where possible, not repeated per variant
- All values from design tokens in `src/styles/vars.scss`

```scss
.root {
	// base styles using var(--*)

	&:hover:not(:disabled) {
		filter: brightness(1.15);
	}
	&:active:not(:disabled) {
		filter: brightness(0.88);
	}

	&[data-variant="primary"] {
		background: var(--color-primary-700);
	}
	&[data-variant="secondary"] {
		background: var(--color-neutral-200);
	}
}
```

### 3. `index.ts`

Re-export everything public from the component file. This is the only file consumers import from.

```ts
export * from "./my-component";
```

### Importing the component

Always import from the folder, never from the file directly:

```tsx
// ✅
import { MyComponent } from "@/components/shared/my-component";

// ❌
import { MyComponent } from "@/components/shared/my-component/my-component";
```

---

## Example — Button component

```
src/components/shared/button/
├── button.tsx
├── button.module.scss
└── index.ts
```

`button.tsx` — extends `ButtonHTMLAttributes`, accepts `color` and `isLoading` props, uses `data-color` for variant styling, hides label with `visibility: hidden` during loading to preserve width.

`button.module.scss` — single `.btn` root, color variants via `[data-color="..."]`, shared hover/active via `filter: brightness()`.

`index.ts` — `export * from "./button"`.

---

## Other conventions

- `cn()` from `@/utils/lib` for all className composition (wraps `classnames`)
- No default exports anywhere except Next.js page/layout files
- Server actions in `actions.ts` colocated with the route that owns them
- Services in `src/services/` (business logic), DB access in `src/db/` (in-memory stores)
- Constants in `src/utils/constants.ts`
- Design tokens only in `src/styles/vars.scss` — no hardcoded colors, spacings, or radii elsewhere

---

## Migration docs (canonical paths)

For backend migration tasks use these files:

- `docs/migration/migration-agent-instructions.md`
- `docs/migration/migration-plan.md`

Reference docs:

- `BE_LEGACY.md`
- `API_FOOTBALL_INSTRUCTIONS.md`

---

## `save` command rule

Whenever the user mentions running the `save` command in the terminal, immediately update **both** of these files to reflect the current state of the codebase:

- `docs/be-doc.md` — backend documentation (API routes, server actions, services, auth flow, error codes, in-memory stubs)
- `docs/db-doc.md` — database documentation (schema, models, migrations, Prisma setup, access patterns, what's not yet in DB)

Update the `Last updated` date at the top of each file. Keep all sections accurate and in sync with the actual code.
