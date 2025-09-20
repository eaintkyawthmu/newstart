import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Initialize Sanity client
export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn: true,
  apiVersion: '2023-05-03',
});

// Initialize image URL builder
const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => builder.image(source);

// Fetch journey paths function
export const fetchJourneyPaths = async (targetAudience?: string, pathSlugs?: string[]) => {
  let query = `*[_type == "journeyPath"`;
  
  if (targetAudience) {
    query += ` && targetAudience == "${targetAudience}"`;
  }
  
  if (pathSlugs && pathSlugs.length > 0) {
    const slugsFilter = pathSlugs.map(slug => `slug.current == "${slug}"`).join(' || ');
    query += ` && (${slugsFilter})`;
  }
  
  query += `] {
    _id,
    title,
    description,
    slug,
    targetAudience,
    estimatedDuration,
    difficulty,
    modules[]-> {
      _id,
      title,
      description,
      slug,
      order,
      lessons[]-> {
        _id,
        title,
        description,
        slug,
        order,
        content,
        estimatedDuration,
        difficulty
      }
    }
  }`;
  
  try {
    const journeyPaths = await client.fetch(query);
    return journeyPaths;
  } catch (error) {
    console.error('Error fetching journey paths:', error);
    return [];
  }
};