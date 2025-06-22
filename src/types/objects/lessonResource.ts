// schemas/objects/lessonResource.ts
import { defineField, defineType } from 'sanity';

export default defineType({ // This should be the default export
  name: 'lessonResource', // This name must match the 'type' in your 'lesson' schema
  title: 'Lesson Resource',
  type: 'object', // It's an object type, not a document
  fields: [
    defineField({
      name: 'title',
      title: 'Resource Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'A short description of the resource.',
    }),
    defineField({
      name: 'resourceType',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Downloadable File (PDF)', value: 'pdf' },
          { title: 'Video (Embed/Link)', value: 'video' },
          { title: 'External Link', value: 'externalLink' },
        ],
        layout: 'dropdown',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'file',
      title: 'File (for PDFs)',
      type: 'file', // Sanity's file type for uploads
      hidden: ({ parent }) => (parent as any)?.resourceType !== 'pdf', // Only show if type is pdf
    }),
    defineField({
      name: 'url',
      title: 'URL (for Video/External Link)',
      type: 'url', // Sanity's URL type
      hidden: ({ parent }) => (parent as any)?.resourceType === 'pdf', // Hide if type is pdf
      validation: (Rule) =>
        Rule.custom((url, context) => {
          if ((context.parent as any)?.resourceType !== 'pdf' && !url) {
            return 'URL is required for Video/External Link types.';
          }
          return true;
        }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open in New Tab?',
      type: 'boolean',
      initialValue: true,
      hidden: ({ parent }) => (parent as any)?.resourceType === 'pdf', // Not relevant for PDF downloads
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'resourceType',
    },
  },
});