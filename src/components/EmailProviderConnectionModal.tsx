import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface EmailProviderConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const EmailProviderConnectionModal = ({ 
  isOpen, 
  onClose, 
  onComplete 
}: EmailProviderConnectionModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | null>(null);

  // Reset to step 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedProvider(null);
    }
  }, [isOpen]);

  const handleProviderSelect = (provider: 'gmail' | 'outlook') => {
    setSelectedProvider(provider);
    setStep(2); // Go to loading step
    
    // Simulate OAuth flow with 3-second delay
    setTimeout(() => {
      setStep(3); // Go to success step
    }, 3000);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleBack = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-brand-teal">
            {step === 1 && 'Connect Email Assistant'}
            {step === 2 && 'Connecting Account...'}
            {step === 3 && 'Connection Successful'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Provider Selection */}
          {step === 1 && (
            <>
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Connect Your Email Provider. Choose your email service to get started with the Wiil Email Assistant. 
                  We use secure OAuth 2.0 to connect without ever seeing your password.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gmail Option */}
                <Card 
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-teal-300 group"
                  onClick={() => handleProviderSelect('gmail')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
                        alt="Gmail" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-lg font-semibold">Gmail</h3>
                    <p className="text-sm text-muted-foreground">Connect your Gmail account</p>
                  </CardContent>
                </Card>

                {/* Outlook Option */}
                <Card 
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-teal-300 group"
                  onClick={() => handleProviderSelect('outlook')}
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
                        alt="Outlook" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-lg font-semibold">Outlook</h3>
                    <p className="text-sm text-muted-foreground">Connect your Outlook account</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-start">
                <Button 
                  variant="ghost" 
                  onClick={handleBack}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Assistant Types
                </Button>
              </div>
            </>
          )}

          {/* Step 2: Loading */}
          {step === 2 && (
            <div className="text-center space-y-6 py-8">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Connecting your account... You will be redirected to your email provider to authorize Wiil. 
                  This is a secure process and we will never store your password.
                </p>
                
                {/* Loading animation - bouncing dots */}
                <div className="flex justify-center space-x-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce"></div>
                </div>
                
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Connecting to {selectedProvider === 'gmail' ? 'Gmail' : 'Outlook'}...</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6 py-8">
              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-green-700">Connection Successful!</h3>
                
                <p className="text-muted-foreground">
                  Your email account is now securely connected to Wiil. You'll be redirected to your new inbox shortly.
                </p>
              </div>

              <Button 
                onClick={handleComplete}
                className="bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 shadow-lg hover:shadow-xl transition-all duration-200"
                size="lg"
              >
                Go to Inbox
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};