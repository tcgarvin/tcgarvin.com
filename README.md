# tcgarvin.com

[![Netlify Status](https://api.netlify.com/api/v1/badges/02fe7632-02df-4d43-a6f4-6e0a73a7f05a/deploy-status)](https://app.netlify.com/sites/suspicious-jackson-84d7b9/deploys)

This is the source code for tcgarvin.com. It is a static site built with [Astro](https://astro.build) and deployed by Netlify on every push to `master` (build settings live in `netlify.toml`).

## Development

```sh
npm install
npm run dev      # local dev server
npm run build    # static output in dist/
```

## Layout

- `src/pages/` — one `.astro` file per page (`/`, `/code/`, `/trafcap/`, 404).
- `src/layouts/Layout.astro`, `src/components/` — shared page shell, header, and project cards.
- `public/css/tcgarvin.css` — the site's stylesheet: the frozen compiled output of the original Gatsby build (Bootstrap 3 + custom styles), kept verbatim so the design is unchanged.
- `public/html/blackjack.html` — standalone blackjack simulation with its own scripts and styles.
- `public/sw.js` — removes the service worker the old Gatsby site installed; safe to delete once old visitors have cycled through (2027+).
