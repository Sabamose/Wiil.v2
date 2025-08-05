-- Create processing jobs queue table
CREATE TABLE public.processing_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_source_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  current_chunk INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.processing_jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own processing jobs"
ON public.processing_jobs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own processing jobs"
ON public.processing_jobs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update processing jobs"
ON public.processing_jobs
FOR UPDATE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_processing_jobs_updated_at
BEFORE UPDATE ON public.processing_jobs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for efficient querying
CREATE INDEX idx_processing_jobs_status ON public.processing_jobs(status);
CREATE INDEX idx_processing_jobs_knowledge_source ON public.processing_jobs(knowledge_source_id);