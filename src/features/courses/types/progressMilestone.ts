import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'progressMilestone',
  title: 'Progress Milestone',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'requirement',
          fields: [
            defineField({
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Complete Lesson', value: 'lesson' },
                  { title: 'Complete Path', value: 'path' },
                  { title: 'Complete Tasks', value: 'tasks' },
                  { title: 'Pass Quiz', value: 'quiz' }
                ]
              },
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'reference',
              title: 'Reference',
              type: 'reference',
              to: [
                { type: 'lesson' },
                { type: 'journeyPath' },
                { type: 'quiz' }
              ],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'count',
              title: 'Count',
              type: 'number',
              description: 'Number of items required (e.g., 3 tasks)',
              initialValue: 1
            })
          ]
        }
      ],
      validation: Rule => Rule.min(1).error('A milestone needs at least one requirement')
    }),
    defineField({
      name: 'reward',
      title: 'Reward',
      type: 'object',
      fields: [
        defineField({
          name: 'type',
          title: 'Reward Type',
          type: 'string',
          options: {
            list: [
              { title: 'Badge', value: 'badge' },
              { title: 'Certificate', value: 'certificate' },
              { title: 'Unlock Content', value: 'content' }
            ]
          }
        }),
        defineField({
          name: 'description',
          title: 'Reward Description',
          type: 'text'
        }),
        defineField({
          name: 'image',
          title: 'Reward Image',
          type: 'image',
          options: {
            hotspot: true
          }
        })
      ]
    })
  ]
});
