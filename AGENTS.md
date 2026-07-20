# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single** Next.js 16 app (App Router, React 19, TypeScript, Tailwind 4) named `loan-system`. It is a Hebrew RTL web app for managing event-equipment rentals (personal details → deposit/donation → dates → equipment catalog → summary/save, plus search & return). Package manager is **npm** (`package-lock.json`). There is only one service to run.

### Run / lint / build / test

- Dev server: `npm run dev` → http://localhost:3000 (note: `dev`/`build` scripts pass `--webpack`).
- Lint: `npm run lint`. The repo currently has pre-existing lint errors; a non-zero exit from `npm run lint` does not mean your environment is broken. `npm run build` does not fail on those lint errors.
- Build: `npm run build`. Prod serve: `npm start` (requires a prior build).
- There is **no automated test suite** configured (no Jest/Vitest/Playwright); do not expect `npm test`.

### Persistence (non-obvious)

- By default, rentals are stored in a local JSON file `data/rentals.json` (gitignored, auto-created on first save). Check the store backend at any time via `GET /api/rentals` → `{"store":{"backend":"file",...}}`.
- Optional cloud persistence uses Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (normally only on Vercel). No database is used.

### Gotchas

- Email receipts are optional and require `RESEND_API_KEY` (+ optional `RESEND_FROM`). On the summary page the "שמירה + שליחת קבלה" (save + send receipt) button will surface an email-send error when `RESEND_API_KEY` is absent, **but the rental itself is still saved** before the email step. Use the "שמירה + הדפסה" (save + print) button to save without email.
- On the summary page, clicking "סיום ההזמנה" (finish) saves the rental and then calls `resetDraft()`, which triggers the page's guard effect to redirect back to `/rental/personal-details` with an empty form. This is existing app behavior, not a save failure — the rental is persisted first. Verify saved rentals on the `/search` page or via `GET /api/rentals`.
