import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Sanity client configuration
export const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

// Image URL builder
const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => builder.image(source);

// Types for Sanity data
export interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt?: string;
}

export interface JourneyPath {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: any[]; // Portable Text array
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  category: string;
  image?: SanityImage;
  modules: Module[];
  prerequisites?: string[];
  learningObjectives?: string[];
  isPublished: boolean;
}

export interface Module {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description: any[]; // Portable Text array
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  content: any[]; // Portable Text array
  type: 'video' | 'article' | 'interactive' | 'quiz';
  duration?: number;
  order: number;
  isPublished: boolean;
}

// Fetch all journey paths
export const fetchJourneyPaths = async (): Promise<JourneyPath[]> => {
  const query = `
    *[_type == "journeyPath" && isPublished == true] | order(order asc) {
      _id,
      title,
      slug,
      description,
      difficulty,
      estimatedTime,
      category,
      image,
      prerequisites,
      learningObjectives,
      isPublished,
      "modules": modules[]-> {
        _id,
        title,
        slug,
        description,
        order,
        "lessons": lessons[]-> {
          _id,
          title,
          slug,
          type,
          duration,
          order,
          isPublished
        } | order(order asc)
      } | order(order asc)
    }
  `;
  
  return await client.fetch(query);
};

// Fetch a single journey path by slug
export const fetchJourneyPath = async (slug: string): Promise<JourneyPath | null> => {
  const query = `
    *[_type == "journeyPath" && slug.current == $slug && isPublished == true][0] {
      _id,
      title,
      slug,
      description,
      difficulty,
      estimatedTime,
      category,
      image,
      prerequisites,
      learningObjectives,
      isPublished,
      "modules": modules[]-> {
        _id,
        title,
        slug,
        description,
        order,
        "lessons": lessons[]-> {
          _id,
          title,
          slug,
          content,
          type,
          duration,
          order,
          isPublished
        } | order(order asc)
      } | order(order asc)
    }
  `;
  
  return await client.fetch(query, { slug });
};

// Fetch a single lesson by journey path slug and lesson slug
export const fetchLesson = async (journeySlug: string, lessonSlug: string): Promise<Lesson | null> => {
  const query = `
    *[_type == "journeyPath" && slug.current == $journeySlug && isPublished == true][0] {
      "lesson": modules[]->lessons[slug.current == $lessonSlug && isPublished == true][0] {
        _id,
        title,
        slug,
        content,
        type,
        duration,
        order,
        isPublished
      }
    }.lesson
  `;
  
  return await client.fetch(query, { journeySlug, lessonSlug });
};

// Search functionality
export const searchContent = async (searchTerm: string): Promise<any[]> => {
  const query = `
    *[_type in ["journeyPath", "lesson"] && (
      title match $searchTerm + "*" ||
      pt::text(description) match $searchTerm + "*" ||
      pt::text(content) match $searchTerm + "*"
    ) && isPublished == true] {
      _id,
      _type,
      title,
      slug,
      "excerpt": pt::text(coalesce(description, content))[0...200] + "..."
    }
  `;
  
  return await client.fetch(query, { searchTerm });
};

export default client;