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
  status: 'active' | 'completed' | 'missed' | 'queued';
  duration: number; // in seconds
  timestamp: Date;
  transcript?: string;
  summary?: string;
  collectedData?: Record<string, any>;
}

export interface DataVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'email' | 'phone' | 'date' | 'boolean';
  description: string;
  required: boolean;
}