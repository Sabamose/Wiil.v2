import { MoreHorizontal, TestTube, Settings, Copy, Link, Trash2, Mic, MessageCircle, Repeat, Phone, Globe, MessageSquare, Smartphone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { BaseAssistant, AssistantWithChannels } from "@/types/assistant";
import TestAssistantModal from "./TestAssistantModal";
import { useState } from "react";

interface ExistingAssistantsSectionProps {
  assistants: BaseAssistant[];
}

const ExistingAssistantsSection = ({ assistants }: ExistingAssistantsSectionProps) => {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<BaseAssistant | null>(null);

  // Convert assistants to include channel data with different statuses
  const assistantsWithChannels: AssistantWithChannels[] = assistants.map((assistant, index) => ({
    ...assistant,
    channels: [
      { name: "Phone", connected: true, type: "phone" },
      { name: "Website", connected: true, type: "website" },
      { name: "SMS", connected: false, type: "sms" }
    ],
    // Set different statuses: first assistant as live, second as draft, rest as live
    status: index === 1 ? "draft" as const : "live" as const
  }));

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "phone": return Phone;
      case "website": return Globe;
      case "sms": return MessageSquare;
      case "whatsapp": return Smartphone;
      default: return MessageCircle;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Voice": return Mic;
      case "Chat": return MessageCircle;
      case "Unified": return Repeat;
      default: return MessageCircle;
    }
  };

  const handleTestAssistant = (assistant: BaseAssistant) => {
    setSelectedAssistant(assistant);
    setIsTestModalOpen(true);
  };

  const handleTryDemo = () => {
    alert(`🎯 Try our demo assistants!\n\n• Customer Support Demo\n• Sales Assistant Demo\n• Technical Support Demo\n\nThis would open a demo interface to test different assistant templates.`);
  };

  const handleEditSettings = (assistantName: string) => {
    alert(`⚙️ Opening settings for ${assistantName}...\n\nThis would navigate to the tab-based configuration page.`);
  };

  const handleDuplicate = (assistantName: string) => {
    alert(`📋 Duplicating ${assistantName}...\n\nThis would create a duplicate assistant with the same configuration.`);
  };

  const handleIntegrateChannels = (assistantName: string) => {
    alert(`🔗 Integrating channels for ${assistantName}...\n\nThis would open the channel integration settings.`);
  };

  const handleDelete = (assistantName: string) => {
    if (confirm(`Are you sure you want to delete ${assistantName}? This action cannot be undone.`)) {
      alert(`🗑️ Deleting ${assistantName}...`);
    }
  };

  const handleCreate = () => {
    // This will be handled by the parent component
    const event = new CustomEvent('create-assistant');
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Assistants</h2>
        <div className="flex gap-3">
          <button 
            onClick={handleCreate}
            className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Create Assistant
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Assistant Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Type & Channels</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assistantsWithChannels.map((assistant, index) => (
            <tr 
              key={assistant.id} 
              className={`border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 cursor-pointer group hover-scale ${index === assistantsWithChannels.length - 1 ? 'border-b-0' : ''}`}
              onClick={() => {
                const event = new CustomEvent('view-assistant-settings', {
                  detail: { assistantId: assistant.id }
                });
                window.dispatchEvent(event);
              }}
            >
              <td className="px-6 py-5">
                <div className="font-semibold group-hover:text-gray-900 transition-colors">{assistant.name}</div>
              </td>
              <td className="px-6 py-5">
                <div className="space-y-2">
                  {/* Assistant Type */}
                  <div className="flex items-center gap-2">
                    {assistant.assistantType === 'inbound' ? (
                      <PhoneIncoming className="w-4 h-4 text-gray-600" />
                    ) : (
                      <PhoneOutgoing className="w-4 h-4 text-gray-600" />
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {assistant.assistantType === 'inbound' ? 'Incoming Call Assistant' : 'Outgoing Call Assistant'}
                    </span>
                  </div>
                  
                  {/* Phone Number */}
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">
                      {assistant.phoneNumber || "Phone number not assigned"}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${
                    assistant.status === 'live' ? 'bg-gray-800' :
                    assistant.status === 'draft' ? 'bg-gray-500' : 'bg-gray-400'
                  }`}></span>
                  <span className="capitalize text-gray-800">{assistant.status}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleTestAssistant(assistant);
                      }}>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditSettings(assistant.name)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(assistant.name)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleIntegrateChannels(assistant.name)}>
                        <Link className="w-4 h-4 mr-2" />
                        Integrate Channels
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(assistant.name)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedAssistant && (
        <TestAssistantModal
          isOpen={isTestModalOpen}
          onClose={() => {
            setIsTestModalOpen(false);
            setSelectedAssistant(null);
          }}
          assistant={selectedAssistant}
        />
      )}
    </div>
  );
};

export default ExistingAssistantsSection;