import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';

interface SimulationBooking extends Omit<Booking, 'id' | 'created_at' | 'updated_at'> {
  booking_context: {
    interaction_type: string;
    call_duration?: number;
    follow_up_reason?: string;
    customer_satisfaction?: number;
    appointment_type: string;
  };
}

const appointmentTypes = [
  'Initial Consultation',
  'Follow-up Call',
  'Product Demo',
  'Support Session',
  'Sales Call',
  'Onboarding',
];

const interactionTypes = [
  'Inbound Call',
  'Outbound Call', 
  'Chat Conversation',
  'Email Request',
  'Website Form',
];

const customerNames = [
  'Sarah Johnson', 'Michael Chen', 'Emma Rodriguez', 'David Kim',
  'Jessica Williams', 'Alex Thompson', 'Maria Garcia', 'James Wilson',
  'Lisa Anderson', 'Robert Martinez', 'Anna Davis', 'Chris Taylor'
];

const sampleNotes = [
  'Customer interested in premium features',
  'Needs technical support for integration',
  'Pricing discussion for enterprise plan',
  'Follow-up on trial experience',
  'Demo of advanced analytics features',
  'Onboarding session for new team',
  'Quarterly business review',
  'Support for implementation issues'
];

export const generateSimulationBookings = async (assistants: any[], userId: string) => {
  if (!assistants.length) return;

  const simulationBookings: SimulationBooking[] = [];
  const now = new Date();

  // Generate bookings for the next 30 days
  for (let i = 0; i < 25; i++) {
    const randomAssistant = assistants[Math.floor(Math.random() * assistants.length)];
    const startDate = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + (30 + Math.random() * 60) * 60 * 1000); // 30-90 min meetings
    
    const appointmentType = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)];
    const interactionType = interactionTypes[Math.floor(Math.random() * interactionTypes.length)];
    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    
    // Generate realistic phone numbers
    const phoneNumber = `+1${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 900 + 100)}${Math.floor(Math.random() * 9000 + 1000)}`;
    
    // Generate realistic email
    const emailDomain = ['gmail.com', 'outlook.com', 'company.com', 'business.org'][Math.floor(Math.random() * 4)];
    const email = `${customerName.toLowerCase().replace(' ', '.')}@${emailDomain}`;

    const statuses = ['confirmed', 'pending', 'completed', 'cancelled'] as const;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const booking: SimulationBooking = {
      assistant_id: randomAssistant.id,
      title: appointmentType,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      customer_name: customerName,
      customer_phone: phoneNumber,
      customer_email: email,
      status,
      source: 'AI Assistant',
      timezone: 'UTC',
      notes: sampleNotes[Math.floor(Math.random() * sampleNotes.length)],
      user_id: userId,
      booking_context: {
        interaction_type: interactionType,
        call_duration: interactionType.includes('Call') ? Math.floor(Math.random() * 20 + 5) : undefined,
        follow_up_reason: appointmentType.includes('Follow-up') ? 'Previous conversation outcome' : undefined,
        customer_satisfaction: Math.floor(Math.random() * 3 + 3), // 3-5 rating
        appointment_type: appointmentType,
      },
    };

    simulationBookings.push(booking);
  }

  // Insert simulation bookings
  const { error } = await supabase
    .from('bookings')
    .insert(simulationBookings);

  if (error) {
    console.error('Error creating simulation bookings:', error);
    throw error;
  }

  return simulationBookings;
};

export const clearSimulationBookings = async (userId: string) => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('user_id', userId)
    .eq('source', 'AI Assistant');

  if (error) {
    console.error('Error clearing simulation bookings:', error);
    throw error;
  }
};