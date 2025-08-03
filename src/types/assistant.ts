export interface BaseAssistant {
  id: string;
  name: string;
  type: "Voice" | "Chat" | "Unified";
  industry: string;
  useCase: string;
}

export interface AssistantWithChannels extends BaseAssistant {
  channels: { name: string; connected: boolean; type: "phone" | "website" | "sms" | "whatsapp" }[];
  status: "live" | "setup" | "error";
}