import { Button } from "@/components/ui/button";
import { EmailConversation } from "@/pages/Inbox";
import { Send, Edit, UserPlus, Inbox } from "lucide-react";

interface InboxConversationViewProps {
  conversation: EmailConversation | null;
}

export const InboxConversationView = ({ conversation }: InboxConversationViewProps) => {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Inbox className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Select a conversation to view</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <h2 className="font-bold text-lg text-foreground">{conversation.subject}</h2>
        <p className="text-sm text-muted-foreground">From {conversation.customer}</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-background">
        {conversation.thread.map((message, index) => (
          <div key={index} className="p-4 border-b border-border">
            <div className="flex justify-between text-sm mb-2">
              <div>
                <strong className="text-foreground">From:</strong> 
                <span className="text-muted-foreground ml-1">{message.from}</span>
              </div>
              <div className="text-muted-foreground">Aug 28, 2025</div>
            </div>
            <div className="text-muted-foreground text-sm mb-4">
              <strong>To:</strong> {message.to}
            </div>
            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
              {message.body}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-background border-t border-border">
        <div className="flex items-center space-x-4">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="h-4 w-4 mr-2" />
            Approve & Send
          </Button>
          <Button variant="secondary">
            <Edit className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
          <Button variant="secondary">
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </div>
    </>
  );
};