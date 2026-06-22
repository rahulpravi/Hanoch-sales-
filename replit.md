# SalesTrack Pro

A high-velocity Sales Tracking & Inventory Management web app for warehouse teams. Scan barcodes, track products, and export sales to Excel — all in a sleek dark-mode interface.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (dark blue glassmorphism theme)
- Routing: wouter
- Icons: lucide-react
- Toasts: sonner
- Excel export: xlsx (SheetJS)
- Data persistence: localStorage (no backend required)

## Where things live

- `artifacts/sales-tracker/src/` — the full React frontend
  - `src/lib/products.ts` — 5 predefined products with qty/box
  - `src/lib/storage.ts` — localStorage helpers (loadSales / saveSales)
  - `src/lib/excel.ts` — Excel export logic (one sheet per product)
  - `src/pages/Dashboard.tsx` — home screen with past sales list
  - `src/pages/NewSale.tsx` — two-column add sale flow with barcode scanning

## Architecture decisions

- Fully frontend-only: no backend, no database — all state in localStorage.
- Excel export uses SheetJS (xlsx): each product becomes a separate Excel sheet.
- Barcode scanner input uses `useRef` + `Enter` key handler for instant, frictionless scanning.
- Dark theme is the default (`/new`, `/` both styled for dark control-room aesthetic).
- Sale file naming: `YYYY-MM-DD sale.xlsx` per the spec.

## Product

- **Dashboard**: Metrics cards (Total Sales, Items Tracked, Total Quantity) + past sales table
- **Add New Sale**: Sale Name → Product select → Barcode scan loop → Submit Item → Save Sale (exports Excel)
- **Excel Export**: One sheet per product with Date | Sl. No | Item Name | Serial Number columns

## Predefined Products

| Product | Qty/Box |
|---------|---------|
| 48 Way  | 168     |
| OBC     | 300     |
| 4 Way   | 2200    |
| Shourd  | 110     |
| Ford    | 2000    |

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The `dark` class cannot be used in `@apply` (it's a variant, not a utility in Tailwind v4). Apply the dark theme by default in `:root` CSS variables instead.
- Always put Google Fonts `@import url(...)` as the very first line of `index.css`, before `@import "tailwindcss"`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
