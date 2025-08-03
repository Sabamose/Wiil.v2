export interface PhoneNumber {
  id: string;
  number: string;
  provider: "SignalWire" | "Twilio";
  assignedAssistant?: {
    id: string;
    name: string;
  };
  status: "active" | "inactive";
  purchaseDate: string;
  monthlyCost: number;
  country: string;
  type: "local" | "toll-free";
}

export interface PurchasePhoneNumberRequest {
  provider: "SignalWire" | "Twilio";
  country: string;
  type: "local" | "toll-free";
  number: string;
  cost: number;
}