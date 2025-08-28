import { EmailConversation } from "@/pages/Inbox";

interface InboxConversationListProps {
  conversations: EmailConversation[];
  selectedConversation: EmailConversation | null;
  onSelectConversation: (conversation: EmailConversation) => void;
}

export const InboxConversationList = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}: InboxConversationListProps) => {
  const getStatusIndicator = (status: EmailConversation['status']) => {
    switch (status) {
      case 'needs_review':
        return <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></span>;
      case 'drafted':
        return <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 relative transition-colors ${
            selectedConversation?.id === conversation.id 
              ? 'bg-blue-50 border-r-2 border-r-blue-500' 
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          {getStatusIndicator(conversation.status)}
          <div className="mb-2">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium text-gray-900 text-sm">{conversation.customer}</h3>
              <span className="text-xs text-gray-500">{conversation.timestamp}</span>
            </div>
            <p className="text-sm text-gray-900 font-normal mt-1 truncate">{conversation.subject}</p>
          </div>
          <p className="text-sm text-gray-600 truncate leading-relaxed">{conversation.preview}</p>
        </div>
      ))}
    </div>
  );
};