import { useState } from "react";
import { Phone, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";

interface CallTestingInterfaceProps {
  assistant: StoredAssistant;
}

const CallTestingInterface = ({ assistant }: CallTestingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const isInboundAssistant = assistant.assistant_type === "inbound";
  const testPhoneNumber = assistant.phone_number || "+1 (555) 123-4567";

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText(testPhoneNumber);
    toast({
      title: "Phone number copied",
      description: "Test phone number copied to clipboard",
    });
  };

  const handleStartOutboundCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to receive the test call",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    // Simulate outbound call initiation
    setTimeout(() => {
      setIsConnecting(false);
      setIsActive(true);
      toast({
        title: "Test call initiated",
        description: `Calling ${phoneNumber}...`,
      });
    }, 2000);
  };

  const handleEndCall = () => {
    setIsActive(false);
    setIsConnecting(false);
    toast({
      title: "Call ended",
      description: "Test call completed",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      {/* Testing Bubble */}
      <div className="relative mb-8">
        {/* Pulse rings */}
        {(isActive || isConnecting) && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-ping animation-delay-75"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/5 to-accent/5 animate-ping animation-delay-150"></div>
          </>
        )}
        
        {/* Main bubble */}
        <div 
          className={`relative w-64 h-64 rounded-full bg-gradient-to-br from-primary/80 via-primary to-accent transition-all duration-300 shadow-2xl ${
            isActive || isConnecting ? 'scale-110 shadow-primary/50' : 'hover:scale-105'
          }`}
        >
          {/* Inner content */}
          <div className="absolute inset-8 rounded-full bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center">
            <Phone className={`w-8 h-8 text-white mb-2 ${isActive ? 'animate-bounce' : ''}`} />
            <div className="text-white text-center">
              <div className="text-sm font-medium">
                {isConnecting ? 'Connecting...' : isActive ? 'Live Call' : isInboundAssistant ? 'Try a call' : 'Start test call'}
              </div>
              {isActive && (
                <div className="text-xs opacity-80 mt-1">
                  Tap to interrupt
                </div>
              )}
            </div>
          </div>

          {/* Microphone button for active calls */}
          {isActive && (
            <button 
              onClick={handleEndCall}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            >
              <Phone className="w-5 h-5 text-white rotate-[135deg]" />
            </button>
          )}
        </div>
      </div>

      {/* Assistant Information */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{assistant.name}</h3>
        <p className="text-muted-foreground">
          {isInboundAssistant ? 'Inbound Call Assistant' : 'Outbound Call Assistant'}
        </p>
      </div>

      {/* Test Instructions */}
      {isInboundAssistant ? (
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h4 className="font-medium mb-3">Test Incoming Calls</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Call this number to test your phone number integration:
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="font-mono text-lg flex-1">{testPhoneNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyPhoneNumber}
                className="shrink-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Your assistant will answer and you can test the conversation flow.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h4 className="font-medium mb-3 text-center">Test Outbound Calls</h4>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Enter your phone number to receive a test call from your assistant:
            </p>
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-center"
                disabled={isActive || isConnecting}
              />
              <Button
                onClick={handleStartOutboundCall}
                disabled={isActive || isConnecting || !phoneNumber.trim()}
                className="w-full"
              >
                {isConnecting ? 'Connecting...' : 'Start Test Call'}
              </Button>
            </div>
            {isActive && (
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Call in progress. You should receive a call shortly.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEndCall}
                  className="mt-2"
                >
                  End Test Call
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CallTestingInterface;