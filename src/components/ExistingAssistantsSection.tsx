import { MoreHorizontal } from "lucide-react";

interface Assistant {
  id: string;
  name: string;
  type: string;
  channels: { name: string; connected: boolean; icon: string }[];
  status: "live" | "setup" | "error";
}

const ExistingAssistantsSection = () => {
  const assistants: Assistant[] = [
    {
      id: "1",
      name: "Customer Support",
      type: "Voice",
      channels: [
        { name: "Phone", connected: true, icon: "📞" },
        { name: "Website", connected: true, icon: "🌐" },
        { name: "SMS", connected: false, icon: "💬" }
      ],
      status: "live"
    },
    {
      id: "2", 
      name: "Sales Assistant",
      type: "Chat",
      channels: [
        { name: "Phone", connected: false, icon: "📞" },
        { name: "Website", connected: true, icon: "🌐" },
        { name: "WhatsApp", connected: true, icon: "📱" }
      ],
      status: "live"
    },
    {
      id: "3",
      name: "Technical Support",
      type: "Unified",
      channels: [
        { name: "Phone", connected: true, icon: "📞" },
        { name: "Website", connected: true, icon: "🌐" },
        { name: "SMS", connected: true, icon: "💬" }
      ],
      status: "setup"
    }
  ];

  const handleEdit = (assistantName: string) => {
    alert(`✏️ Opening settings for ${assistantName}...\n\nThis would navigate to the tab-based configuration page.`);
  };

  const handleClone = (assistantName: string) => {
    alert(`📋 Cloning ${assistantName}...\n\nThis would create a duplicate assistant with the same configuration.`);
  };

  const handleMenu = (assistantName: string) => {
    alert(`⋮ Options for ${assistantName}:\n\n• View Details\n• Configure Deployment\n• View Analytics\n• Delete Assistant`);
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
        <button 
          onClick={handleCreate}
          className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          + Create Assistant
        </button>
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
                    🎤 {assistant.type}
                  </span>
                </div>
                <div className="flex gap-1">
                  {assistant.channels.map((channel, idx) => (
                    <span
                      key={idx}
                      className={`w-7 h-7 rounded flex items-center justify-center text-sm ${
                        channel.connected 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      title={`${channel.name} ${channel.connected ? 'Connected' : 'Not Connected'}`}
                    >
                      {channel.icon}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${
                    assistant.status === 'live' ? 'bg-green-500' :
                    assistant.status === 'setup' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  <span className="capitalize">{assistant.status}</span>
                </div>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(assistant.name)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleClone(assistant.name)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clone
                  </button>
                  <button
                    onClick={() => handleMenu(assistant.name)}
                    className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
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