import type { ResearchFormat } from './research-formats';

interface NoteFrontmatter {
  title?: string;
  description?: string;
  topics?: string[];
  format?: ResearchFormat;
}

const modules = import.meta.glob<{ frontmatter: NoteFrontmatter }>('../pages/field-notes/*/index.md', { eager: true });
export const notes = Object.entries(modules)
  .map(([path, { frontmatter }]) => {
    const slug = path.split('/').at(-2)!;

    return {
      title: (frontmatter.title ?? slug).replace(/^Field Note:\s*/i, ''),
      description: frontmatter.description ?? '',
      topics: frontmatter.topics ?? [],
      format: frontmatter.format ?? 'technical-note',
      url: `/field-notes/${slug}/`,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title, 'en'));
