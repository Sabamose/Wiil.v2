import { EmailConversation } from "@/pages/Inbox";
import { Phone, FileText, Star, CheckCircle, AlertTriangle, XCircle, AlertCircle } from "lucide-react";
import { CustomerHistoryModal } from "./CustomerHistoryModal";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";

interface InboxMagicSidebarProps {
  conversation: EmailConversation | null;
}

export const InboxMagicSidebar = ({ conversation }: InboxMagicSidebarProps) => {
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const handleHistoryClick = (historyItem: any) => {
    setSelectedHistory(historyItem);
    setIsHistoryModalOpen(true);
  };

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
        {/* Primary Agent's Draft & Rationale */}
        {conversation.ai_draft ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-sm text-brand-teal mb-3 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full mr-2"></span>
              AI Suggested Reply (Primary Agent)
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
            
            {/* Primary Agent Rationale */}
            {conversation.p1_rationale && (
              <div className="bg-gradient-to-br from-blue-25 to-white border border-blue-100 rounded-lg p-3">
                <h5 className="font-medium text-xs text-blue-700 mb-2 flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                  Primary Agent Rationale
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">{conversation.p1_rationale}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center p-6 bg-gradient-to-br from-teal-25 to-white border border-teal-100 rounded-lg">
            <Star className="h-8 w-8 mx-auto mb-2 text-teal-300" />
            No AI suggestion for this message.
          </div>
        )}

        {/* Secondary Agent's Verification Report */}
        {conversation.p2_verification_report && conversation.p2_confidence && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-purple-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-2"></span>
              Secondary Agent Verification (Confidence: {conversation.p2_confidence}%)
            </h4>
            <div className="bg-gradient-to-br from-purple-25 to-white border border-purple-100 rounded-lg p-4 space-y-3 shadow-sm">
              {Object.entries(conversation.p2_verification_report).map(([key, status]) => {
                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'OK':
                      return <CheckCircle className="h-4 w-4 text-green-500" />;
                    case 'FLAGGED':
                      return <XCircle className="h-4 w-4 text-red-500" />;
                    case 'INCONSISTENT':
                    case 'MISSING':
                      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
                    default:
                      return <AlertCircle className="h-4 w-4 text-gray-400" />;
                  }
                };

                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'OK':
                      return 'OK ✅';
                    case 'FLAGGED':
                      return 'FLAGGED 🚩';
                    case 'INCONSISTENT':
                      return 'Inconsistent ⚠️';
                    case 'MISSING':
                      return 'Missing information ⚠️';
                    default:
                      return status;
                  }
                };

                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600 capitalize">{key}:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-xs text-slate-700">{getStatusText(status)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agent Orchestration Confidence Score */}
        {conversation.orchestration_confidence !== undefined && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full mr-2"></span>
              Agent Orchestration Confidence: {conversation.orchestration_confidence}%
            </h4>
            <div className="bg-gradient-to-br from-slate-25 to-white border border-slate-100 rounded-lg p-4 space-y-3 shadow-sm">
              <Progress 
                value={conversation.orchestration_confidence} 
                className={`h-3 ${
                  conversation.orchestration_confidence >= 80 
                    ? 'confidence-high' 
                    : conversation.orchestration_confidence >= 60 
                    ? 'confidence-medium' 
                    : 'confidence-low'
                }`}
              />
              <div className="text-xs text-slate-600">
                {conversation.orchestration_confidence >= 80 ? (
                  <span className="text-green-600 font-medium">Above auto-send threshold (80%)</span>
                ) : (
                  <span className="text-amber-600 font-medium">Below auto-send threshold (80%). Human review advised.</span>
                )}
              </div>
              {conversation.final_decision === 'HUMAN-REVIEW-MANDATORY' && (
                <div className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ Policy flag triggered: Mandatory human review required.
                </div>
              )}
            </div>
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
              <div 
                key={index} 
                className="flex items-start space-x-3 bg-gradient-to-br from-orange-25 to-white border border-orange-100 p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md hover:border-orange-200 transition-all duration-200"
                onClick={() => handleHistoryClick(item)}
              >
                <Phone className="h-5 w-5 text-orange-500 shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 leading-relaxed">{item.summary}</p>
                  <p className="text-xs text-orange-400 font-medium mt-1">{item.timestamp}</p>
                  <p className="text-xs text-slate-500 mt-1">Click to view transcript</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer History Modal */}
      <CustomerHistoryModal
        historyItem={selectedHistory}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </>
  );
};