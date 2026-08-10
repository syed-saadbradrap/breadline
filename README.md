# Breadline — Restaurant Ordering Website

Customer-facing online ordering website for **Breadline**.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand (cart + orders)
- React Hook Form + Zod
- Framer Motion
- Sonner toasts

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm run start    # start production server
npm run lint     # eslint
```

## Features

- Home, Menu, Product detail
- Search, Cart (persisted), Checkout
- Order confirmation + tracking (local demo store)
- About, Contact
- Login / Register UI
- My Account + My Orders
- SEO: metadata, sitemap, robots, JSON-LD

## Notes

- Product/catalog data lives in `src/data` and can be swapped for an API later.
- Product images use branded placeholders under `/public/images` — drop real JPG/PNG files with the same paths to replace them.
- Auth screens are UI-ready (no fake backend auth).
