# ivanseed.co.uk

Single-page personal site. React 19 + TypeScript + Vite, deployed to GitHub Pages.

The background is an interactive grid drawn on a canvas: moving the pointer paints a fading gradient trail, and clicking (or tapping) a square keeps it coloured in. Kept squares are saved in `localStorage`. The page follows the system light/dark theme and respects reduced-motion settings.

## Editing content

All copy is in `src/content.ts`.

## Commands

| Action | Command |
| --- | --- |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Type check | `npm run typecheck` |
| Tests | `npm test` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |

## Deployment

Pushing to `master` runs `.github/workflows/deploy.yml`, which lints, tests, builds and publishes `dist/` to GitHub Pages. The custom domain comes from `public/CNAME`.

One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.
