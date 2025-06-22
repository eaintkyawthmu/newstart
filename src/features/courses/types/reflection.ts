import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'reflection',
  title: 'Reflection',
  type: 'document',
  fields: [
    defineField({
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lesson',
      title: 'Lesson',
      type: 'reference',
      to: [{ type: 'lesson' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'content',
      title: 'Reflection Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }),
    defineField({
      name: 'isPrivate',
      title: 'Private',
      type: 'boolean',
      description: 'If true, only the user and admins can see this reflection',
      initialValue: true
    })
  ]
});
