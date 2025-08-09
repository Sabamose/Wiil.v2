import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('Received Cal.com webhook:', JSON.stringify(payload, null, 2))

    const { triggerEvent, payload: eventData } = payload

    // Extract booking information from Cal.com webhook
    const {
      uid: calEventId,
      title,
      startTime,
      endTime,
      attendees,
      organizer,
      metadata,
      responses,
    } = eventData

    // Get customer information from attendees
    const customer = attendees?.[0]
    const customerName = customer?.name || responses?.name
    const customerEmail = customer?.email || responses?.email
    const customerPhone = responses?.phone || customer?.phone

    // Extract assistant info from metadata or organizer
    const assistantId = metadata?.assistantId || organizer?.username
    
    if (!assistantId) {
      console.error('No assistant ID found in webhook payload')
      return new Response(
        JSON.stringify({ error: 'Assistant ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Map trigger event to our status
    let status = 'confirmed'
    if (triggerEvent === 'BOOKING_CANCELLED') {
      status = 'cancelled'
    } else if (triggerEvent === 'BOOKING_RESCHEDULED') {
      status = 'confirmed'
    }

    const bookingData = {
      cal_event_id: calEventId,
      assistant_id: assistantId,
      title: title || 'Cal.com Booking',
      start_time: startTime,
      end_time: endTime,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      status,
      source: 'cal.com',
      timezone: eventData.timeZone || 'UTC',
      notes: responses?.additionalNotes || eventData.description,
      user_id: organizer?.id, // This should be mapped from assistant to user
    }

    // First, get the user_id from the assistant
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .select('user_id')
      .eq('id', assistantId)
      .single()

    if (assistantError) {
      console.error('Error finding assistant:', assistantError)
      return new Response(
        JSON.stringify({ error: 'Assistant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    bookingData.user_id = assistant.user_id

    // Check if booking already exists (for updates/cancellations)
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('cal_event_id', calEventId)
      .single()

    let result
    if (existingBooking) {
      // Update existing booking
      const { data, error } = await supabase
        .from('bookings')
        .update(bookingData)
        .eq('cal_event_id', calEventId)
        .select()

      result = { data, error }
      console.log('Updated booking:', result)
    } else {
      // Create new booking
      const { data, error } = await supabase
        .from('bookings')
        .insert([bookingData])
        .select()

      result = { data, error }
      console.log('Created booking:', result)
    }

    if (result.error) {
      console.error('Database error:', result.error)
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, booking: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})