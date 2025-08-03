import { useState } from "react";
import { X, Phone, MessageSquare, Play, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BaseAssistant } from "@/types/assistant";

interface TestAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: BaseAssistant;
}

const TestAssistantModal = ({ isOpen, onClose, assistant }: TestAssistantModalProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Mock phone number for the assistant
  const assistantPhoneNumber = "+1205896-4339";

  const handleCallBack = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to receive a test call.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Test Call Initiated",
        description: `Your ${assistant.name} assistant will call ${phoneNumber} in a few seconds.`,
        duration: 5000,
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(assistantPhoneNumber);
    toast({
      title: "Phone Number Copied",
      description: "Assistant phone number copied to clipboard.",
      duration: 3000,
    });
  };

  const handleSendMessage = () => {
    toast({
      title: "SMS Test Available",
      description: `Send a text message to ${assistantPhoneNumber} to test your assistant.`,
      duration: 5000,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Test Channel</h2>
              <p className="text-sm text-gray-600">Test your phone call integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assistant Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Phone className="w-5 h-5 text-gray-600" />
              <span className="font-medium">{assistant.name} - Calls</span>
              <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                Deployed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Phone Call</p>
                <p className="font-medium">{assistantPhoneNumber}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyNumber}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* Test Options */}
          <div className="space-y-4">
            {/* Direct Call */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Call the Assistant
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Call {assistantPhoneNumber} directly to test your assistant
              </p>
              <Button
                variant="outline"
                onClick={handleCopyNumber}
                className="w-full flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Copy Phone Number
              </Button>
            </div>

            {/* Callback */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Get a Call Back
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter your number and we'll have your assistant call you
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="+15551234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCallBack}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isLoading ? "Calling..." : "Call Me"}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Examples: +15551234567 (US), +442012345678 (UK), +4915551234567 (Germany)
              </p>
            </div>

            {/* SMS Test */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Test SMS
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Send a text message to test chat functionality
              </p>
              <Button
                variant="outline"
                onClick={handleSendMessage}
                className="w-full flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Send Test Message
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestAssistantModal;