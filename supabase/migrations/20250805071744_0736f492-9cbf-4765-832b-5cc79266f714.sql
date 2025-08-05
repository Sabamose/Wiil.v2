-- Create assistants table
CREATE TABLE public.assistants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Voice', 'Chat', 'Unified')),
  industry TEXT NOT NULL,
  use_case TEXT NOT NULL,
  assistant_type TEXT CHECK (assistant_type IN ('inbound', 'outbound')),
  phone_number TEXT,
  
  -- ElevenLabs voice settings
  voice_id TEXT NOT NULL DEFAULT 'aria',
  voice_name TEXT NOT NULL DEFAULT 'Aria (Female)',
  language TEXT NOT NULL DEFAULT 'en',
  language_name TEXT NOT NULL DEFAULT 'English',
  
  -- AI settings
  system_prompt TEXT DEFAULT 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
  initial_message TEXT DEFAULT 'Hello! How can I help you today?',
  temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 1),
  max_tokens INTEGER DEFAULT 300 CHECK (max_tokens > 0),
  
  -- Status and metadata
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'testing', 'live', 'error')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assistants ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assistants" 
ON public.assistants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assistants" 
ON public.assistants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assistants" 
ON public.assistants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assistants" 
ON public.assistants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_assistants_updated_at
BEFORE UPDATE ON public.assistants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create conversations table for storing chat history
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES public.assistants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own conversations" 
ON public.conversations 
FOR ALL 
USING (auth.uid() = user_id);

-- Create messages table for storing individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  audio_url TEXT, -- For storing voice message URLs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages (inherit from conversation)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access messages from their conversations" 
ON public.messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Create triggers for timestamp updates
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();