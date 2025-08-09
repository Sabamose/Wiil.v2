import { MoreHorizontal, TestTube, Settings, Copy, Link, Trash2, Mic, MessageCircle, Repeat, Phone, Globe, MessageSquare, Smartphone, PhoneIncoming, PhoneOutgoing, AlertTriangle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { StoredAssistant, useAssistants } from "@/hooks/useAssistants";
import TestAssistantModal from "./TestAssistantModal";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface ExistingAssistantsSectionProps {
  assistants: StoredAssistant[];
  loading?: boolean;
  onRefresh?: () => void;
}
const ExistingAssistantsSection = ({
  assistants,
  loading = false,
  onRefresh
}: ExistingAssistantsSectionProps) => {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<StoredAssistant | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Convert assistants to include channel data with different statuses
  const assistantsWithChannels = assistants.map((assistant, index) => ({
    ...assistant,
    channels: [{
      name: "Phone",
      connected: true,
      type: "phone"
    }, {
      name: "Website",
      connected: true,
      type: "website"
    }, {
      name: "SMS",
      connected: false,
      type: "sms"
    }],
    // Use existing status or set default
    status: assistant.status || (index === 1 ? "draft" : "live")
  }));

  console.log('ExistingAssistantsSection - Received assistants:', assistants);
  console.log('ExistingAssistantsSection - Processed assistantsWithChannels:', assistantsWithChannels);
  const getChannelIcon = (type: string) => {
    switch (type) {
      case "phone":
        return Phone;
      case "website":
        return Globe;
      case "sms":
        return MessageSquare;
      case "whatsapp":
        return Smartphone;
      default:
        return MessageCircle;
    }
  };
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Voice":
        return Mic;
      case "Chat":
        return MessageCircle;
      case "Unified":
        return Repeat;
      default:
        return MessageCircle;
    }
  };
  const handleTestAssistant = (assistant: any) => {
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

  return <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={handleCreate} className="absolute top-4 right-4 px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 transition-colors z-10">
        + Create Assistant
      </button>

      {loading ? <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading assistants...</span>
        </div> : assistants.length === 0 ? <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No assistants created yet</p>
          <button onClick={handleCreate} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Create Your First Assistant
          </button>
        </div> : <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Assistant Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Assistant Type
          </th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500"></th>
          </tr>
        </thead>
        <tbody>
          {assistantsWithChannels.map((assistant, index) => <tr key={assistant.id} className={`border-b border-gray-100 hover:bg-teal-600/10 hover:shadow-md transition-all duration-200 cursor-pointer group hover-scale ${index === assistantsWithChannels.length - 1 ? 'border-b-0' : ''}`} onClick={() => {
          const event = new CustomEvent('view-assistant-settings', {
            detail: {
              assistantId: assistant.id
            }
          });
          window.dispatchEvent(event);
        }}>
              <td className="px-6 py-5">
                <div className="font-semibold group-hover:text-gray-900 transition-colors">{assistant.name}</div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  {assistant.assistant_type === 'inbound' ? <PhoneIncoming className="w-4 h-4 text-teal-600" /> : <PhoneOutgoing className="w-4 h-4 text-teal-600" />}
                  <span className="text-sm font-medium text-gray-800">
                    {assistant.assistant_type === 'inbound' ? 'Incoming Call Assistant' : 'Outgoing Calls'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${assistant.status === 'live' ? 'bg-teal-600' : 'bg-gray-400'}`}></span>
                  <span className={`text-sm font-medium ${assistant.status === 'live' ? 'text-teal-600' : 'text-gray-500'}`}>
                    {assistant.status === 'live' ? 'Live' : 'Draft'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors flex items-center justify-center" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={e => {
                    e.stopPropagation();
                    handleTestAssistant(assistant);
                  }}>
                        <TestTube className="w-4 h-4 mr-2" />
                        Test Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditSettings(assistant.name)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Assistant
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(assistant.name)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate('/phone-numbers'); }}>
                        <Link className="w-4 h-4 mr-2" />
                        Manage Phone Number
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(assistant.name)} className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>)}
        </tbody>
      </table>}

      {selectedAssistant && <TestAssistantModal isOpen={isTestModalOpen} onClose={() => {
      setIsTestModalOpen(false);
      setSelectedAssistant(null);
    }} assistant={selectedAssistant} />}
    </div>;
};
export default ExistingAssistantsSection;