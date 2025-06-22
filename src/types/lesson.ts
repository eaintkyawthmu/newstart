import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
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
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video', value: 'video' },
          { title: 'Reading', value: 'reading' },
          { title: 'Quiz', value: 'quiz' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string',
    }),
    defineField({
      name: 'introduction',
      title: 'Introduction',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Brief introduction to the lesson content',
    }),
    defineField({
      name: 'learningObjective',
      title: 'Learning Objectives',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'What students will learn in this lesson',
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
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Main lesson content (text, explanations, etc.)',
    }),
    defineField({
      name: 'keyTakeaways',
      title: 'Key Takeaways',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Important points students should remember',
    }),
    defineField({
      name: 'actionItem',
      title: 'Action Items',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Tasks or actions for students to complete',
    }),
    defineField({
      name: 'lessonResources',
      title: 'Lesson Resources',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'resource',
          title: 'Resource',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'type',
              title: 'Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Download', value: 'download' },
                  { title: 'External Link', value: 'external' },
                ],
              },
              initialValue: 'external',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'type',
            },
          },
        },
      ],
      description: 'Additional resources for this lesson',
    }),
    defineField({
      name: 'reflectionPrompts',
      title: 'Reflection Questions',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Questions to help students reflect on the lesson',
    }),
    defineField({
      name: 'parentModule',
      title: 'Parent Module',
      type: 'reference',
      to: [{ type: 'module' }],
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
      subtitle: 'type',
      order: 'order',
    },
    prepare({ title, subtitle, order }) {
      return {
        title: `${order}. ${title}`,
        subtitle: subtitle,
      };
    },
  },
});