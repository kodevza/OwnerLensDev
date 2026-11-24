import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

test('SVG export gives dotted links and sequence replies visible gaps', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'mermaid-dashed-lines-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = join(directory, 'source.mmd.md');
  const output = join(directory, 'index.md');
  await writeFile(input, [
    '```mermaid',
    'block-beta',
    '    A["One"] B["Two"] C["Three"]',
    '    A -.- B',
    '    B --- C',
    '```',
    '',
    '```mermaid',
    'sequenceDiagram',
    '    A->>B: Request',
    '    B-->>A: Reply',
    '```',
    ''
  ].join('\n'));
  const exporter = fileURLToPath(new URL('../scripts/export.sh', import.meta.url));
  execFileSync('bash', [exporter, '--astro', input, output]);

  const markdown = await readFile(output, 'utf8');
  const diagrams = [...markdown.matchAll(/\]\(\.\/(diagrams\/[^)\s]+\.svg)(?=[\s)])/g)];
  assert.equal(diagrams.length, 2);
  const [block, sequence] = await Promise.all(
    diagrams.map(([, path]) => readFile(join(directory, path), 'utf8'))
  );
  assert.match(block, /<path\b[^>]*class="[^"]*edge-pattern-dotted/);
  assert.match(block, /\.edge-pattern-dotted\{stroke-dasharray:\s*3[ ,]+5/);
  assert.match(block, /\.edge-pattern-solid\{stroke-dasharray:0;/);
  assert.match(sequence, /\.messageLine1\{stroke-dasharray:\s*7[ ,]+5\s*!important/);
});
