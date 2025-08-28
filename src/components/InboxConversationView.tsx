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
      <div className="p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <h2 className="font-bold text-xl text-brand-teal mb-1">{conversation.subject}</h2>
        <p className="text-sm text-teal-600 font-medium">From {conversation.customer}</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-sm">
        {conversation.thread.map((message, index) => (
          <div key={index} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
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

      {/* AI Draft Section */}
      {conversation.ai_draft && (
        <div className="bg-blue-50 border-t border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-blue-800">AI Generated Draft</h3>
              {conversation.ai_source && (
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                  Source: {conversation.ai_source.name}
                </span>
              )}
            </div>
            
            {isEditingDraft ? (
              <div className="space-y-4">
                <Textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={8}
                  className="w-full border-blue-200 focus:border-blue-400 focus:ring-blue-400/20"
                  placeholder="Edit your draft here..."
                />
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleSaveDraft}
                    size="sm"
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline" 
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed bg-white p-4 rounded border border-blue-200">
                {conversation.ai_draft}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Adaptive Action Button */}
          {(() => {
            const decision = conversation.final_decision;
            
            switch (decision) {
              case 'AUTO-SEND-READY':
                return (
                  <Button className="bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                );
              case 'HUMAN-REVIEW-RECOMMENDED':
                return (
                  <Button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Review & Send
                  </Button>
                );
              case 'HUMAN-REVIEW-MANDATORY':
                return (
                  <Button 
                    disabled
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white opacity-50 cursor-not-allowed shadow-lg transition-all duration-200"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Review & Override Send
                  </Button>
                );
              default:
                return (
                  <Button className="bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Send className="h-4 w-4 mr-2" />
                    Approve & Send
                  </Button>
                );
            }
          })()}
          
          {!isEditingDraft && conversation.ai_draft && (
            <Button 
              onClick={handleEditDraft}
              variant="outline" 
              className="border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Draft
            </Button>
          )}
        </div>
      </div>
    </>
  );
};