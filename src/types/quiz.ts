import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Quiz Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Provide a descriptive title for the quiz, e.g., "Emergency Essentials Quiz".',
    }),
    defineField({
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'question',
          title: 'Question',
          fields: [
            defineField({
              name: 'questionText',
              title: 'Question Text',
              type: 'text',
              rows: 2,
              validation: (Rule) => Rule.required(),
              description: 'The text of the question being asked.',
            }),
            defineField({
              name: 'questionType',
              title: 'Question Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Multiple Choice (Single Answer)', value: 'multipleChoice' },
                  { title: 'True/False', value: 'trueFalse' },
                  // Add more types if needed, like 'multipleSelect'
                ],
                layout: 'dropdown',
              },
              initialValue: 'multipleChoice',
              validation: (Rule) => Rule.required(),
              description: 'Select the type of question.',
            }),
            defineField({
              name: 'options',
              title: 'Options',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'option',
                  title: 'Option',
                  fields: [
                    defineField({
                      name: 'text',
                      title: 'Option Text',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                      description: 'The text for this option.',
                    }),
                    defineField({
                      name: 'isCorrect',
                      title: 'Is Correct?',
                      type: 'boolean',
                      initialValue: false,
                      description: 'Mark whether this option is correct.',
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'text',
                      subtitle: 'isCorrect',
                    },
                    prepare({ title, subtitle }) {
                      return {
                        title: title,
                        subtitle: subtitle ? 'Correct' : 'Incorrect',
                      };
                    },
                  },
                },
              ],
              validation: (Rule) => Rule.min(2).error('A question needs at least two options.'),
              hidden: ({ parent }) => parent?.questionType === 'trueFalse',
            }),
            defineField({
              name: 'correctAnswer',
              title: 'Correct Answer (for True/False)',
              type: 'boolean',
              hidden: ({ parent }) => parent?.questionType !== 'trueFalse',
              description: 'Specify the correct answer for True/False questions.',
            }),
            defineField({
              name: 'feedback',
              title: 'Feedback (Optional)',
              type: 'text',
              rows: 2,
              description: 'Provide an explanation shown after the answer is submitted.',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).error('A quiz needs at least one question.'),
    }),
    defineField({
      name: 'associatedLesson',
      title: 'Associated Lesson',
      type: 'reference',
      to: [{ type: 'lesson' }],
      description: 'Link the quiz to a specific lesson.',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      questionCount: 'questions.length',
    },
    prepare({ title, questionCount }) {
      return {
        title: title,
        subtitle: `${questionCount || 0} questions`,
      };
    },
  },
});