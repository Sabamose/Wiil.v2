export interface BaseAssistant {
  id: string;
  name: string;
  type: "Voice" | "Chat" | "Unified";
  industry: string;
  useCase: string;
  assistantType?: "inbound" | "outbound"; // New field for call direction
  phoneNumber?: string; // New field for assigned phone number
}

export interface AssistantWithChannels extends BaseAssistant {
  channels: { name: string; connected: boolean; type: "phone" | "website" | "sms" | "whatsapp" }[];
  status: "live" | "draft" | "setup" | "error";
}