# ownerlens.dev

Astro static site for OwnerLens, a technical knowledge base on non-human identity.

## Why Astro

This site keeps the useful Hugo pattern: content lives in Markdown files. The difference is that the site is TypeScript-friendly and can use Astro/React-style components when needed.

## Structure

```text
src/pages/index.astro                 knowledge base home
src/pages/research/index.astro        Research Library and filters
src/pages/topics/                     knowledge domain pages
src/lib/topics.ts                     domain definitions and reference sources
src/pages/tools/                      open-source tools and OwnerLens overview
src/pages/how-it-works.astro          OwnerLens tool overview
src/pages/extend.astro                external evidence/enrichment model
src/pages/docs/*.md                   docs from Markdown
src/pages/field-notes/*/index.md      knowledge entries and their assets
public/code-copy.js                   copy buttons for selected code blocks
```

## Run locally

```bash
npm install
npm run dev
```

Saving a Field Note source at `content/field-notes/<slug>/index.mmd.md` while the dev server is running regenerates the Astro page and its SVG diagrams. [Mermaid export instructions](.agents/skills/linkedin-mermaid/SKILL.md)

## Export a field note for LinkedIn

```bash
bash .agents/skills/linkedin-mermaid/scripts/export.sh --linkedin \
  content/field-notes/governing-ai-agents-through-purpose-bound-access/index.mmd.md
```

The command writes `article.txt` and numbered PNG diagrams to `export/<slug>/`. Paste the text into the LinkedIn article editor and replace each `[Diagram N]` marker with `diagram-N.png`.

## Build

```bash
npm run build
```

Static output goes to `dist/`.

## Add a field note

```bash
npm run new:note -- entra-risk-review "Field Note: Entra Risk Review"
```

Add one or more domain slugs from `src/lib/topics.ts` to the entry’s `topics` frontmatter. Each entry appears on every domain page it is tagged with and can be filtered by domain in the Research Library. Set `format` to `technical-note`, `reference-design`, or `case-study`. For Mermaid articles, edit the source under `content/field-notes/` so the topics survive regeneration.

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
