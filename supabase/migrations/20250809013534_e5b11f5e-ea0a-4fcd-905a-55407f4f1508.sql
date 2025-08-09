-- Add conversation and campaign context to bookings
ALTER TABLE public.bookings 
ADD COLUMN conversation_id UUID,
ADD COLUMN campaign_id UUID,
ADD COLUMN booking_context JSONB DEFAULT '{}';

-- Add index for better performance on conversation lookups
CREATE INDEX idx_bookings_conversation_id ON public.bookings(conversation_id);
CREATE INDEX idx_bookings_campaign_id ON public.bookings(campaign_id);