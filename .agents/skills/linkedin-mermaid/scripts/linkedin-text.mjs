import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dump, load } from 'js-yaml';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

const [source, stage, sequenceCssPath] = process.argv.slice(2);
const markdown = (await readFile(source, 'utf8')).replace(/^\uFEFF/, '');
const frontmatterPattern = /^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m;
const frontmatter = frontmatterPattern.exec(markdown);
const metadata = frontmatter?.index === 0 ? load(frontmatter[1]) : undefined;
const body = frontmatter?.index === 0 ? markdown.slice(frontmatter[0].length) : markdown;
const tree = unified().use(remarkParse).use(remarkGfm).parse(body);
const diagrams = [];
const definitions = new Map();

function collectDefinitions(node) {
  if (node.type === 'definition' && !definitions.has(node.identifier)) {
    definitions.set(node.identifier, node.url);
  }
  node.children?.forEach(collectDefinitions);
}

function plainLink(label, url) {
  if (!url || label === url) return label;
  return label ? `${label} (${url})` : url;
}

function render(node) {
  switch (node.type) {
    case 'root':
    case 'blockquote':
    case 'listItem':
      return renderBlocks(node.children);
    case 'break':
      return '\n';
    case 'definition':
    case 'thematicBreak':
      return '';
    case 'html':
      return node.value.replace(/<!--[^]*?-->/g, '').replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '');
    case 'link':
      return plainLink(node.children.map(render).join(''), node.url);
    case 'linkReference':
      return plainLink(node.children.map(render).join(''), definitions.get(node.identifier));
    case 'image':
    case 'imageReference':
      return node.alt ?? '';
    case 'list':
      return node.children.map((item, index) => {
        const prefix = node.ordered ? `${node.start + index}. ` : '• ';
        const continuation = ' '.repeat(prefix.length);
        return prefix + render(item).replace(/\n(?=\S)/g, `\n${continuation}`);
      }).join('\n');
    case 'table':
      return node.children.map(render).join('\n');
    case 'tableRow':
      return node.children.map(render).join(' — ');
    case 'code':
      if (node.lang?.toLowerCase() !== 'mermaid') return node.value;
      diagrams.push(node.value);
      return `[Diagram ${diagrams.length}]`;
    default:
      return node.children?.map(render).join('') ?? node.value ?? '';
  }
}

function renderBlocks(nodes) {
  return nodes.map(render).filter((block) => block.trim()).join('\n\n');
}

collectDefinitions(tree);
const title = typeof metadata?.title === 'string' ? metadata.title.trim() : '';
const firstBlock = tree.children.find((node) => node.type !== 'definition');
const needsTitle = title && !(firstBlock?.type === 'heading' && render(firstBlock).trim() === title);
const article = [needsTitle ? title : '', render(tree)].filter(Boolean).join('\n\n');
await writeFile(join(stage, 'export', 'article.txt'), article ? `${article.trim()}\n` : '');
if (diagrams.length > 0) {
  const sequenceCss = await readFile(sequenceCssPath, 'utf8');
  const fence = '```';
  const mermaidOnly = diagrams.map((code) => {
    const header = frontmatterPattern.exec(code);
    if (header?.index === 0) {
      const definition = code.slice(header[0].length);
      if (/^\s*sequenceDiagram\b/.test(definition)) {
        const settings = load(header[1]);
        if (typeof settings?.config?.themeCSS === 'string') {
          // Mermaid gives diagram frontmatter precedence over the CLI stylesheet.
          settings.config.themeCSS = `${sequenceCss}\n${settings.config.themeCSS}`;
          code = `---\n${dump(settings, { lineWidth: -1 })}---\n${definition}`;
        }
      }
    }
    return `${fence}mermaid\n${code}\n${fence}`;
  }).join('\n\n');
  await writeFile(join(stage, 'source.md'), `${mermaidOnly}\n`);
}
console.log(diagrams.length);
