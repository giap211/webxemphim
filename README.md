# webxemphim

Mobile-first movie streaming web app built from a clean Next.js foundation.

## Stack
- Next.js App Router + React + TypeScript
- Mobile-first UI with safe-area aware fixed bottom glass dock
- Server-side catalog proxy with PhimAPI primary and OPhim fallback
- Short-lived CDN caching and lazy-loaded poster images

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## API routes
- `GET /api/movies?type=phim-moi-cap-nhat&page=1`
- `GET /api/movies?type=phim-le&page=1`
- `GET /api/movies?q=keyword`
- `GET /api/movie/:slug`

The app is intentionally independent from the legacy `gt` codebase. API providers are isolated behind route handlers so provider changes do not require UI changes.
