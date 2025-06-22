import { createClient } from 'https://esm.sh/@sanity/client@6.12.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { slug } = await req.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanityClient = createClient({
      projectId: Deno.env.get('VITE_SANITY_PROJECT_ID'),
      dataset: Deno.env.get('VITE_SANITY_DATASET'),
      apiVersion: '2023-05-28',
      token: Deno.env.get('VITE_SANITY_TOKEN'), // Use token for server-side access
      useCdn: false,
      perspective: 'published'
    });

    const query = `
      *[_type == "journeyPath" && slug.current == $slug][0] {
        title,
        description,
        duration,
        level,
        isPremium,
        "modules": modules[]->{
          title,
          order,
          "lessons": lessons[]->{
            title,
            slug,
            order
          }
        }
      }
    `;
    const pathDetails = await sanityClient.fetch(query, { slug });

    if (!pathDetails) {
      return new Response(JSON.stringify({ message: 'Journey path not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(pathDetails), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error in get_journey_path_details:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});