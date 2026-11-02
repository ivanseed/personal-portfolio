# Portfolio Modernisation Plan

## 1. Where the project is today

| Area | Current state |
|---|---|
| Framework | React 15.6 (class components), Create React App `react-scripts` 1.0.7 (2017) |
| Styling | SCSS compiled by `node-sass-chokidar` (deprecated, needs native Node bindings, fails on modern Node) |
| Pre-render | `react-snapshot` (unmaintained) |
| Deploy | Built output committed into `/docs`, served by GitHub Pages from the `docs/` folder. Custom domain `ivanseed.co.uk` via `docs/CNAME` |
| Content | JSON-driven: `src/about.json` (terminal-style "ivan --role" commands), `src/projects.json` (4 projects), `src/contact.json` |
| Out-of-date content | Role "Consultant, Infinity Works", CV marked "deprecated since 2018", projects from 2017-2019 |
| Tooling | Both `yarn.lock` and `package-lock.json`, no lint/type checks, a placeholder test, a disabled service worker |

The existing project will not install or build on a current Node version, so this is a rewrite rather than an upgrade. The idea worth keeping is that content lives in data files, separate from components.

## 2. Target stack

- **Vite + React 19 + TypeScript.** Vite is the standard replacement for CRA, which is no longer maintained.
- **Plain CSS with custom properties** (CSS Modules per component). The design is small and minimal, so Tailwind or a component library would add weight without much benefit. Sass is no longer needed: native CSS has nesting and variables.
- **No runtime dependencies beyond React.** The interactive grid is written by hand (Canvas 2D or CSS grid, see section 4).
- **ESLint + `tsc --noEmit`** for checks, **Vitest** for a few small tests (grid logic, content rendering).
- **One package manager (npm).** Remove `yarn.lock`.
- **Content in a typed `src/content.ts` file** in place of the three JSON files, so mistakes show up as type errors.

## 3. Page design: one screen, minimalist

Inspired by the screenshot: off-white background, thin light-grey grid lines, a handful of cells filled with a green-to-cyan gradient (approx. `#c6f36b` to `#a8e3f0`), and white content cards that sit on top of the grid with a hairline border.

Desktop layout (fits in the viewport, no scrolling):

```
+-----------------------------------------------------------+
|  grid background (interactive)                            |
|                                                           |
|   +---------------------------+     [gradient cell]       |
|   |  Ivan Seed                |                           |
|   |  <current role>, <city>   |   [gradient]              |
|   |  One or two line bio      |                           |
|   |                           |                           |
|   |  LinkedIn  GitHub  Email ↗|                           |
|   +---------------------------+                           |
|                                                           |
|   +--------+ +--------+ +--------+   <- optional small    |
|   |Project | |Project | |Project ↗|     project cards     |
|   +--------+ +--------+ +--------+     snapped to grid    |
|   [gradient]                     [gradient]               |
+-----------------------------------------------------------+
```

- Cards snap to the grid so they look like they are part of it, as in the screenshot.
- Links use the small "↗" gradient cell from the screenshot as their hover/arrow motif.
- Typography: one sans-serif (system font stack or Inter), large name, small muted secondary text.
- Mobile: cards stack vertically and the page may scroll; the grid stays as the background.
- Accessibility: real `<a>` links, visible focus states, text contrast at WCAG AA, and the grid is decorative (`aria-hidden`).

## 4. Interaction ideas

The grid is the main interactive element. Proposed default is **A + B**; C and D are optional extras.

- **A. Cursor trail (default).** Cells near the pointer fill with the gradient and fade out over about a second, so moving the mouse "paints" a short trail.
- **B. Click to pin.** Clicking or tapping an empty cell pins it as a permanent gradient cell. A small "reset" control clears them. Pinned cells could be saved in `localStorage`.
- **C. Game of Life mode.** A small toggle runs Conway's Game of Life on the pinned cells, so the user's pattern evolves. This would be a nod to the old terminal-style easter-egg feel.
- **D. Hover-linked tiles.** Hovering a project or link card lights up the grid cells around it.

Implementation notes:
- Render the grid on a single `<canvas>` sized to the viewport and redraw on `requestAnimationFrame` only while something is animating, so it costs nothing when idle.
- Recompute the grid on resize and handle high-DPI screens with `devicePixelRatio`.
- Respect `prefers-reduced-motion`: no trail animation, cells change instantly.
- Touch: tap to pin; the trail follows a finger drag.

## 5. Deployment to GitHub Pages

- Replace the "commit build output into `/docs`" approach with a **GitHub Actions workflow** (`.github/workflows/deploy.yml`) that runs lint, type check, tests and build, then publishes with `actions/deploy-pages`.
- Keep the custom domain by putting `CNAME` (`ivanseed.co.uk`) in `public/` so Vite copies it into the build.
- Because a custom domain is used, Vite `base` stays `/`. Without the custom domain it would need to be `/personal-portfolio/`.
- **Manual step for you:** in the repo's Settings → Pages, change the source from "Deploy from a branch (/docs)" to "GitHub Actions". I will not change repo settings or push.

## 6. Work steps

1. Create a branch `modernise` and remove the old CRA/SCSS source, `docs/` build output, `yarn.lock`, service worker and old images that are no longer used (all still in git history).
2. Scaffold Vite + React + TS, ESLint, Vitest, base CSS (colour tokens, grid size, typography).
3. Build the `GridBackground` canvas component with the chosen interactions.
4. Build the content cards (`IntroCard`, `LinksCard`, `ProjectCard`) driven by `src/content.ts`.
5. Responsive layout, reduced motion, keyboard and contrast checks.
6. Add metadata: title, description, Open Graph tags and image, favicon.
7. Add the GitHub Actions deploy workflow and `public/CNAME`.
8. Verify locally with `npm run build && npm run preview`, run lint/type check/tests, then commit on the branch for you to review and push.

## 7. Questions for you

1. **Current role and bio.** LinkedIn blocks automated reads, so I couldn't pull your profile. What is your current title, company and location, and do you want a one or two line bio? (The screenshot suggests AWS. Can I mention it?)
2. **Projects.** Show a few project cards, or keep the page to just intro + links? If cards, which projects are still worth showing (Moving Places, Sky Sport Germany, GitStats, Portfolio, or newer ones)?
3. **Links.** LinkedIn, GitHub, and email `hello@ivanseed.co.uk`. Is the email still valid? Should the outdated `cv.pdf` be dropped?
4. **Domain.** Do you still own `ivanseed.co.uk`, or should the site live at `ivanseed.github.io/personal-portfolio`?
5. **Interaction.** Happy with cursor trail + click to pin as the default? Want the Game of Life toggle?
6. **Old terminal style.** Drop it completely, or keep a small nod to it (for example a monospace `ivan --role` line)?
7. **Dark mode.** Light only, or follow the system theme with a dark variant?
