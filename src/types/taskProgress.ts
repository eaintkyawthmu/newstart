import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'taskProgress',
  title: 'Task Progress',
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
      name: 'taskKey',
      title: 'Task Key',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'completed',
      title: 'Completed',
      type: 'boolean',
      initialValue: false
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime'
    }),
    defineField({
      name: 'notes',
      title: 'User Notes',
      type: 'text',
      description: 'Notes or reflections from the user about this task'
    })
  ],
  preview: {
    select: {
      title: 'taskKey',
      subtitle: 'user.name'
    }
  }
});
