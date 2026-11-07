# Narayana Rongali: Portfolio

A fast, static portfolio for a Senior Data Engineer, built with React, Vite and Tailwind CSS.

## Run it

```bash
npm install
npm run dev
```

`npm run build` writes a prerendered site to `dist/`, ready for any static host. Check it with `npm run preview`.

## Where things live

| Path | What it does |
| --- | --- |
| `src/data/resume.js` | All copy, and the tables behind the SQL console. Edit this first. |
| `src/components/ui/PortfolioUI.jsx` | Navigation and every page section |
| `src/components/ui/PipelineDag.jsx` | The animated pipeline graph in the hero |
| `src/components/ui/QueryConsole.jsx` | The SQL console UI |
| `src/lib/miniSql.js` | The read-only SQL engine |
| `scripts/prerender.mjs` | Writes the rendered page into `dist/index.html` |

To add a code link to a project, set its `repo` field. To show a GitHub button, set `profile.github`.

## Keeping it fast

- No WebGL, animation libraries, scroll listeners or `backdrop-filter`.
- Scroll effects use CSS scroll timelines, which browsers run off the main thread.
- The graph uses SMIL animation and pauses while off-screen.
- The page is prerendered, so content paints before JavaScript runs.
