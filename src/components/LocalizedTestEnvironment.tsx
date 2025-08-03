import { useState } from "react";
import { Phone, Mic, MicOff, X, Volume2, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { BaseAssistant } from "@/types/assistant";
import VoiceCallService from "@/services/voiceCallService";

interface LocalizedTestEnvironmentProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: BaseAssistant;
}

const LocalizedTestEnvironment = ({ isOpen, onClose, assistant }: LocalizedTestEnvironmentProps) => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<"main" | "getCallback" | "calling">("main");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock assistant phone number
  const assistantPhoneNumber = "+1 (205) 896-4339";

  const handleRequestCallback = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number to receive a call.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentView("calling");

    try {
      // Use the voice call service to initiate actual call
      const response = await VoiceCallService.initiateCall({
        phoneNumber: phoneNumber,
        assistantId: assistant.id,
        assistantName: assistant.name,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to initiate call');
      }
      
      setIsCallActive(true);
      toast({
        title: "Call Initiated Successfully",
        description: `${assistant.name} is calling ${phoneNumber}`,
        duration: 4000,
      });

      // Start call duration timer
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);

      // Auto-end call after demo period
      setTimeout(() => {
        clearInterval(interval);
        handleEndCall();
      }, 60000);

    } catch (error) {
      toast({
        title: "Call Failed",
        description: "Unable to initiate call. Please try again.",
        variant: "destructive",
      });
      setCurrentView("getCallback");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectCall = () => {
    window.open(`tel:${assistantPhoneNumber}`, '_self');
    toast({
      title: "Dialing Assistant",
      description: `Calling ${assistantPhoneNumber}`,
      duration: 3000,
    });
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(assistantPhoneNumber);
    toast({
      title: "Number Copied",
      description: "Assistant phone number copied to clipboard",
      duration: 2000,
    });
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setCurrentView("main");
    setPhoneNumber("");
    toast({
      title: "Call Ended",
      description: "Test call session completed",
      duration: 2000,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMainView = () => (
    <>
      {/* Gradient Circle */}
      <div className="relative w-64 h-64 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-conic from-primary/20 via-primary/40 to-primary/20 animate-spin-slow"></div>
        <div className="absolute inset-2 rounded-full bg-gradient-radial from-primary/30 to-transparent"></div>
        <div className="absolute inset-4 rounded-full bg-background shadow-inner"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handleDirectCall}
            size="lg"
            className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse"
          >
            <Phone className="w-8 h-8" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <Button
            onClick={handleDirectCall}
            size="lg"
            className="mb-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium"
          >
            <Phone className="w-5 h-5 mr-2" />
            Call AI Agent Now
          </Button>
          <p className="text-sm text-muted-foreground mb-4">
            Call {assistantPhoneNumber} directly
          </p>
          <Button
            variant="outline"
            onClick={handleCopyNumber}
            className="mb-6"
          >
            Copy Phone Number
          </Button>
        </div>

        <div className="border-t border-border pt-4">
          <Button
            onClick={() => setCurrentView("getCallback")}
            variant="outline"
            size="lg"
            className="w-full bg-secondary hover:bg-secondary/80"
          >
            Get a Call Back Instead
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Have the assistant call your number
          </p>
        </div>
      </div>
    </>
  );

  const renderCallbackView = () => (
    <>
      <div className="text-center mb-8">
        <Button
          variant="ghost"
          onClick={() => setCurrentView("main")}
          className="absolute top-4 left-4 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Get a Call Back</h3>
        <p className="text-muted-foreground">
          Enter your phone number and {assistant.name} will call you
        </p>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="+1 (555) 123-4567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="text-center text-lg py-6"
          disabled={isLoading}
        />
        
        <Button
          onClick={handleRequestCallback}
          disabled={isLoading || !phoneNumber.trim()}
          size="lg"
          className="w-full py-6 text-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Calling...
            </>
          ) : (
            <>
              <Phone className="w-5 h-5 mr-2" />
              Call Me Now
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Examples: +1 (555) 123-4567 (US), +44 20 1234 5678 (UK)
        </p>
      </div>
    </>
  );

  const renderCallingView = () => (
    <>
      <div className="text-center">
        {/* Animated calling indicator */}
        <div className="relative w-64 h-64 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-conic from-primary/40 via-primary/60 to-primary/40 animate-spin"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-radial from-primary/50 to-transparent animate-pulse"></div>
          <div className="absolute inset-4 rounded-full bg-background shadow-inner"></div>
          
          <div className="absolute inset-0 flex items-center justify-center">
            {!isCallActive ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2 mx-auto animate-pulse">
                  <Phone className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-sm font-medium text-muted-foreground">Calling...</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-destructive hover:bg-destructive/90 flex items-center justify-center mb-2 mx-auto cursor-pointer transition-colors" 
                     onClick={handleEndCall}>
                  <Phone className="w-6 h-6 text-destructive-foreground" />
                </div>
                <div className="text-sm font-medium text-foreground">{formatDuration(callDuration)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Call Controls */}
        {isCallActive && (
          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full ${isMuted ? 'bg-destructive text-destructive-foreground' : ''}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-12 h-12 rounded-full"
            >
              <Volume2 className="w-5 h-5" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {!isCallActive ? (
            <>
              <p className="text-foreground font-medium">Calling {phoneNumber}</p>
              <p className="text-sm text-muted-foreground">
                Please answer your phone to connect with {assistant.name}
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground font-medium">Connected to {assistant.name}</p>
              <p className="text-sm text-muted-foreground">
                Speak naturally to test your assistant
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">Test AI Agent</h2>
          <p className="text-sm text-muted-foreground mt-1">{assistant.name}</p>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {currentView === "main" && renderMainView()}
          {currentView === "getCallback" && renderCallbackView()}
          {currentView === "calling" && renderCallingView()}
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Test calls are secure and free in development environment
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .bg-gradient-conic {
          background: conic-gradient(from 0deg, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.2));
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, hsl(var(--primary) / 0.3), transparent);
        }
      `}</style>
    </div>
  );
};

export default LocalizedTestEnvironment;