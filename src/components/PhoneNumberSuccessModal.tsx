import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Phone, MessageSquare, Target, Calendar, Sparkles } from 'lucide-react';
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--brand-teal))] to-[hsl(var(--brand-teal-hover))] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-xl">🎉 Phone Number Connected Successfully!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Contextual Message Based on Assistant Type */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-lg font-medium mb-2">
              <Phone className="w-5 h-5 text-[hsl(var(--brand-teal))]" />
              {phoneNumber.number}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Successfully connected to <span className="font-medium">{assistantName}</span>
            </p>
            <p className="text-muted-foreground">
              {assistantType === 'inbound' ? (
                <>Your inbound assistant is now live and ready to receive calls! Test it first, then start receiving calls on your configured number.</>
              ) : (
                <>Your outbound assistant is ready to make calls! Test it first, then create campaigns to start reaching your prospects effectively.</>
              )}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => {
                if (onTestAssistant) {
                  onTestAssistant();
                } else {
                  console.log('Test assistant');
                }
                onClose();
              }}
              className="w-full bg-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-hover))] text-white"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Test Your Assistant First
            </Button>

            {assistantType === 'inbound' ? (
              <Button 
                onClick={() => {
                  navigate('/conversations');
                  onClose();
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Monitor Incoming Calls
              </Button>
            ) : (
              <Button 
                onClick={() => {
                  navigate('/campaigns');
                  onClose();
                }}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Target className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center mb-3">Quick access to:</p>
            <div className="flex justify-center gap-4 text-xs">
              <button 
                onClick={() => {
                  navigate('/phone-numbers');
                  onClose();
                }}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-3 w-3" />
                Phone Numbers
              </button>
              <button 
                onClick={() => {
                  navigate('/bookings');
                  onClose();
                }}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Calendar className="h-3 w-3" />
                Bookings
              </button>
              <button 
                onClick={() => {
                  navigate('/conversations');
                  onClose();
                }}
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageSquare className="h-3 w-3" />
                Conversations
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneNumberSuccessModal;