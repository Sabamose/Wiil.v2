import { useState } from "react";
import { X, Phone, MessageSquare, Play, Copy, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";
import CallTestingInterface from "./CallTestingInterface";

interface TestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: StoredAssistant;
}

const TestAssistantModal = ({ isOpen, onClose, assistant }: TestAssistantModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-background border rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}

        {/* Testing Interface Content */}
        <div className="flex-1 overflow-hidden">
          <CallTestingInterface assistant={assistant} />
        </div>
      </div>
    </div>
  );
};

export default TestAssistantModal;