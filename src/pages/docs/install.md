---
layout: ../../layouts/DocLayout.astro
title: Install OwnerLens
description: Basic local install and run flow for the OwnerLens site and project.
---

## Website development

```bash
npm install
npm run dev
```

Build static output:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## OwnerLens tool

Link this section to the real OwnerLens install command when the package flow is stable. Do not over-document unstable installation steps on the public site.

Recommended structure:

```text
Install
Collect tenant data
Open local report
Export evidence
```

## Deployment

This Astro site builds to `dist/`. Cloudflare Pages can deploy it with:

```text
Build command: npm run build
Output directory: dist
```
