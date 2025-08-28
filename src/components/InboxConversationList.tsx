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
        return <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>;
      case 'drafted':
        return <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full"></span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 relative transition-colors ${
            selectedConversation?.id === conversation.id 
              ? 'bg-muted border-r-2 border-r-primary' 
              : ''
          }`}
          onClick={() => onSelectConversation(conversation)}
        >
          {getStatusIndicator(conversation.status)}
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-sm truncate text-foreground">{conversation.customer}</h3>
            <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
          </div>
          <p className="text-sm font-medium text-muted-foreground truncate mt-1">{conversation.subject}</p>
          <p className="text-sm text-muted-foreground truncate mt-1">{conversation.preview}</p>
        </div>
      ))}
    </div>
  );
};