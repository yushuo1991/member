# Repository Guidelines

## Project Structure & Module Organization

- `index.html`: single-file demo for quick previews (membership / activation codes / access control).
- `member-system/`: primary app (Next.js 14 + TypeScript + Tailwind).
  - `member-system/src/app/`: App Router pages/layouts; API routes are `api/**/route.ts`.
  - `member-system/src/components/`: shared UI components (PascalCase filenames, e.g. `Navbar.tsx`).
  - `member-system/src/lib/`: business logic (auth/JWT, DB access, membership rules, rate limits).
  - `member-system/src/types/`: shared TypeScript types/schemas.
  - `member-system/database-init*.sql`: MySQL schema/init scripts.
- `ops/` and `DEPLOYMENT.md`: deployment notes/workflows.
- `temp_*` and `yushuo-fuplan-system-main/`: historical snapshots; avoid editing unless intentionally working on them.

## Build, Test, and Development Commands

Run from `member-system/`:

- `npm install`: install dependencies.
- `npm run dev`: start local development server.
- `npm run build`: produce a production build.
- `npm start`: run the production server locally.
- `npm run lint`: run ESLint (Next.js rules).
- `npm run type-check`: run `tsc --noEmit`.

Root demo:

- `python -m http.server 8000` then open `http://localhost:8000/index.html`.

## Coding Style & Naming Conventions

- Indentation: 2 spaces; keep quote style consistent within each file.
- Prefer absolute imports via `@/…` (configured in `member-system/tsconfig.json`).
- Tailwind is the default styling approach; global styles live in `member-system/src/app/globals.css`.

## Testing Guidelines

- No dedicated test runner yet; rely on `npm run lint` + `npm run type-check`, plus manual smoke tests (register/login, membership flows, admin pages).
- If adding tests, use `*.test.ts(x)` and add a `test` script to `member-system/package.json`.

## Commit & Pull Request Guidelines

- Commit messages: Conventional Commits, e.g. `feat: …`, `fix: …`, `chore: …`.
- PRs: include what/why, screenshots for UI changes, and notes for `.env`/DB/schema changes.

## Security & Configuration Tips

- Use `member-system/.env.example` as the template; never commit secrets.
- If auth/JWT/DB behavior changes, update the relevant `database-init*.sql` and document breaking changes.

