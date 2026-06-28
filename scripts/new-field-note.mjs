import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [slug, title] = process.argv.slice(2);

if (!slug || !title) {
  console.error('Usage: npm run new:note -- my-note-slug "My note title"');
  process.exit(1);
}

const dir = join(process.cwd(), 'src/pages/field-notes', slug);
await mkdir(dir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const markdown = `---
layout: ../../../layouts/FieldNoteLayout.astro
title: "${title.replaceAll('"', '\\"')}"
date: ${today}
slug: "${slug}"
description: ""
warning: "Always verify current vendor documentation before treating this note as implementation guidance."
---

Write the note here.

## Screenshots

![Screenshot](001-screenshot.png)
`;

await writeFile(join(dir, 'index.md'), markdown, 'utf8');
console.log(`Created src/pages/field-notes/${slug}/index.md`);
