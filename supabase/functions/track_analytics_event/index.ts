import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, event_name, properties } = await req.json();

    if (!user_id || !event_name) {
      return new Response(JSON.stringify({ error: 'user_id and event_name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role key for direct DB access
      {
        auth: {
          persistSession: false,
        },
      },
    );

    // Insert the analytics event
    const { error } = await supabaseClient
      .from('analytics_events')
      .insert({
        user_id,
        event_name,
        properties: properties || {},
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error tracking analytics event:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update user's last active timestamp
    await supabaseClient
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user_id);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unhandled error in track_analytics_event:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});