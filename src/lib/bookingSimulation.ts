import { supabase } from '@/integrations/supabase/client';
import { Booking } from '@/types/booking';

interface SimulationBooking {
  assistant_id: string;
  title: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  source: string;
  timezone: string;
  notes?: string;
}

// Realistic customer data
const customerData = [
  { name: "Sarah Johnson", phone: "+1 (555) 123-4567", email: "sarah.j@email.com" },
  { name: "Michael Chen", phone: "+1 (555) 234-5678", email: "m.chen@business.com" },
  { name: "Emily Rodriguez", phone: "+1 (555) 345-6789", email: "emily.r@company.co" },
  { name: "David Thompson", phone: "+1 (555) 456-7890", email: "d.thompson@corp.net" },
  { name: "Jessica Williams", phone: "+1 (555) 567-8901", email: "jessica.w@startup.io" },
  { name: "Robert Davis", phone: "+1 (555) 678-9012", email: "robert.d@firm.com" },
  { name: "Amanda Martinez", phone: "+1 (555) 789-0123", email: "a.martinez@tech.org" },
  { name: "Christopher Lee", phone: "+1 (555) 890-1234", email: "chris.lee@agency.net" },
  { name: "Lisa Anderson", phone: "+1 (555) 901-2345", email: "lisa.a@solutions.co" },
  { name: "Kevin Brown", phone: "+1 (555) 012-3456", email: "k.brown@consulting.biz" }
];

// Booking scenarios by assistant type/industry
const bookingScenarios = {
  healthcare: [
    { title: "Initial Consultation", duration: 30, notes: "New patient consultation for health assessment" },
    { title: "Follow-up Appointment", duration: 15, notes: "Follow-up on previous treatment plan" },
    { title: "Health Screening", duration: 45, notes: "Annual health screening and wellness check" },
    { title: "Prescription Review", duration: 20, notes: "Review current medications and adjustments" },
    { title: "Wellness Coaching", duration: 60, notes: "Lifestyle and wellness guidance session" }
  ],
  sales: [
    { title: "Discovery Call", duration: 30, notes: "Initial discussion about client needs and requirements" },
    { title: "Product Demo", duration: 45, notes: "Comprehensive product demonstration and Q&A" },
    { title: "Proposal Review", duration: 60, notes: "Review detailed proposal and pricing options" },
    { title: "Contract Discussion", duration: 30, notes: "Final contract terms and closing conversation" },
    { title: "Onboarding Call", duration: 45, notes: "New client onboarding and setup process" }
  ],
  support: [
    { title: "Technical Support", duration: 30, notes: "Troubleshooting technical issues and solutions" },
    { title: "Training Session", duration: 60, notes: "Platform training and best practices" },
    { title: "Account Review", duration: 45, notes: "Account performance review and optimization" },
    { title: "Quick Check-in", duration: 15, notes: "Brief status update and assistance" },
    { title: "Implementation Call", duration: 90, notes: "Detailed implementation planning session" }
  ],
  general: [
    { title: "Consultation", duration: 30, notes: "General consultation and discussion" },
    { title: "Planning Session", duration: 45, notes: "Strategic planning and roadmap discussion" },
    { title: "Review Meeting", duration: 60, notes: "Progress review and next steps" },
    { title: "Quick Call", duration: 15, notes: "Brief update and coordination" },
    { title: "Strategy Session", duration: 90, notes: "Comprehensive strategy development" }
  ]
};

// Sources that match what the UI expects
const sources = ["phone", "website", "phone", "website", "phone", "website"]; // Weight phone and website heavily
const statuses: Array<'confirmed' | 'pending' | 'cancelled' | 'completed'> = ['confirmed', 'pending', 'cancelled', 'completed'];

// Weight statuses for realistic distribution
const getRandomStatus = (): 'confirmed' | 'pending' | 'cancelled' | 'completed' => {
  const random = Math.random();
  if (random < 0.6) return 'confirmed';
  if (random < 0.8) return 'completed';
  if (random < 0.95) return 'pending';
  return 'cancelled';
};

const getBookingScenario = (assistantType: string) => {
  const type = assistantType.toLowerCase();
  if (type.includes('health') || type.includes('medical')) return bookingScenarios.healthcare;
  if (type.includes('sales') || type.includes('business')) return bookingScenarios.sales;
  if (type.includes('support') || type.includes('service')) return bookingScenarios.support;
  return bookingScenarios.general;
};

const generateRandomDateTime = (daysOffset: number = 0): Date => {
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + daysOffset);
  
  // Business hours: 9 AM - 6 PM
  const hour = Math.floor(Math.random() * 9) + 9; // 9-17
  const minute = Math.random() < 0.5 ? 0 : 30; // :00 or :30
  
  baseDate.setHours(hour, minute, 0, 0);
  return baseDate;
};

export const generateSimulatedBookings = async (assistants: Array<{ id: string; name: string; type?: string; industry?: string }>) => {
  console.log('Starting booking generation with assistants:', assistants);
  
  if (!assistants.length) {
    throw new Error('No assistants available for simulation');
  }

  const { data: user } = await supabase.auth.getUser();
  console.log('Current user:', user);
  
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const bookings: SimulationBooking[] = [];
  const totalBookings = Math.floor(Math.random() * 15) + 20; // 20-35 bookings
  
  console.log(`Generating ${totalBookings} bookings`);

  for (let i = 0; i < totalBookings; i++) {
    const assistant = assistants[Math.floor(Math.random() * assistants.length)];
    const customer = customerData[Math.floor(Math.random() * customerData.length)];
    const scenarios = getBookingScenario(assistant.type || assistant.industry || 'general');
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Generate bookings across past 2 weeks, current week, and next 3 weeks
    const daysOffset = Math.floor(Math.random() * 42) - 14; // -14 to +28 days
    const startTime = generateRandomDateTime(daysOffset);
    const endTime = new Date(startTime.getTime() + scenario.duration * 60000);

    // Determine source based on assistant type - Phone assistants create phone bookings
    let bookingSource = sources[Math.floor(Math.random() * sources.length)];
    
    // If assistant name or type suggests it's a phone assistant, bias towards phone bookings
    if (assistant.name.toLowerCase().includes('phone') || 
        assistant.type?.toLowerCase().includes('voice') ||
        assistant.type?.toLowerCase().includes('phone')) {
      bookingSource = Math.random() < 0.8 ? 'phone' : 'website'; // 80% phone, 20% website
    }
    // If assistant suggests website/chat, bias towards website
    else if (assistant.name.toLowerCase().includes('website') || 
             assistant.name.toLowerCase().includes('chat') ||
             assistant.type?.toLowerCase().includes('chat')) {
      bookingSource = Math.random() < 0.8 ? 'website' : 'phone'; // 80% website, 20% phone
    }

    bookings.push({
      assistant_id: assistant.id,
      title: scenario.title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      status: getRandomStatus(),
      source: bookingSource,
      timezone: 'UTC',
      notes: scenario.notes
    });
  }

  console.log('Generated bookings:', bookings.length);
  
  // Insert bookings into database
  const bookingsWithUserId = bookings.map(booking => ({
    ...booking,
    user_id: user.user.id
  }));

  console.log('Inserting bookings into database:', bookingsWithUserId.length);

  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingsWithUserId)
    .select();

  console.log('Database insert result:', { data, error });

  if (error) {
    console.error('Database error:', error);
    throw error;
  }
  
  return data;
};

export const clearSimulatedBookings = async () => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('user_id', user.user.id)
    .in('source', ['phone', 'website']); // Only delete simulated bookings by source

  if (error) throw error;
};