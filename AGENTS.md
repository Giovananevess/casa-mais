# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Examples already hit in this repo: middleware is `src/proxy.ts` (exported `proxy` function), and `error.tsx` receives `unstable_retry` instead of `reset`.

# Project conventions (Casa+)

- UI text, messages and comments are in Brazilian Portuguese.
- Reads: `src/services/*` using `getSessionContext()` from `@/lib/auth/session`.
- Writes: Server Actions in `src/app/(app)/actions/*`. Always: zod `safeParse` → `withSession` → verify ownership of client-supplied IDs (`@/lib/auth/ownership`) → mutate → `revalidateAreas()` → return `ok()`/`fail()` from `@/lib/actions`. Never trust a `householdId` from the client. Never return raw DB error messages; use `dbError()`.
- `"use server"` files may only export async functions (types are fine). Put shared constants in `src/lib`.
- Dates: use `@/lib/dates` (`todayISO`, `currentMonth`, `addMonths`, …). Never derive the calendar day from `toISOString()`.
- Labels for enums live in `@/lib/labels`.
- Before finishing: `npm run check` and `npm run build` (build needs the two `NEXT_PUBLIC_SUPABASE_*` env vars; dummy values work).
- Database: `supabase/schema.sql` is a read-only reference of the tables; changes go in `supabase/migrations/`. RLS, RPC bodies and storage policies are not versioned yet — see `supabase/README.md`.
