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
          className={`p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 relative transition-all duration-200 ${
            selectedConversation?.id === conversation.id 
              ? 'bg-slate-100 border-r-2 border-r-slate-400 shadow-sm' 
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          {getStatusIndicator(conversation.status)}
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-semibold text-sm truncate text-slate-700">{conversation.customer}</h3>
            <span className="text-xs text-slate-400 font-medium">{conversation.timestamp}</span>
          </div>
          <p className="text-sm font-medium text-slate-700 truncate mb-1">{conversation.subject}</p>
          <p className="text-sm text-slate-500 truncate leading-relaxed">{conversation.preview}</p>
        </div>
      ))}
    </div>
  );
};