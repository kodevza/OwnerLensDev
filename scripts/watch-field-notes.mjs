import { execFile } from 'node:child_process';
import { join, relative, resolve, sep } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

export default {
  name: 'watch-field-notes',
  hooks: {
    'astro:server:setup'({ server, logger }) {
      const root = server.config.root;
      const sources = join(root, 'content', 'field-notes');
      const exporter = join(root, '.agents', 'skills', 'linkedin-mermaid', 'scripts', 'export.sh');
      const pending = new Set();
      let exporting = false;

      async function exportPending() {
        if (exporting) return;
        exporting = true;

        try {
          for (const slug of pending) {
            pending.delete(slug);
            const input = join(sources, slug, 'index.mmd.md');
            const output = join(root, 'src', 'pages', 'field-notes', slug, 'index.md');
            logger.info(`Generating ${slug}`);
            try {
              await run('bash', [exporter, '--astro', input, output], { cwd: root });
              logger.info(`Updated ${slug}`);
            } catch (error) {
              logger.error(`Could not generate ${slug}\n${error.stderr?.trim() || error.message}`);
            }
          }
        } finally {
          exporting = false;
        }
      }

      function queueExport(file) {
        const parts = relative(sources, resolve(root, file)).split(sep);
        const [slug, name] = parts;
        if (parts.length !== 2 || slug === '..' || name !== 'index.mmd.md') return;
        pending.add(slug);
        void exportPending();
      }

      server.watcher.on('add', queueExport);
      server.watcher.on('change', queueExport);
      server.watcher.add(sources);
    }
  }
};
