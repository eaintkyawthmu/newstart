// schemas/user.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'user', // This 'name' must be consistent with what you reference (e.g., in taskProgress)
  title: 'User Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'supabaseUserId',
      title: 'Supabase User ID',
      type: 'string',
      description: 'The unique ID assigned to this user by Supabase Authentication. This should match the "id" in your Supabase auth.users table.',
      validation: Rule => Rule.required(), // Crucial for linking to Supabase and ensuring uniqueness
      readOnly: true, // Typically, this field is set once and not manually edited in Sanity Studio
    }),
    defineField({
      name: 'name',
      title: 'Display Name',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'The name of the user as it should appear in the application (e.g., "Jane Doe").',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: Rule => Rule.email().required(),
      description: 'The user\'s email address. Used for identification and potentially mirroring from Supabase.',
      readOnly: true, // Often read-only if directly mirrored from Supabase
    }),
    defineField({
      name: 'profilePicture',
      title: 'Profile Picture',
      type: 'image',
      options: {
        hotspot: true // Allows for image cropping
      },
      description: 'An optional profile picture for the user.',
    }),
    defineField({
      name: 'learningPreferences',
      title: 'Learning Preferences',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags' // Or 'checkboxes', 'dropdown' if you have predefined options
      },
      description: 'Tags or categories indicating the user\'s preferred learning styles or interests.',
    }),
    defineField({
      name: 'lastActivity',
      title: 'Last Activity',
      type: 'datetime',
      description: 'Timestamp of the user\'s last significant activity within the platform (e.g., lesson completed, quiz taken).',
      readOnly: true, // This would typically be updated programmatically
    }),
    // You can add more fields here relevant to your application, such as:
    // defineField({
    //   name: 'userRole',
    //   title: 'User Role',
    //   type: 'string',
    //   options: {
    //     list: [
    //       { title: 'Learner', value: 'learner' },
    //       { title: 'Instructor', value: 'instructor' },
    //       { title: 'Admin', value: 'admin' },
    //     ],
    //   },
    //   initialValue: 'learner',
    // }),
    // defineField({
    //   name: 'enrolledCourses',
    //   title: 'Enrolled Courses',
    //   type: 'array',
    //   of: [{ type: 'reference', to: [{ type: 'course' }] }], // Assuming you have a 'course' schema
    // }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      media: 'profilePicture',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Unnamed User',
        subtitle: subtitle || 'No email provided',
        media: media,
      };
    },
  },
});