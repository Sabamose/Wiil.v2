import { useState } from "react";
import { X, Phone, MessageSquare, Play, Copy, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";
import AssistantVoiceInterface from "./AssistantVoiceInterface";

interface TestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: StoredAssistant;
}

const TestAssistantModal = ({ isOpen, onClose, assistant }: TestAssistantModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Mic className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Test Voice Assistant</h2>
              <p className="text-sm text-muted-foreground">Have a real-time conversation with your assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Voice Interface Content */}
        <div className="flex-1 p-6 overflow-hidden">
          <AssistantVoiceInterface assistant={assistant} />
        </div>
      </div>
    </div>
  );
};

export default TestAssistantModal;