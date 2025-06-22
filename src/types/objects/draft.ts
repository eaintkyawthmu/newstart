import { defineType, defineField } from 'sanity'

const resource = defineType({
  name: 'resource',
  title: 'Resource',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'file_url', title: 'File URL', type: 'url' }),
    defineField({ name: 'file_size', title: 'File Size', type: 'string' }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: ['PDF', 'Link', 'Document', 'Video'],
      }
    }),
  ]
})

export default resource
