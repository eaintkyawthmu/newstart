import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'practicalExercise',
  title: 'Practical Exercise',
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
      name: 'steps',
      title: 'Exercise Steps',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'step',
          fields: [
            defineField({
              name: 'instruction',
              title: 'Instruction',
              type: 'array',
              of: [{ type: 'block' }],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'expectedOutcome',
              title: 'Expected Outcome',
              type: 'text',
              description: 'What the learner should achieve after completing this step'
            })
          ]
        }
      ],
      validation: Rule => Rule.min(1).error('An exercise needs at least one step')
    }),
    defineField({
      name: 'estimatedTime',
      title: 'Estimated Time',
      type: 'string',
      description: 'How long this exercise typically takes (e.g., "15 minutes")'
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' }
        ]
      },
      initialValue: 'beginner'
    }),
    defineField({
      name: 'relatedLessons',
      title: 'Related Lessons',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'lesson' }] }]
    })
  ]
});
