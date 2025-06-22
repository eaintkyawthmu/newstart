import { createClient } from '@sanity/client';
import type { JourneyPath } from '../types/journey';

// Debug environment variables
console.log('Sanity Project ID:', import.meta.env.VITE_SANITY_PROJECT_ID);
console.log('Sanity Dataset:', import.meta.env.VITE_SANITY_DATASET);
console.log('Sanity Token:', import.meta.env.VITE_SANITY_TOKEN ? 'Token exists' : 'Token missing');

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  throw new Error(
    'Missing VITE_SANITY_PROJECT_ID environment variable. ' +
    'Please add it to your .env file with your Sanity project ID.'
  );
}

if (!import.meta.env.VITE_SANITY_DATASET) {
  throw new Error(
    'Missing VITE_SANITY_DATASET environment variable. ' +
    'Please add it to your .env file with your Sanity dataset name (usually "production").'
  );
}

if (!import.meta.env.VITE_SANITY_TOKEN) {
  throw new Error(
    'Missing VITE_SANITY_TOKEN environment variable. ' +
    'Please add it to your .env file with your Sanity API token.'
  );
}

export const sanityClient = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2023-05-28',
  token: import.meta.env.VITE_SANITY_TOKEN,
  useCdn: false,
  perspective: 'published'
});

export const fetchJourneyPath = async (slug: string): Promise<JourneyPath | null> => {
  try {
    const data = await sanityClient.fetch(`
      *[_type == "journeyPath" && slug.current == $slug][0] {
        _id,
        title,
        description,
        whoIsItFor,
        howItHelps,
        "slug": slug.current,
        duration,
        level,
        rating,
        enrolled,
        isPremium,
        objectives,
        completionCriteria,
        practicalApplications,
        "coverImage": {
          "url": coverImage.asset->url,
          "alt": coverImage.alt
        },
        "modules": *[_type == "module" && references(^._id)] | order(order asc) {
          _id,
          title,
          description,
          duration,
          order,
          "lessons": *[_type == "lesson" && references(^._id)] | order(order asc) {
            _id,
            title,
            "slug": slug.current,
            description,
            duration,
            type,
            order
          }
        }
      }
    `, { slug });

    if (!data) {
      console.warn(`No journey path found for slug: ${slug}`);
      return null;
    }

    console.log('Fetched journey path data:', data); // Debug log
    return data;
  } catch (error: any) {
    console.error(`Error fetching journey path ${slug}:`, error);
    
    // Provide more specific error messages for common authentication issues
    if (error.message?.includes('Unauthorized') || error.message?.includes('Session not found')) {
      throw new Error(
        `Sanity authentication failed. Please check that:\n` +
        `1. Your VITE_SANITY_TOKEN is correctly set in your .env file\n` +
        `2. The token is valid and not expired\n` +
        `3. The token has read permissions for your Sanity dataset\n` +
        `4. Your Sanity project ID and dataset name are correct\n\n` +
        `Original error: ${error.message}`
      );
    }
    
    if (error.message?.includes('Project not found')) {
      throw new Error(
        `Sanity project not found. Please verify that:\n` +
        `1. Your VITE_SANITY_PROJECT_ID is correct\n` +
        `2. The project exists in your Sanity account\n\n` +
        `Original error: ${error.message}`
      );
    }
    
    throw error;
  }
};