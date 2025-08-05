-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create storage bucket for knowledge files
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge-files', 'knowledge-files', false);

-- Create knowledge sources table
CREATE TABLE public.knowledge_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assistant_id UUID REFERENCES public.assistants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'text', 'url')),
  file_path TEXT, -- for file uploads
  content TEXT, -- for text input
  url TEXT, -- for web scraping
  file_size INTEGER,
  mime_type TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create knowledge chunks table with embeddings
CREATE TABLE public.knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_source_id UUID NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536), -- OpenAI ada-002 embedding size
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create assistant knowledge junction table
CREATE TABLE public.assistant_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  knowledge_source_id UUID NOT NULL REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assistant_id, knowledge_source_id)
);

-- Enable RLS
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_knowledge ENABLE ROW LEVEL SECURITY;

-- RLS policies for knowledge_sources
CREATE POLICY "Users can view their own knowledge sources" 
ON public.knowledge_sources 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge sources" 
ON public.knowledge_sources 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge sources" 
ON public.knowledge_sources 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge sources" 
ON public.knowledge_sources 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for knowledge_chunks
CREATE POLICY "Users can access chunks from their knowledge sources" 
ON public.knowledge_chunks 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.knowledge_sources 
  WHERE knowledge_sources.id = knowledge_chunks.knowledge_source_id 
  AND knowledge_sources.user_id = auth.uid()
));

-- RLS policies for assistant_knowledge
CREATE POLICY "Users can manage their assistant knowledge" 
ON public.assistant_knowledge 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.assistants 
  WHERE assistants.id = assistant_knowledge.assistant_id 
  AND assistants.user_id = auth.uid()
));

-- Storage policies for knowledge files
CREATE POLICY "Users can upload knowledge files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their knowledge files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their knowledge files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their knowledge files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'knowledge-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes for performance
CREATE INDEX idx_knowledge_sources_user_id ON public.knowledge_sources(user_id);
CREATE INDEX idx_knowledge_sources_assistant_id ON public.knowledge_sources(assistant_id);
CREATE INDEX idx_knowledge_chunks_source_id ON public.knowledge_chunks(knowledge_source_id);
CREATE INDEX idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_assistant_knowledge_assistant_id ON public.assistant_knowledge(assistant_id);

-- Create update trigger for knowledge_sources
CREATE TRIGGER update_knowledge_sources_updated_at
BEFORE UPDATE ON public.knowledge_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();