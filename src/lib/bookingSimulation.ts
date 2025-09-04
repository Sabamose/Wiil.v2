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

// Realistic customer data - Expanded list
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
  { name: "Kevin Brown", phone: "+1 (555) 012-3456", email: "k.brown@consulting.biz" },
  { name: "Maria Garcia", phone: "+1 (555) 321-6549", email: "maria.g@ventures.com" },
  { name: "James Wilson", phone: "+1 (555) 432-7650", email: "j.wilson@enterprises.net" },
  { name: "Ashley Miller", phone: "+1 (555) 543-8761", email: "ashley.m@innovations.org" },
  { name: "Matthew Taylor", phone: "+1 (555) 654-9872", email: "m.taylor@dynamics.co" },
  { name: "Rachel White", phone: "+1 (555) 765-0983", email: "rachel.w@strategies.io" },
  { name: "Daniel Moore", phone: "+1 (555) 876-1094", email: "daniel.m@creative.biz" },
  { name: "Stephanie Clark", phone: "+1 (555) 987-2105", email: "s.clark@global.com" },
  { name: "Brian Lewis", phone: "+1 (555) 098-3216", email: "brian.l@partners.net" },
  { name: "Nicole Hall", phone: "+1 (555) 109-4327", email: "nicole.h@systems.org" },
  { name: "Jonathan Wright", phone: "+1 (555) 210-5438", email: "j.wright@development.co" },
  { name: "Lauren Green", phone: "+1 (555) 321-6549", email: "lauren.g@media.io" },
  { name: "Ryan King", phone: "+1 (555) 432-7650", email: "ryan.k@digital.biz" },
  { name: "Michelle Adams", phone: "+1 (555) 543-8761", email: "michelle.a@forward.com" },
  { name: "Tyler Scott", phone: "+1 (555) 654-9872", email: "tyler.s@nexus.net" },
  { name: "Samantha Baker", phone: "+1 (555) 765-0983", email: "samantha.b@prime.org" },
  { name: "Alex Turner", phone: "+1 (555) 876-1094", email: "alex.t@vertex.co" },
  { name: "Megan Phillips", phone: "+1 (555) 987-2105", email: "megan.p@horizon.io" },
  { name: "Jordan Campbell", phone: "+1 (555) 098-3216", email: "jordan.c@pulse.biz" },
  { name: "Natalie Evans", phone: "+1 (555) 109-4327", email: "natalie.e@summit.com" },
  { name: "Marcus Stewart", phone: "+1 (555) 210-5438", email: "marcus.s@catalyst.net" }
];

