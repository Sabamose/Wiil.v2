import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Globe, Inbox, ArrowLeft, Check } from "lucide-react";

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'selection' | 'provider' | 'connecting' | 'success';

export const CreateAssistantModal = ({ isOpen, onClose }: CreateAssistantModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('selection');
  const [selectedProvider, setSelectedProvider] = useState<'gmail' | 'outlook' | null>(null);

  const handleModalClose = () => {
    setCurrentStep('selection');
    setSelectedProvider(null);
    onClose();
  };

  const handleEmailAssistantClick = () => {
    setCurrentStep('provider');
  };

  const handleProviderSelect = (provider: 'gmail' | 'outlook') => {
    setSelectedProvider(provider);
    setCurrentStep('connecting');
    
    // Simulate OAuth connection
    setTimeout(() => {
      setCurrentStep('success');
    }, 3000);
  };

  const handleGoToInbox = () => {
    handleModalClose();
    // Navigate to inbox would be handled here
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <div className="animate-fade-in">
            <h3 className="font-semibold text-slate-600 mb-1">What type of assistant do you need?</h3>
            <p className="text-sm text-slate-500 mb-6">Choose the channel your assistant will operate on.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone Assistant */}
              <div className="border border-slate-200 rounded-lg p-4 text-center hover:border-slate-300 hover:bg-slate-50 cursor-not-allowed opacity-60 transition-all duration-200">
                <Phone className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                <h4 className="font-semibold text-slate-700">Phone Assistant</h4>
                <p className="text-xs text-slate-500 mt-1">Handles phone calls and voice interactions.</p>
              </div>
              
              {/* Website Assistant */}
              <div className="border border-slate-200 rounded-lg p-4 text-center hover:border-slate-300 hover:bg-slate-50 cursor-not-allowed opacity-60 transition-all duration-200">
                <Globe className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                <h4 className="font-semibold text-slate-700">Website Assistant</h4>
                <p className="text-xs text-slate-500 mt-1">Provides support through web chat.</p>
              </div>
              
              {/* Email Assistant - Featured */}
              <div 
                onClick={handleEmailAssistantClick}
                className="border-2 border-teal-500 bg-gradient-to-br from-teal-50 to-teal-25 rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ring-4 ring-teal-500/20 shadow-lg hover:shadow-xl"
              >
                <Inbox className="h-8 w-8 mx-auto mb-3 text-teal-600" />
                <h4 className="font-semibold text-teal-700">Email Assistant</h4>
                <p className="text-xs text-teal-600 mt-1 font-medium">Manages your team's shared inbox.</p>
              </div>
            </div>
          </div>
        );

      case 'provider':
        return (
          <div className="animate-fade-in">
            <button
              onClick={() => setCurrentStep('selection')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Assistant Types
            </button>
            <h3 className="font-semibold text-slate-700 mb-2">Connect Your Email Provider</h3>
            <p className="text-sm text-slate-500 mb-6">
              Choose your email service to get started with the Wiil Email Assistant. 
              We use secure OAuth 2.0 to connect without ever seeing your password.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handleProviderSelect('gmail')}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  G
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-700">Gmail</h4>
                  <p className="text-xs text-slate-500">Connect your Gmail account</p>
                </div>
              </button>
              
              <button
                onClick={() => handleProviderSelect('outlook')}
                className="w-full flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                  O
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-700">Outlook</h4>
                  <p className="text-xs text-slate-500">Connect your Outlook account</p>
                </div>
              </button>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="animate-fade-in text-center py-8">
            <h3 className="font-semibold text-slate-700 mb-2">Connecting Account...</h3>
            <p className="text-sm text-slate-500 mb-8">
              Connecting your account... You will be redirected to your email provider to authorize Wiil. 
              This is a secure process and we will never store your password.
            </p>
            <div className="flex justify-center items-center space-x-1">
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="animate-fade-in text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-2">Connection Successful</h3>
            <p className="text-sm text-slate-500 mb-6">
              Your email account is now securely connected to Wiil. 
              You'll be redirected to your new inbox shortly.
            </p>
            <Button
              onClick={handleGoToInbox}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6"
            >
              Go to Inbox
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'selection':
        return 'Create New Assistant';
      case 'provider':
        return 'Connect Email Assistant';
      case 'connecting':
        return 'Connecting Account...';
      case 'success':
        return 'Connection Successful';
      default:
        return 'Create New Assistant';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-lg bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">{getStepTitle()}</DialogTitle>
        </DialogHeader>
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};