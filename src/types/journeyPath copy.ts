import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'journeyPath',
  title: 'Journey Path',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'whoIsItFor',
      title: 'Who Is This Program For?',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
          }
        }
      ],
      description: 'Clearly define the target audience for this journey path.',
    }),
    defineField({
      name: 'howItHelps',
      title: 'How This Journey Path Will Help You',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }],
          }
        }
      ],
      description: 'Explain the core benefits and approach of this journey path.',
    }),
    defineField({
      name: 'description',
      title: 'Course Description',
      type: 'array', 
      // of: [{ type: 'block' }], 
      of: [
        {
          type: 'block', // Allows for rich text objectives (e.g., bullet points, bolding)
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Number', value: 'number'}],
          marks: {
            decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}],
            annotations: []
          }
        }
      ],
    }),
    // defineField({
    //   name: 'objectives', // Added new field for "What You'll Learn"
    //   title: 'Learning Objectives',
    //   type: 'array',
    //   of: [
    //     {
    //       type: 'block', // Allows for rich text objectives (e.g., bullet points, bolding)
    //       styles: [{title: 'Normal', value: 'normal'}],
    //       lists: [{title: 'Bullet', value: 'bullet'}, {title: 'Number', value: 'number'}],
    //       marks: {
    //         decorators: [{title: 'Strong', value: 'strong'}, {title: 'Emphasis', value: 'em'}],
    //         annotations: []
    //       }
    //     }
    //   ],
    //   description: 'What students will learn in this course. Each objective can be a separate paragraph or bullet point.',
    // }),
    defineField({ name: 'duration', title: 'Duration', type: 'string' }),
    defineField({
      name: 'level', // Added new field for 'Level'
      title: 'Level',
      type: 'string',
      options: {
        list: [ // Optional: provide a predefined list of levels
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'All Levels', value: 'all-levels' },
        ],
        layout: 'radio' // Optional: display as radio buttons or a dropdown
      }
    }),
    defineField({ name: 'rating', title: 'Rating', type: 'number' }),
    defineField({ name: 'enrolled', title: 'Enrolled', type: 'number' }),
    defineField({ name: 'isPremium', title: 'Premium Content?', type: 'boolean' }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }]
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for screen readers and SEO.',
        }),
      ],
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'module' }] }]
    }),
    // Update objectives to be more action-oriented
    defineField({
      name: 'objectives',
      title: 'Path Outcomes',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Specific, measurable outcomes learners will achieve by completing this path'
    }),
    
    // Add completion criteria
    defineField({
      name: 'completionCriteria',
      title: 'Completion Criteria',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List the specific criteria that determine when this path is considered complete'
    }),
    
    // Add practical application field
    defineField({
      name: 'practicalApplications',
      title: 'Practical Applications',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Real-world applications and scenarios where these skills are used'
    })
  ]
})