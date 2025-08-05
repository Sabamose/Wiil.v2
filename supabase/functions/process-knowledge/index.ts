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
    const { knowledgeSourceId, content, type, filePath } = await req.json();

    console.log(`Processing knowledge source: ${knowledgeSourceId}, type: ${type}`);

    let textContent = content;

    // If it's a file type, try to extract text based on file type
    if (type === 'file' && filePath) {
      console.log('Processing file:', filePath);
      
      // For now, we'll handle text-based content only
      // PDF processing would require additional libraries
      if (filePath.toLowerCase().endsWith('.pdf')) {
        // For PDFs, we'll use a simplified approach
        // In a production environment, you'd want to use a proper PDF parser
        console.log('PDF detected - using content as-is (may need PDF parsing library)');
        
        // If content is empty or seems like binary data, provide a fallback
        if (!textContent || textContent.length < 50) {
          textContent = "This is a PDF document that has been uploaded to the knowledge base. The content extraction may require additional processing.";
        }
      }
    }

    // Ensure we have some content to process
    if (!textContent || textContent.trim().length === 0) {
      throw new Error('No content to process');
    }

    console.log(`Content length: ${textContent.length} characters`);

    // Chunk the content into smaller pieces (smaller chunks for faster processing)
    const chunks = chunkText(textContent, 500, 50); // Smaller chunks: 500 chars with 50 char overlap
    console.log(`Created ${chunks.length} chunks`);

    // Process chunks in batches to avoid timeouts
    const batchSize = 3; // Process 3 chunks at a time
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(chunks.length/batchSize)}`);
      
      // Process batch in parallel
      const batchPromises = batch.map(async (chunk, batchIndex) => {
        const chunkIndex = i + batchIndex;
        
        try {
          // Generate embedding for the chunk
          const embedding = await generateEmbedding(chunk);
          
          // Store the chunk with embedding
          const { error: chunkError } = await supabase
            .from('knowledge_chunks')
            .insert({
              knowledge_source_id: knowledgeSourceId,
              content: chunk,
              chunk_index: chunkIndex,
              embedding: embedding,
              metadata: { chunk_size: chunk.length, overlap: 50 }
            });

          if (chunkError) {
            console.error(`Error storing chunk ${chunkIndex}:`, chunkError);
            throw chunkError;
          }
          
          console.log(`Successfully processed chunk ${chunkIndex}`);
        } catch (error) {
          console.error(`Failed to process chunk ${chunkIndex}:`, error);
          throw error;
        }
      });
      
      // Wait for batch to complete
      await Promise.all(batchPromises);
      
      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
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
        chunksProcessed: chunks.length,
        message: 'Knowledge processing completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing knowledge:', error);
    
    // Mark knowledge source as failed if we have the ID
    try {
      const body = await req.json();
      const { knowledgeSourceId } = body;
      if (knowledgeSourceId) {
        await supabase
          .from('knowledge_sources')
          .update({ status: 'failed' })
          .eq('id', knowledgeSourceId);
      }
    } catch (e) {
      console.error('Error updating status to failed:', e);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
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
      
      if (lastSentenceEnd > chunkSize * 0.5) { // More flexible boundary
        chunk = chunk.slice(0, lastSentenceEnd + 1);
      }
    }
    
    const trimmedChunk = chunk.trim();
    if (trimmedChunk.length > 0) {
      chunks.push(trimmedChunk);
    }
    
    start += chunk.length - overlap;
    if (start >= text.length) break;
  }

  return chunks;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000), // Limit input length to avoid API limits
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}