// Booking scenarios by assistant type/industry - Expanded
const bookingScenarios = {
  healthcare: [
    { title: "Initial Consultation", duration: 30, notes: "New patient consultation for health assessment" },
    { title: "Follow-up Appointment", duration: 15, notes: "Follow-up on previous treatment plan" },
    { title: "Health Screening", duration: 45, notes: "Annual health screening and wellness check" },
    { title: "Prescription Review", duration: 20, notes: "Review current medications and adjustments" },
    { title: "Wellness Coaching", duration: 60, notes: "Lifestyle and wellness guidance session" },
    { title: "Diagnostic Review", duration: 25, notes: "Review diagnostic test results and next steps" },
    { title: "Therapy Session", duration: 50, notes: "Individual therapy and counseling session" },
    { title: "Preventive Care", duration: 30, notes: "Preventive care consultation and planning" }
  ],
  sales: [
    { title: "Discovery Call", duration: 30, notes: "Initial discussion about client needs and requirements" },
    { title: "Product Demo", duration: 45, notes: "Comprehensive product demonstration and Q&A" },
    { title: "Proposal Review", duration: 60, notes: "Review detailed proposal and pricing options" },
    { title: "Contract Discussion", duration: 30, notes: "Final contract terms and closing conversation" },
    { title: "Onboarding Call", duration: 45, notes: "New client onboarding and setup process" },
    { title: "Needs Assessment", duration: 40, notes: "Detailed analysis of business requirements" },
    { title: "ROI Analysis", duration: 35, notes: "Return on investment discussion and projections" },
    { title: "Competitive Review", duration: 25, notes: "Market comparison and competitive analysis" },
    { title: "Implementation Planning", duration: 50, notes: "Strategic implementation roadmap discussion" }
  ],
  support: [
    { title: "Technical Support", duration: 30, notes: "Troubleshooting technical issues and solutions" },
    { title: "Training Session", duration: 60, notes: "Platform training and best practices" },
    { title: "Account Review", duration: 45, notes: "Account performance review and optimization" },
    { title: "Quick Check-in", duration: 15, notes: "Brief status update and assistance" },
    { title: "Implementation Call", duration: 90, notes: "Detailed implementation planning session" },
    { title: "Bug Report Review", duration: 20, notes: "Investigation and resolution of reported issues" },
    { title: "Feature Request", duration: 35, notes: "Discussion of new feature requirements" },
    { title: "System Integration", duration: 75, notes: "Integration setup and configuration support" }
  ],
  general: [
    { title: "Consultation", duration: 30, notes: "General consultation and discussion" },
    { title: "Planning Session", duration: 45, notes: "Strategic planning and roadmap discussion" },
    { title: "Review Meeting", duration: 60, notes: "Progress review and next steps" },
    { title: "Quick Call", duration: 15, notes: "Brief update and coordination" },
    { title: "Strategy Session", duration: 90, notes: "Comprehensive strategy development" },
    { title: "Project Kickoff", duration: 60, notes: "New project initiation and team alignment" },
    { title: "Status Update", duration: 20, notes: "Regular status check and progress review" },
    { title: "Goal Setting", duration: 40, notes: "Objective setting and milestone planning" },
    { title: "Performance Review", duration: 45, notes: "Performance evaluation and feedback session" },
    { title: "Team Coordination", duration: 25, notes: "Cross-team collaboration and coordination" }
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
  
  // Extended business hours: 8 AM - 8 PM for more variety
  const hour = Math.floor(Math.random() * 12) + 8; // 8-19 (8 AM - 7 PM)
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]; // :00, :15, :30, :45
  
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
  const totalBookings = Math.floor(Math.random() * 40) + 60; // 60-100 bookings for better coverage
  
  console.log(`Generating ${totalBookings} bookings`);

  // Generate more bookings for better calendar coverage
  for (let i = 0; i < totalBookings; i++) {
    const assistant = assistants[Math.floor(Math.random() * assistants.length)];
    const customer = customerData[Math.floor(Math.random() * customerData.length)];
    const scenarios = getBookingScenario(assistant.type || assistant.industry || 'general');
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    // Better date distribution: past month, current month, next 2 months
    const daysOffset = Math.floor(Math.random() * 120) - 30; // -30 to +90 days for wider spread
    const startTime = generateRandomDateTime(daysOffset);
    const endTime = new Date(startTime.getTime() + scenario.duration * 60000);

    // Force a balanced distribution of phone vs website bookings
    let bookingSource: string;
    
    // Create alternating pattern with bias based on index
    if (i % 2 === 0) {
      bookingSource = 'phone'; // Every even booking is phone
    } else {
      bookingSource = 'website'; // Every odd booking is website  
    }
    
    // Add some randomness but maintain balance
    if (Math.random() < 0.3) {
      bookingSource = bookingSource === 'phone' ? 'website' : 'phone';
    }
    
    // If assistant name suggests specific type, still use some bias
    if (assistant.name.toLowerCase().includes('phone') || 
        assistant.type?.toLowerCase().includes('voice')) {
      bookingSource = Math.random() < 0.7 ? 'phone' : bookingSource;
    } else if (assistant.name.toLowerCase().includes('website') || 
               assistant.name.toLowerCase().includes('chat')) {
      bookingSource = Math.random() < 0.7 ? 'website' : bookingSource;
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