import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, context = [], assistantId } = await req.json();
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log('Processing message with OpenAI GPT-4.1:', message, 'assistantId:', assistantId);

    let enhancedContext = [...context];

    // If assistantId is provided, search for relevant knowledge
    if (assistantId) {
      console.log('Searching knowledge for assistant:', assistantId);
      
      try {
        const { data: knowledgeResponse, error: knowledgeError } = await supabase.functions.invoke('knowledge-search', {
          body: {
            query: message,
            assistantId: assistantId,
            limit: 3
          }
        });

        if (!knowledgeError && knowledgeResponse?.relevantChunks?.length > 0) {
          console.log(`Found ${knowledgeResponse.relevantChunks.length} relevant knowledge chunks`);
          
          const knowledgeContext = knowledgeResponse.relevantChunks
            .map((chunk: any) => `Knowledge: ${chunk.content}`)
            .join('\n\n');
          
          enhancedContext.unshift({
            role: 'system',
            content: `Relevant knowledge for this conversation:\n\n${knowledgeContext}\n\nUse this knowledge to provide accurate and helpful responses.`
          });
        }
      } catch (knowledgeError) {
        console.error('Error searching knowledge:', knowledgeError);
        // Continue without knowledge if search fails
      }
    }

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant with a natural, conversational speaking style. Keep responses concise and engaging for voice interaction. If you have relevant knowledge provided, use it to enhance your responses.'
      },
      ...enhancedContext,
      {
        role: 'user',
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('OpenAI response:', aiResponse);

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        usage: data.usage 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});