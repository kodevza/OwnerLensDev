# ownerlens.dev

Astro static site for OwnerLens.

## Why Astro

This site keeps the useful Hugo pattern: content lives in Markdown files. The difference is that the site is TypeScript-friendly and can use Astro/React-style components when needed.

## Structure

```text
src/pages/index.astro                 landing page
src/pages/how-it-works.astro          product explanation
src/pages/extend.astro                external evidence/enrichment model
src/pages/docs/*.md                   docs from Markdown
src/pages/field-notes/*/index.md      migrated field notes from the old Hugo repo
public/code-copy.js                   copy buttons for selected code blocks
```

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Static output goes to `dist/`.

## Add a field note

```bash
npm run new:note -- entra-risk-review "Field Note: Entra Risk Review"
```

Each field note is a Markdown page bundle:

```text
src/pages/field-notes/my-note/
  index.md
  001-screenshot.png
  002-screenshot.png
```

Reference screenshots from `index.md`:

```md
![Short description](001-screenshot.png)
```

## Cloudflare Pages

Recommended setup:

```text
Build command: npm run build
Output directory: dist
Root directory: /
```

`ownerlens.dev` requires HTTPS. Cloudflare Pages handles that cleanly.

## GitHub Pages

A GitHub Pages workflow is included in `.github/workflows/deploy.yml`. In repository settings, set Pages source to GitHub Actions.
