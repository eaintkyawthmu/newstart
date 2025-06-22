// schemas/quiz.ts (UPDATED)
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
      name: 'scenario', // NEW: Scenario-based context
      title: 'Real-world Scenario',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'A brief, real-world situation that provides context for the quiz questions.',
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
              title: 'Immediate Feedback (Optional)', // Renamed for clarity
              type: 'text',
              rows: 2,
              description: 'Provide a brief explanation shown immediately after the answer is submitted.',
            }),
            defineField({
              name: 'practicalApplication', // NEW: Practical application for each question
              title: 'Real-world Relevance',
              type: 'text',
              rows: 2,
              description: 'Explain how this specific question/concept applies in a real-world scenario.',
            }),
            defineField({
              name: 'followUpAction', // NEW: Follow-up action per question
              title: 'Next Step After Question',
              type: 'text',
              rows: 2,
              description: 'A concrete action the learner can take based on this question/feedback.',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.min(1).error('A quiz needs at least one question.'),
    }),
    defineField({
      name: 'actionPlan', // NEW: Post-quiz action plan
      title: 'Post-Quiz Action Plan',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Specific actionable steps learners should take after completing the entire quiz, regardless of score.',
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