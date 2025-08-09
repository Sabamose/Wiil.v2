-- Create assistant_calendars table for Cal.com integration
CREATE TABLE public.assistant_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  cal_username TEXT,
  default_event_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assistant_id)
);

-- Create bookings table for calendar events
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assistant_id UUID NOT NULL REFERENCES assistants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed',
  cal_event_id TEXT,
  source TEXT DEFAULT 'cal.com',
  timezone TEXT DEFAULT 'UTC',
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on assistant_calendars
ALTER TABLE public.assistant_calendars ENABLE ROW LEVEL SECURITY;

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS policies for assistant_calendars
CREATE POLICY "Users can manage their assistant calendars" 
ON public.assistant_calendars 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM assistants 
    WHERE assistants.id = assistant_calendars.assistant_id 
    AND assistants.user_id = auth.uid()
  )
);

-- RLS policies for bookings
CREATE POLICY "Users can view their bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their bookings" 
ON public.bookings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_assistant_calendars_updated_at
BEFORE UPDATE ON public.assistant_calendars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_bookings_assistant_id ON public.bookings(assistant_id);
CREATE INDEX idx_bookings_start_time ON public.bookings(start_time);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- Enable realtime for bookings
ALTER publication supabase_realtime ADD TABLE public.bookings;