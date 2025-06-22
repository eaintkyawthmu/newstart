import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'journeyPath',
  title: 'Journey Path',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'whoIsItFor',
      title: 'Who Is This Program For?',
      type: 'array', // Use array of blocks for rich text capabilities
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
          }
        }
      ],
      description: 'Clearly define the target audience for this journey path.',
    }),
    defineField({
      name: 'howItHelps',
      title: 'How This Journey Path Will Help You',
      type: 'array', // Use array of blocks for rich text capabilities
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
          }
        }
      ],
      description: 'Explain the core benefits and approach of this journey path.',
    }),
    defineField({ name: 'duration', title: 'Duration', type: 'string' }),
    defineField({ name: 'rating', title: 'Rating', type: 'number' }),
    defineField({ name: 'enrolled', title: 'Enrolled', type: 'number' }),
    defineField({ name: 'isPremium', title: 'Premium Content?', type: 'boolean' }),
    defineField({
      name: 'level',
      title: 'Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' }
        ]
      }
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for screen readers and SEO.',
        }),
      ],
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'module' }] }]
    }),
    defineField({
      name: 'objectives',
      title: 'Learning Objectives',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List the key learning objectives for this journey path'
    })
  ]
});