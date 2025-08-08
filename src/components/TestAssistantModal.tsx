import { useState } from "react";
import { X, Phone, MessageSquare, Play, Copy, Mic, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";
import CallTestingInterface from "./CallTestingInterface";

interface TestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: StoredAssistant;
  onBackToCreation?: () => void;
}

const TestAssistantModal = ({ isOpen, onClose, assistant, onBackToCreation }: TestAssistantModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-background border rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Button 
            variant="ghost" 
            onClick={onBackToCreation || onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Testing
          </Button>
          <div className="font-semibold">Test Assistant</div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Testing Interface Content */}
        <div className="flex-1 overflow-hidden">
          <CallTestingInterface assistant={assistant} />
        </div>
      </div>
    </div>
  );
};

export default TestAssistantModal;