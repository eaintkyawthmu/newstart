import OpenAI from 'npm:openai@^4.28.0';
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
    const { message, language, threadId: clientThreadId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({
          error: 'Missing required field',
          details: 'Message is required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const assistantId = Deno.env.get('OPENAI_ASSISTANT_ID'); // Get your Assistant ID from environment variables

    if (!apiKey || !assistantId) {
      return new Response(
        JSON.stringify({
          error: 'Configuration error',
          details: 'OpenAI API key or Assistant ID is not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Get user ID from Supabase auth context
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
        auth: {
          persistSession: false,
        },
      },
    );
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user?.id;

    let threadId = clientThreadId;
    if (!threadId) {
      // Create a new thread if one doesn't exist
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    let run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Poll the run status
    while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'cancelling') {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
      run = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    // Handle tool calls
    if (run.status === 'requires_action') {
      const toolOutputs = [];
      for (const toolCall of run.required_action?.submit_tool_outputs.tool_calls || []) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);
        let output = null;

        console.log(`Assistant requested tool: ${functionName} with args:`, functionArgs);

        // Dynamically call the appropriate tool function
        try {
          let toolResponse;
          const toolUrl = Deno.env.get('SUPABASE_URL') + `/functions/v1/${functionName}`;
          
          // Pass user_id if the tool requires it
          if (functionName === 'get_user_profile' && userId) {
            functionArgs.user_id = userId;
          }

          toolResponse = await fetch(toolUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`, // Use anon key for calling other edge functions
            },
            body: JSON.stringify(functionArgs),
          });

          if (!toolResponse.ok) {
            const errorText = await toolResponse.text();
            throw new Error(`Tool function ${functionName} failed: ${toolResponse.status} - ${errorText}`);
          }
          output = await toolResponse.json();
          console.log(`Tool ${functionName} output:`, output);
        } catch (toolError) {
          console.error(`Error executing tool ${functionName}:`, toolError);
          output = { error: `Failed to execute tool ${functionName}: ${toolError.message}` };
        }

        toolOutputs.push({
          tool_call_id: toolCall.id,
          output: JSON.stringify(output),
        });
      }

      // Submit tool outputs and continue the run
      run = await openai.beta.threads.runs.submitToolOutputs(threadId, run.id, {
        tool_outputs: toolOutputs,
      });

      // Poll again until the run is completed
      while (run.status === 'queued' || run.status === 'in_progress' || run.status === 'cancelling') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        run = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }
    }

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId, { order: 'desc', limit: 1 });
      const lastMessage = messages.data[0];
      const assistantResponse = lastMessage.content[0].type === 'text' ? lastMessage.content[0].text.value : '';

      return new Response(
        JSON.stringify({ message: assistantResponse, threadId: threadId }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } else {
      console.error(`Run finished with status: ${run.status}`);
      return new Response(
        JSON.stringify({
          error: 'Assistant run failed or did not complete.',
          details: `Status: ${run.status}`,
          threadId: threadId,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  } catch (error) {
    console.error('Unhandled Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});