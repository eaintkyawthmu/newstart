import { defineType, defineField } from 'sanity'

const module = defineType({
  name: 'module',
  title: 'Module',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 }
    }),
    defineField({ name: 'order', title: 'Order', type: 'number' }),
    defineField({
      name: 'description',
      title: 'Module Overview',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'journeyPath',
      title: 'Journey Path',
      type: 'reference',
      to: [{ type: 'journeyPath' }]
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lesson' }] }]
    }),
  ]
})

export default module
