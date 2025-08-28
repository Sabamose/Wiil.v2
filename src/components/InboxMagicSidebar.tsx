import { EmailConversation } from "@/pages/Inbox";
import { Phone, FileText, Star } from "lucide-react";

interface InboxMagicSidebarProps {
  conversation: EmailConversation | null;
}

export const InboxMagicSidebar = ({ conversation }: InboxMagicSidebarProps) => {
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-teal-300 p-6">
          <Star className="h-16 w-16 mx-auto mb-4 opacity-60" />
          <p className="text-lg font-medium text-slate-400">AI Assistant</p>
          <p className="text-sm text-slate-400 mt-1">Select a conversation to see AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-teal-100 bg-white/90 backdrop-blur-sm">
        <h3 className="font-bold text-brand-teal flex items-center">
          <Star className="h-5 w-5 mr-2 text-teal-500" />
          AI Assistant
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/80 backdrop-blur-sm">
        {/* AI Suggested Reply */}
        {conversation.ai_draft ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-brand-teal mb-3 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mr-2"></span>
              AI Suggested Reply
            </h4>
            <div className="bg-gradient-to-br from-teal-25 to-white border border-teal-100 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap shadow-sm">
              {conversation.ai_draft}
            </div>
            {conversation.ai_source && (
              <div className="mt-3 text-xs text-teal-600 flex items-center bg-teal-50 p-2 rounded-md">
                <FileText className="h-3 w-3 mr-2" />
                <span>
                  Source: <strong className="text-teal-700">{conversation.ai_source.name}</strong> 
                  <span className="text-teal-500 ml-1">({conversation.ai_source.type})</span>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center p-6 bg-gradient-to-br from-teal-25 to-white border border-teal-100 rounded-lg">
            <Star className="h-8 w-8 mx-auto mb-2 text-teal-300" />
            No AI suggestion for this message.
          </div>
        )}

        {/* Customer History */}
        {conversation.history.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-brand-teal mb-3 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full mr-2"></span>
              Customer History
            </h4>
            {conversation.history.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-gradient-to-br from-orange-25 to-white border border-orange-100 p-3 rounded-lg shadow-sm">
                <Phone className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                <div>
                  <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
                  <p className="text-xs text-orange-400 font-medium mt-1">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};