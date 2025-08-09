export interface Booking {
  id: string;
  assistant_id: string;
  title: string;
  start_time: string;
  end_time: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  cal_event_id?: string;
  source: string;
  timezone: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface AssistantCalendar {
  id: string;
  assistant_id: string;
  cal_username?: string;
  default_event_type?: string;
  created_at: string;
  updated_at: string;
}