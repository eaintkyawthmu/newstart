import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'glossaryTerm',
  title: 'Glossary Term',
  type: 'document',
  fields: [
    defineField({
      name: 'term',
      title: 'Term',
      type: 'string',
      validation: (Rule) => Rule.required().unique(),
      description: 'The word or phrase to define.',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'term',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'Unique identifier for the term (e.g., for linking/anchors).',
    }),
    defineField({
      name: 'definition',
      title: 'Definition',
      type: 'array', // Using Portable Text for rich definitions
      of: [{ type: 'block' }],
      validation: (Rule) => Rule.required(),
      description: 'The explanation of the term.',
    }),
  ],
  preview: {
    select: {
      title: 'term',
      subtitle: 'definition',
    },
  },
});