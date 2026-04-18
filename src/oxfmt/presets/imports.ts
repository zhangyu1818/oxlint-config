import type { SortImportsOptions } from '../../types.ts'

export const defaultSortImports: SortImportsOptions = {
  customGroups: [
    {
      elementNamePattern: ['next', 'next/**'],
      groupName: 'next',
    },
    {
      elementNamePattern: ['react', 'react-dom', 'react-dom/**'],
      groupName: 'react',
    },
    {
      elementNamePattern: ['three', 'three/**'],
      groupName: 'three',
    },
    {
      elementNamePattern: ['@react-three/**'],
      groupName: 'reactThree',
    },
  ],
  groups: [
    'value-builtin',
    'next',
    'react',
    'three',
    'reactThree',
    'value-external',
    'value-internal',
    ['value-index', 'value-sibling', 'value-parent'],
    'type-builtin',
    'type-external',
    'type-internal',
    ['type-index', 'type-sibling', 'type-parent'],
    'style',
    'side_effect',
    'side_effect_style',
    'unknown',
  ],
  ignoreCase: false,
  internalPattern: ['^@/.*', '^~/.*'],
  newlinesBetween: true,
  order: 'asc',
  partitionByComment: false,
  partitionByNewline: false,
  sortSideEffects: true,
}
