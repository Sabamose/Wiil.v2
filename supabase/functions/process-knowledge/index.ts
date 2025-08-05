import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { knowledgeSourceId, content, type } = await req.json();

    console.log(`Processing knowledge source: ${knowledgeSourceId}, type: ${type}`);

    // Chunk the content into smaller pieces
    const chunks = chunkText(content, 800, 100); // 800 chars with 100 char overlap
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      // Generate embedding for the chunk
      const embedding = await generateEmbedding(chunk);
      
      // Store the chunk with embedding
      const { error: chunkError } = await supabase
        .from('knowledge_chunks')
        .insert({
          knowledge_source_id: knowledgeSourceId,
          content: chunk,
          chunk_index: i,
          embedding: embedding,
          metadata: { chunk_size: chunk.length, overlap: 100 }
        });

      if (chunkError) {
        console.error('Error storing chunk:', chunkError);
        throw chunkError;
      }
    }

    // Update knowledge source status to completed
    const { error: updateError } = await supabase
      .from('knowledge_sources')
      .update({ status: 'completed' })
      .eq('id', knowledgeSourceId);

    if (updateError) {
      console.error('Error updating knowledge source status:', updateError);
      throw updateError;
    }

    console.log(`Successfully processed ${chunks.length} chunks for knowledge source ${knowledgeSourceId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunksProcessed: chunks.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing knowledge:', error);
    
    // Mark knowledge source as failed if we have the ID
    try {
      const { knowledgeSourceId } = await req.json();
      await supabase
        .from('knowledge_sources')
        .update({ status: 'failed' })
        .eq('id', knowledgeSourceId);
    } catch (e) {
      console.error('Error updating status to failed:', e);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    let chunk = text.slice(start, end);
    
    // Try to break at sentence boundaries
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf('.');
      const lastQuestion = chunk.lastIndexOf('?');
      const lastExclamation = chunk.lastIndexOf('!');
      const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
      
      if (lastSentenceEnd > chunkSize * 0.7) {
        chunk = chunk.slice(0, lastSentenceEnd + 1);
      }
    }
    
    chunks.push(chunk.trim());
    start += chunk.length - overlap;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}