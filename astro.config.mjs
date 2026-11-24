import { defineConfig } from 'astro/config';
import watchFieldNotes from './scripts/watch-field-notes.mjs';

export default defineConfig({
  site: 'https://ownerlens.dev',
  output: 'static',
  integrations: [watchFieldNotes]
});
