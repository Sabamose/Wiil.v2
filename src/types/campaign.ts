export interface Campaign {
  id: string;
  name: string;
  recipients: number;
  agent: string;
  status: 'completed' | 'in-progress' | 'pending';
  completionPercentage: number;
  duration: string;
  phoneNumber: string;
  createdAt: Date;
  csvData: CampaignRecipient[];
}

export interface CampaignRecipient {
  id: string;
  phone_number: string;
  status: 'completed' | 'no-answer' | 'pending';
  [key: string]: any; // For dynamic variables
}