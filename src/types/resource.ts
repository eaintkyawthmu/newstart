// schemas/resource.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'Unique identifier for this resource in the URL (e.g., "budget-template").',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3, // More rows for a document-level description
      description: 'A brief description of what this resource is and its purpose.'
    }),
    defineField({
      name: 'resourceType',
      title: 'Resource Type',
      type: 'string',
      options: {
        list: [
          { title: 'Template (File)', value: 'template' },
          { title: 'Worksheet (File)', value: 'worksheet' },
          { title: 'Checklist (File)', value: 'checklist' },
          { title: 'Guide (File)', value: 'guide' },
          { title: 'External Link', value: 'link' },
          { title: 'Video (Embed/Link)', value: 'video' },
          { title: 'Tool (External Application/Website)', value: 'tool' }
        ],
        layout: 'dropdown'
      },
      validation: Rule => Rule.required(),
      description: 'Select the primary type of this resource.'
    }),
    defineField({
      name: 'file',
      title: 'File Upload',
      type: 'file',
      description: 'Upload a file for this resource (e.g., PDF, spreadsheet).',
      // Only show if resourceType is file-based
      hidden: ({ parent }) => !['template', 'worksheet', 'checklist', 'guide'].includes((parent as any)?.resourceType),
      validation: Rule => Rule.custom((file, context) => {
        const parent = context.parent as any;
        if (['template', 'worksheet', 'checklist', 'guide'].includes(parent?.resourceType) && !file) {
          return 'File is required for this resource type.';
        }
        return true;
      }),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      description: 'Enter the URL for external links, videos, or tools.',
      // Only show if resourceType is URL-based
      hidden: ({ parent }) => ['template', 'worksheet', 'checklist', 'guide'].includes((parent as any)?.resourceType),
      validation: Rule => Rule.custom((url, context) => {
        const parent = context.parent as any;
        if (['link', 'video', 'tool'].includes(parent?.resourceType) && !url) {
          return 'URL is required for this resource type.';
        }
        return true;
      }),
    }),
    defineField({
      name: 'openInNewTab',
      title: 'Open URL in New Tab?',
      type: 'boolean',
      initialValue: true,
      description: 'Should this external link or video open in a new browser tab?',
      hidden: ({ parent }) => ['template', 'worksheet', 'checklist', 'guide'].includes((parent as any)?.resourceType),
    }),
    defineField({
      name: 'relatedLessons',
      title: 'Related Lessons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lesson' }] }],
      description: 'Link this resource to specific lessons where it is relevant.'
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags' // Display as tags for better UX
      },
      description: 'Add keywords or topics to categorize this resource.'
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'resourceType',
    },
    prepare({ title, subtitle }) {
      return {
        title: title,
        subtitle: `Type: ${subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : 'N/A'}`
      };
    },
  },
});