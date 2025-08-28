import { EmailConversation } from "@/pages/Inbox";
import { Phone, FileText, Star } from "lucide-react";

interface InboxMagicSidebarProps {
  conversation: EmailConversation | null;
}

export const InboxMagicSidebar = ({ conversation }: InboxMagicSidebarProps) => {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground p-4">
          <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>AI Assistant details will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-foreground">AI Assistant</h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* AI Suggested Reply */}
        {conversation.ai_draft ? (
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">AI Suggested Reply</h4>
            <div className="bg-muted border border-border rounded-md p-3 text-sm text-foreground whitespace-pre-wrap">
              {conversation.ai_draft}
            </div>
            {conversation.ai_source && (
              <div className="mt-2 text-xs text-muted-foreground flex items-center">
                <FileText className="h-3 w-3 mr-1" />
                <span>
                  Source: <strong>{conversation.ai_source.name}</strong> ({conversation.ai_source.type})
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center p-4 bg-muted rounded-md">
            No AI suggestion for this message.
          </div>
        )}

        {/* Customer History */}
        {conversation.history.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-2">Customer History</h4>
            {conversation.history.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-muted p-2 rounded-md mb-2">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-foreground">{item.summary}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};