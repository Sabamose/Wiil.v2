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
        <div className="text-center p-6">
          <Star className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 font-medium">Wiil Assistant</p>
          <p className="text-sm text-gray-400 mt-1">Select a conversation to see AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Clean Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <h3 className="font-semibold text-gray-900">Wiil Assistant</h3>
      </div>

      {/* AI Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
        {/* AI Suggested Reply (Primary Agent) */}
        {conversation.ai_draft && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 text-sm">
              AI Suggested Reply (Primary Agent)
            </h4>
            <div className="bg-gray-50 border rounded-lg p-4 text-sm text-gray-900">
              {conversation.ai_draft}
            </div>
            {conversation.ai_source && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded flex items-center">
                <FileText className="h-3 w-3 mr-2" />
                <span>Source: {conversation.ai_source.name}</span>
              </div>
            )}
            
            {/* Primary Agent Rationale */}
            {conversation.p1_rationale && (
              <div className="bg-blue-50 border rounded-lg p-3">
                <h5 className="font-medium text-xs text-blue-900 mb-2">
                  Primary Agent Rationale
                </h5>
                <p className="text-xs text-gray-700">{conversation.p1_rationale}</p>
              </div>
            )}
          </div>
        )}

        {/* Secondary Agent's Verification Report */}
        {conversation.p2_verification_report && conversation.p2_confidence && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 text-sm">
              Secondary Agent Verification (Confidence: {conversation.p2_confidence}%)
            </h4>
            <div className="bg-purple-50 border rounded-lg p-4 space-y-3">
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
                    <span className="text-xs font-medium text-gray-700 capitalize">{key}:</span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className="text-xs text-gray-700">{getStatusText(status)}</span>
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
            <h4 className="font-medium text-gray-900 text-sm">
              Agent Orchestration Confidence: {conversation.orchestration_confidence}%
            </h4>
            <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
              <Progress 
                value={conversation.orchestration_confidence} 
                className={`h-2 ${
                  conversation.orchestration_confidence >= 80 
                    ? 'confidence-high' 
                    : conversation.orchestration_confidence >= 60 
                    ? 'confidence-medium' 
                    : 'confidence-low'
                }`}
              />
              <div className="text-xs text-gray-600">
                {conversation.orchestration_confidence >= 80 ? (
                  <span className="text-green-600">Above auto-send threshold (80%)</span>
                ) : (
                  <span className="text-amber-600">Below auto-send threshold (80%). Human review advised.</span>
                )}
              </div>
              {conversation.final_decision === 'HUMAN-REVIEW-MANDATORY' && (
                <div className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded border border-red-200">
                  ⚠️ Policy flag triggered: Mandatory human review required.
                </div>
              )}
            </div>
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