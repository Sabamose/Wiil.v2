import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Phone, PhoneCall, Users, BarChart3, TestTube } from 'lucide-react';
import { PhoneNumber } from '@/types/phoneNumber';

interface PhoneNumberSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: PhoneNumber;
  assistantType: 'inbound' | 'outbound';
  assistantName: string;
  onTestAssistant?: () => void;
  onStartCampaign?: () => void;
  onMonitorCalls?: () => void;
}

const PhoneNumberSuccessModal = ({ 
  isOpen, 
  onClose, 
  phoneNumber, 
  assistantType, 
  assistantName,
  onTestAssistant,
  onStartCampaign,
  onMonitorCalls
}: PhoneNumberSuccessModalProps) => {
  const navigate = useNavigate();
  
  const getNextStepsForAssistantType = () => {
    if (assistantType === 'inbound') {
      return {
        title: "Your Inbound Assistant is Ready!",
        description: "Customers can now call your number and speak with your AI assistant.",
        actions: [
          {
            icon: <TestTube className="w-5 h-5" />,
            title: "Test Your Assistant",
            description: "Call your number to test the assistant",
            action: () => {
              if (onTestAssistant) {
                onTestAssistant();
              } else {
                console.log('Test assistant');
              }
            },
            variant: "default" as const
          },
          {
            icon: <Users className="w-5 h-5" />,
            title: "Monitor Incoming Calls",
            description: "View and analyze customer conversations",
            action: () => navigate('/conversations'),
            variant: "outline" as const
          }
        ]
      };
    } else {
      return {
        title: "Your Outbound Assistant is Ready!",
        description: "Start creating campaigns to reach out to potential customers.",
        actions: [
          {
            icon: <PhoneCall className="w-5 h-5" />,
            title: "Create First Campaign",
            description: "Start making outbound calls to prospects",
            action: () => navigate('/campaigns'),
            variant: "default" as const
          },
          {
            icon: <TestTube className="w-5 h-5" />,
            title: "Test Assistant",
            description: "Test your assistant with a sample call",
            action: () => {
              if (onTestAssistant) {
                onTestAssistant();
              } else {
                console.log('Test assistant');
              }
            },
            variant: "outline" as const
          }
        ]
      };
    }
  };

  const { title, description, actions } = getNextStepsForAssistantType();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Phone Number Success Info */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-lg font-medium">
              <Phone className="w-5 h-5 text-teal-600" />
              {phoneNumber.number}
            </div>
            <p className="text-sm text-gray-600">
              Successfully connected to <span className="font-medium">{assistantName}</span>
            </p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">What's Next?</h3>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="w-full justify-start h-auto p-4"
                  onClick={() => {
                    action.action?.();
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{action.icon}</div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm opacity-80">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            I'll do this later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneNumberSuccessModal;