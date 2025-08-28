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
        <div className="text-center text-teal-300">
          <Inbox className="h-16 w-16 mx-auto mb-4 opacity-60" />
          <p className="text-lg font-medium text-slate-400">Select a conversation to view</p>
          <p className="text-sm text-slate-400 mt-1">Choose from the list to see email details</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-teal-100 bg-white/90 backdrop-blur-sm">
        <h2 className="font-bold text-xl text-brand-teal mb-1">{conversation.subject}</h2>
        <p className="text-sm text-teal-600 font-medium">From {conversation.customer}</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm">
        {conversation.thread.map((message, index) => (
          <div key={index} className="p-6 border-b border-teal-50 hover:bg-teal-25 transition-colors duration-200">
            <div className="flex justify-between text-sm mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-brand-teal">From:</span> 
                <span className="text-slate-600 font-medium">{message.from}</span>
              </div>
              <div className="text-teal-400 font-medium">Aug 28, 2025</div>
            </div>
            <div className="text-slate-600 text-sm mb-4 flex items-center space-x-2">
              <span className="font-semibold text-brand-teal">To:</span>
              <span className="font-medium">{message.to}</span>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
              {message.body}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-teal-100">
        <div className="flex items-center space-x-4">
          <Button className="bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200">
            <Send className="h-4 w-4 mr-2" />
            Approve & Send
          </Button>
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300">
            <Edit className="h-4 w-4 mr-2" />
            Edit Draft
          </Button>
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300">
            <UserPlus className="h-4 w-4 mr-2" />
            Assign
          </Button>
        </div>
      </div>
    </>
  );
};