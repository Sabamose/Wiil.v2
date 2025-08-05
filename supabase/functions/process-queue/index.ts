import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessingJob {
  id: string;
  knowledge_source_id: string;
  user_id: string;
  status: string;
  current_chunk: number;
  total_chunks: number;
}

interface KnowledgeSource {
  id: string;
  file_path: string | null;
  content: string | null;
  type: string;
  name: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (jobsError || !jobs) {
      console.log('No pending jobs found');
      return new Response(JSON.stringify({ message: 'No pending jobs' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing job ${jobs.id} for knowledge source ${jobs.knowledge_source_id}`);

    // Get knowledge source
    const { data: knowledgeSource, error: sourceError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('id', jobs.knowledge_source_id)
      .single();

    if (sourceError || !knowledgeSource) {
      throw new Error('Knowledge source not found');
    }

    // Mark job as processing
    await supabase
      .from('processing_jobs')
      .update({ status: 'processing' })
      .eq('id', jobs.id);

    // Process content
    let textContent = '';
    
    if (knowledgeSource.type === 'text') {
      textContent = knowledgeSource.content || '';
    } else if (knowledgeSource.type === 'file' && knowledgeSource.file_path) {
      // Download and extract text from file
      const { data: fileData } = await supabase.storage
        .from('knowledge-files')
        .download(knowledgeSource.file_path);

      if (fileData) {
        if (knowledgeSource.file_path.endsWith('.txt') || knowledgeSource.file_path.endsWith('.md')) {
          textContent = await fileData.text();
        } else if (knowledgeSource.file_path.endsWith('.pdf')) {
          // For PDFs, we'll extract a simple text representation
          // This is a simplified approach - in production you'd use a proper PDF parser
          textContent = await fileData.text();
        }
      }
    }

    if (!textContent.trim()) {
      throw new Error('No content to process');
    }

    // Create chunks
    const chunks = chunkText(textContent, 300, 30);
    console.log(`Created ${chunks.length} chunks`);

    // Update job with total chunks
    await supabase
      .from('processing_jobs')
      .update({ total_chunks: chunks.length })
      .eq('id', jobs.id);

    // Process chunks in small batches (max 3 chunks per function call)
    const maxChunksPerCall = 3;
    const startChunk = jobs.current_chunk;
    const endChunk = Math.min(startChunk + maxChunksPerCall, chunks.length);

    console.log(`Processing chunks ${startChunk} to ${endChunk - 1}`);

    // Process the chunk batch
    for (let i = startChunk; i < endChunk; i++) {
      const chunk = chunks[i];
      
      try {
        // Generate embedding
        const embedding = await generateEmbedding(chunk);
        
        // Store chunk
        const { error: chunkError } = await supabase
          .from('knowledge_chunks')
          .insert({
            knowledge_source_id: jobs.knowledge_source_id,
            content: chunk,
            chunk_index: i,
            embedding: embedding,
            metadata: { chunk_size: chunk.length, overlap: 30 }
          });

        if (chunkError) {
          console.error(`Error storing chunk ${i}:`, chunkError);
          throw chunkError;
        }

        console.log(`Successfully processed chunk ${i}`);
        
        // Update job progress
        await supabase
          .from('processing_jobs')
          .update({ current_chunk: i + 1 })
          .eq('id', jobs.id);
        
      } catch (error) {
        console.error(`Failed to process chunk ${i}:`, error);
        // Mark job as failed
        await supabase
          .from('processing_jobs')
          .update({ 
            status: 'failed',
            error_message: `Failed at chunk ${i}: ${error.message}`
          })
          .eq('id', jobs.id);
        throw error;
      }
    }

    // Check if job is complete
    if (endChunk >= chunks.length) {
      // Job completed
      await supabase
        .from('processing_jobs')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', jobs.id);

      // Update knowledge source status
      await supabase
        .from('knowledge_sources')
        .update({ status: 'completed' })
        .eq('id', jobs.knowledge_source_id);

      console.log(`Job ${jobs.id} completed successfully`);
    } else {
      // More chunks to process, mark as pending for next run
      await supabase
        .from('processing_jobs')
        .update({ status: 'pending' })
        .eq('id', jobs.id);

      console.log(`Job ${jobs.id} partially completed, ${chunks.length - endChunk} chunks remaining`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      job_id: jobs.id,
      processed_chunks: endChunk,
      total_chunks: chunks.length,
      completed: endChunk >= chunks.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in process-queue function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper functions
function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;
    
    if (end < text.length) {
      // Try to break at a sentence boundary
      const sentenceEnd = text.lastIndexOf('.', end);
      const questionEnd = text.lastIndexOf('?', end);
      const exclamationEnd = text.lastIndexOf('!', end);
      
      const bestEnd = Math.max(sentenceEnd, questionEnd, exclamationEnd);
      if (bestEnd > start + chunkSize * 0.5) {
        end = bestEnd + 1;
      }
    }
    
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter(chunk => chunk.length > 0);
}

async function generateEmbedding(text: string): Promise<number[]> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  if (text.length > 8000) {
    text = text.substring(0, 8000);
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small'
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}