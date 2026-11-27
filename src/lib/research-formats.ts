export const researchFormats = {
  'technical-note': {
    title: 'Technical notes',
    label: 'Technical note',
    description: 'Focused explanations of identity signals, controls and implementation details.',
  },
  'reference-design': {
    title: 'Reference designs',
    label: 'Reference design',
    description: 'Architecture patterns that connect identity, access controls and policy.',
  },
  'case-study': {
    title: 'Case studies',
    label: 'Case study',
    description: 'Examples of putting ownership evidence to work in tools and reviews.',
  },
};

export type ResearchFormat = keyof typeof researchFormats;
