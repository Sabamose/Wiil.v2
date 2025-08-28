import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmailConversation } from "@/pages/Inbox";
import { Send, Edit, Inbox, Save, X, AlertTriangle, AlertCircle } from "lucide-react";

interface InboxConversationViewProps {
  conversation: EmailConversation | null;
}

export const InboxConversationView = ({ conversation }: InboxConversationViewProps) => {
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  // Initialize draft content when conversation changes or edit mode starts
  const handleEditDraft = () => {
    if (conversation?.ai_draft) {
      setDraftContent(conversation.ai_draft);
      setIsEditingDraft(true);
    }
  };

  const handleSaveDraft = () => {
    // In a real app, this would save to backend
    setIsEditingDraft(false);
    // For simulation, we could update the conversation object
  };

  const handleCancelEdit = () => {
    setIsEditingDraft(false);
    setDraftContent(conversation?.ai_draft || "");
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Inbox className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">Select a conversation to view</p>
          <p className="text-sm text-gray-400 mt-1">Choose from the list to see email details</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Clean Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">{conversation.subject}</h2>
        <p className="text-sm text-gray-600">From {conversation.customer}</p>
      </div>

      {/* Email Thread */}
      <div className="flex-1 overflow-y-auto bg-white">
        {conversation.thread.map((message, index) => (
          <div key={index} className="px-6 py-6 border-b border-gray-100">
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">From:</span> 
                <span className="text-gray-900 font-medium">{message.from}</span>
              </div>
              <div className="text-gray-500">Aug 28, 2025</div>
            </div>
            <div className="text-gray-600 text-sm mb-4 flex items-center space-x-2">
              <span className="text-gray-500">To:</span>
              <span className="text-gray-900">{message.to}</span>
            </div>
            <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
              {message.body}
            </div>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Adaptive Action Button */}
          {(() => {
            const decision = conversation.final_decision;
            
            switch (decision) {
              case 'AUTO-SEND-READY':
                return (
                  <Button className="bg-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-hover))] text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                );
              case 'HUMAN-REVIEW-RECOMMENDED':
                return (
                  <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review & Send
                  </Button>
                );
              case 'HUMAN-REVIEW-MANDATORY':
                return (
                  <Button 
                    disabled
                    className="bg-red-500 text-white opacity-50 cursor-not-allowed"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Review & Override Send
                  </Button>
                );
              default:
                return (
                  <Button className="bg-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-hover))] text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                );
            }
          })()}
          
          <Button 
            onClick={handleEditDraft}
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Edit Draft
          </Button>
        </div>
      </div>
    </>
  );
};