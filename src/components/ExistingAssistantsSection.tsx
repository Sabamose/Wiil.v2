import { MoreHorizontal, TestTube, Settings, Copy, Link, Trash2, Mic, MessageCircle, Repeat, Phone, Globe, MessageSquare, Smartphone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Assistant {
  id: string;
  name: string;
  type: "Voice" | "Chat" | "Unified";
  channels: { name: string; connected: boolean; type: "phone" | "website" | "sms" | "whatsapp" }[];
  status: "live" | "setup" | "error";
}

const ExistingAssistantsSection = () => {
  const assistants: Assistant[] = [
    {
      id: "1",
      name: "Customer Support",
      type: "Voice",
      channels: [
        { name: "Phone", connected: true, type: "phone" },
        { name: "Website", connected: true, type: "website" },
        { name: "SMS", connected: false, type: "sms" }
      ],
      status: "live"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Chat",
      channels: [
        { name: "Phone", connected: false, type: "phone" },
        { name: "Website", connected: true, type: "website" },
        { name: "WhatsApp", connected: true, type: "whatsapp" }
      ],
      status: "live"
    },
    {
      id: "3",
      name: "Technical Support",
      type: "Unified",
      channels: [
        { name: "Phone", connected: true, type: "phone" },
        { name: "Website", connected: true, type: "website" },
        { name: "SMS", connected: true, type: "sms" }
      ],
      status: "setup"
    }
  ];

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

  const handleTestAssistant = (assistantName: string) => {
    alert(`🎙️ Starting voice test for ${assistantName}...\n\nThis would connect to ElevenLabs API for voice testing.`);
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
          {assistants.map((assistant, index) => (
            <tr 
              key={assistant.id} 
              className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index === assistants.length - 1 ? 'border-b-0' : ''}`}
            >
              <td className="px-6 py-5">
                <div className="font-semibold">{assistant.name}</div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium">
                    {(() => {
                      const TypeIcon = getTypeIcon(assistant.type);
                      return <TypeIcon className="w-3 h-3" />;
                    })()}
                    {assistant.type}
                  </span>
                </div>
                <div className="flex gap-1">
                  {assistant.channels.map((channel, idx) => {
                    const ChannelIcon = getChannelIcon(channel.type);
                    return (
                      <span
                        key={idx}
                        className={`w-7 h-7 rounded flex items-center justify-center ${
                          channel.connected 
                            ? 'bg-gray-200 text-gray-700' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                        title={`${channel.name} ${channel.connected ? 'Connected' : 'Not Connected'}`}
                      >
                        <ChannelIcon className="w-4 h-4" />
                      </span>
                    );
                  })}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${
                    assistant.status === 'live' ? 'bg-gray-800' :
                    assistant.status === 'setup' ? 'bg-gray-500' : 'bg-gray-400'
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
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleTestAssistant(assistant.name)}>
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
    </div>
  );
};

export default ExistingAssistantsSection;