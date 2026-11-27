import { defineConfig } from 'astro/config';
import watchFieldNotes from './scripts/watch-field-notes.mjs';

export default defineConfig({
  site: 'https://ownerlens.dev',
  output: 'static',
  markdown: { shikiConfig: { theme: 'github-light' } },
  redirects: { '/field-notes/': '/research/', '/projects/': '/tools/' },
  integrations: [watchFieldNotes]
});
