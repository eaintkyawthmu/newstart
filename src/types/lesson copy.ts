// schemas/lesson.ts (UPDATED)
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Lesson Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'Unique identifier for this lesson in the URL (e.g., "what-is-credit", "applying-for-loans").',
    }),
    defineField({
      name: 'order',
      title: 'Lesson Order',
      type: 'number',
      description: 'The order in which this lesson appears within its module.',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'type',
      title: 'Lesson Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video', value: 'video' },
          { title: 'Reading', value: 'reading' },
          { title: 'Quiz', value: 'quiz' },
          { title: 'Exercise', value: 'exercise' }, // New type
          { title: 'Assessment', value: 'assessment' }, // New type
        ],
        layout: 'dropdown',
      },
      description: 'The primary format of this lesson.',
      initialValue: 'reading',
    }),
    defineField({
      name: 'duration',
      title: 'Estimated Lesson Duration',
      type: 'string',
      description: 'e.g., "15 mins", "5 min video", "10 min quiz"',
    }),
    defineField({
      name: 'introduction',
      title: 'Lesson Introduction',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The opening message for the lesson.',
    }),
    // Replaced learningObjective with measurableDeliverables (interactive outcomes)
    defineField({
      name: 'measurableDeliverables',
      title: 'What You\'ll Be Able to Do', // Renamed for tone
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'task',
          fields: [
            defineField({
              name: 'description',
              title: 'Deliverable Description',
              type: 'array', // Use Portable Text for rich descriptions
              of: [{ type: 'block' }],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'isOptional',
              title: 'Optional Outcome?',
              type: 'boolean',
              description: 'If checked, this outcome is not strictly required to mark lesson complete',
              initialValue: false
            })
          ],
          preview: {
            select: {
              title: 'description'
            },
            prepare({ title }) {
              const block = (title && title[0]) || {};
              const plainText = block.children
                ? block.children.filter((child: any) => child._type === 'span')
                    .map((span: any) => span.text)
                    .join('')
                : '';
              return {
                title: plainText || 'Outcome'
              };
            }
          }
        }
      ],
      description: 'Specific, measurable actions or skills students should gain from this lesson.',
    }),

     // Video-specific fields
    defineField({
      name: 'videoType',
      title: 'Video Type',
      type: 'string',
      options: {
      list: [
      { title: 'YouTube', value: 'youtube' },
      { title: 'Self-hosted', value: 'selfhosted' },
      ],
      },
      hidden: ({ parent }) => parent?.type !== 'video',
      description: 'Choose the type of video content',
    }),
    defineField({
      name: 'youtubeVideoId',
      title: 'YouTube Video ID',
      type: 'string',
      hidden: ({ parent }) => parent?.type !== 'video' || parent?.videoType !== 'youtube',
      description: 'Enter the YouTube video ID (e.g., dQw4w9WgXcQ from https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
      validation: (Rule) => Rule.custom((value, context) => {
      const parent = context.parent as any;
      if (parent?.type === 'video' && parent?.videoType === 'youtube' && !value) {
      return 'YouTube Video ID is required for YouTube videos';
      }
      return true;
      }),
    }),
    defineField({
      name: 'selfHostedVideoUrl',
      title: 'Self-hosted Video URL',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'video' || parent?.videoType !== 'selfhosted',
      description: 'Enter the direct URL to your self-hosted video file',
      validation: (Rule) => Rule.custom((value, context) => {
      const parent = context.parent as any;
      if (parent?.type === 'video' && parent?.videoType === 'selfhosted' && !value) {
      return 'Video URL is required for self-hosted videos';
      }
      return true;
      }),
    }),
    defineField({
      name: 'content',
      title: 'Main Lesson Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
              description: 'Important for SEO and accessibility.',
            }),
            defineField({
              name: 'caption',
              type: 'string',
              title: 'Caption',
            }),
          ],
        },
        // NEW: Inline YouTube embed object within content
        defineField({
          name: 'youtube', // This is the block type name for Portable Text
          title: 'YouTube Embed (Inline)',
          type: 'object',
          fields: [
            defineField({
              name: 'url',
              title: 'YouTube Video URL',
              type: 'url',
              description: 'Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)',
              validation: (Rule) => Rule.required().uri({
                scheme: [/^https:\/\/(www\.)?youtube\.com/, /^https:\/\/(www\.)?youtu\.be/]
              }),
            }),
            defineField({
              name: 'caption',
              title: 'Caption (Optional)',
              type: 'string',
            }),
          ],
        }),
      ],
      description: 'The main textual and embedded media content of the lesson.',
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Summary of the most critical points from the lesson.',
    }),
    // Replaced actionItem with actionableTasks (interactive checklist)
    defineField({
      name: 'actionableTasks',
      title: 'Your Action Plan', // Renamed for tone
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'task',
          fields: [
            defineField({
              name: 'description',
              title: 'Task Description',
              type: 'array', // Use Portable Text for rich descriptions
              of: [{ type: 'block' }],
              validation: Rule => Rule.required()
            }),
            defineField({
              name: 'isOptional',
              title: 'Optional Task?',
              type: 'boolean',
              description: 'If checked, this task is not strictly required to mark lesson complete',
              initialValue: false
            })
          ],
          preview: {
            select: {
              title: 'description'
            },
            prepare({ title }) {
              const block = (title && title[0]) || {};
              const plainText = block.children
                ? block.children.filter((child: any) => child._type === 'span')
                    .map((span: any) => span.text)
                    .join('')
                : '';
              return {
                title: plainText || 'Task'
              };
            }
          }
        }
      ],
      description: 'Specific actions or steps for students to take after this lesson.',
    }),
    defineField({
      name: 'lessonResources',
      title: 'Additional Resources', // Renamed for tone
      type: 'array',
      of: [{ type: 'lessonResource' }], // This line stays the same, referencing the new file
      description: 'Supplementary downloadable files, videos, or external links for this lesson.',
    }),
    defineField({
      name: 'reflectionPrompts',
      title: 'Reflect & Grow', // Renamed for tone
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Questions to encourage self-reflection (optional).',
    }),
    defineField({
      name: 'associatedQuiz',
      title: 'Associated Quiz',
      type: 'reference',
      to: [{ type: 'quiz' }],
      description: 'Link to a quiz related to this lesson (optional).',
    }),
    // NEW: Reference to a Practical Exercise
    defineField({
      name: 'associatedExercise',
      title: 'Associated Practical Exercise',
      type: 'reference',
      to: [{ type: 'practicalExercise' }],
      description: 'Link to a practical exercise related to this lesson (optional).',
      hidden: ({ parent }) => parent?.type !== 'exercise', // Only show if lesson type is 'exercise'
      validation: (Rule) => Rule.custom((value, context) => {
        const parent = context.parent as any;
        if (parent?.type === 'exercise' && !value) {
          return 'An associated practical exercise is required for lessons of type "Exercise"';
        }
        return true;
      }),
    }),
    defineField({
      name: 'parentModule',
      title: 'Parent Module',
      type: 'reference',
      to: [{ type: 'module' }],
      description: 'The module this lesson belongs to.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'journeyPath',
      title: 'Journey Path',
      type: 'reference',
      to: [{ type: 'journeyPath' }],
      validation: (Rule) => Rule.required(),
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type', // Show lesson type in preview
      order: 'order',
    },
    prepare({ title, subtitle, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle: `Type: ${subtitle ? subtitle.charAt(0).toUpperCase() + subtitle.slice(1) : 'N/A'}`,
      };
    },
  },
});