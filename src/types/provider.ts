export interface ServiceProvider {
  id: string;
  user_id: string;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  working_hours: WorkingHours;
  created_at: string;
  updated_at: string;
}

export interface WorkingHours {
  monday?: { start: string; end: string } | null;
  tuesday?: { start: string; end: string } | null;
  wednesday?: { start: string; end: string } | null;
  thursday?: { start: string; end: string } | null;
  friday?: { start: string; end: string } | null;
  saturday?: { start: string; end: string } | null;
  sunday?: { start: string; end: string } | null;
}

export interface ProviderConfiguration {
  providerCount: number;
  businessType: string;
  clientsRequestSpecific: boolean;
  allowPreferences: boolean;
}