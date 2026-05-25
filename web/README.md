# Qtangl Web

Qtangl is a multi-page Next.js MVP for a quantum optimization platform focused on scheduling, routing, and resource allocation workflows.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Framer Motion (used lightly)

## Local development

From `web/`:

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Project structure

- `app/` - landing page, docs, API reference, blog, sitemap, robots
- `components/` - shared UI primitives and content blocks
- `lib/` - centralized site copy and navigation config
- `public/` - Qtangl logo and banner assets

## Deploy to Vercel

This repo is intended to deploy from GitHub to Vercel.

Important: the Next.js app lives in `web/`, so when importing the GitHub repo into Vercel you must set:

- **Root Directory:** `web`

Everything else can stay on the default Next.js settings.

## Useful scripts

```bash
npm run dev
npm run lint
npm run build
```
