export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  company?: string;
}

export interface InboundCall {
  id: string;
  customer: Customer;
  status: 'active' | 'completed' | 'missed' | 'voicemail';
  duration: number; // in seconds
  timestamp: Date;
  transcript?: string;
  summary?: string;
  collectedData?: Record<string, any>;
  recordingUrl?: string;
}

export type CallType = 'inbound' | 'outbound';