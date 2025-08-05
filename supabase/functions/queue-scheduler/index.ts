import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check for pending jobs
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('processing_jobs')
      .select('id')
      .eq('status', 'pending')
      .limit(5);

    if (jobsError) {
      throw jobsError;
    }

    const jobCount = pendingJobs?.length || 0;
    console.log(`Found ${jobCount} pending jobs`);

    // Process up to 3 jobs concurrently
    const maxConcurrentJobs = Math.min(jobCount, 3);
    const promises = [];

    for (let i = 0; i < maxConcurrentJobs; i++) {
      const promise = supabase.functions.invoke('process-queue');
      promises.push(promise);
    }

    // Wait for all jobs to complete
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Processed ${successful} jobs successfully, ${failed} failed`);

    return new Response(JSON.stringify({ 
      message: 'Queue processing completed',
      pending_jobs: jobCount,
      processed: successful,
      failed: failed
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in queue-scheduler:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});