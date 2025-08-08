import { useState } from "react";
import { Phone, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";
import FuturisticVoiceOrb from "./FuturisticVoiceOrb";
interface CallTestingInterfaceProps {
  assistant: StoredAssistant;
}
const CallTestingInterface = ({
  assistant
}: CallTestingInterfaceProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    toast
  } = useToast();
  const isInboundAssistant = assistant.assistant_type === "inbound";
  const testPhoneNumber = assistant.phone_number || "+1 (555) 123-4567";
  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText(testPhoneNumber);
    toast({
      title: "Phone number copied",
      description: "Test phone number copied to clipboard"
    });
  };
  const handleStartOutboundCall = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter a phone number to receive the test call",
        variant: "destructive"
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
        description: `Calling ${phoneNumber}...`
      });
    }, 2000);
  };
  const handleEndCall = () => {
    setIsActive(false);
    setIsConnecting(false);
    toast({
      title: "Call ended",
      description: "Test call completed"
    });
  };
  return <div className="flex flex-col items-center justify-center min-h-[500px] p-8">
      {/* Testing Bubble */}
      <div className="relative mb-8">
        {/* Pulse rings */}
        {(isActive || isConnecting) && <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-ping"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-ping animation-delay-75"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/5 to-accent/5 animate-ping animation-delay-150"></div>
          </>}
        
        {/* Main orb widget */}
        <div
          className={`relative w-[min(80vw,400px)] h-[min(80vw,400px)] flex items-center justify-center transition-all duration-300 ${isActive || isConnecting ? 'scale-110 drop-shadow-[0_0_40px_hsl(var(--primary)/0.35)]' : 'hover:scale-105'}`}
          aria-label={isInboundAssistant ? 'Voice assistant orb. Click to call.' : 'Voice assistant orb.'}
        >
          {/* SVG Futuristic Orb */}
          <FuturisticVoiceOrb
            size={256}
            state={isConnecting ? 'connecting' : isActive ? 'active' : 'idle'}
            className="pointer-events-none"
          />

          {/* Microphone button for active calls */}
          {isActive && (
            <button
              onClick={handleEndCall}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label="End test call"
            >
              <Phone className="w-5 h-5 rotate-[135deg]" />
            </button>
          )}
        </div>
      </div>

      {/* Assistant Information */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-2">{assistant.name}</h3>
      </div>

      {/* Test Instructions */}
      {isInboundAssistant ? <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h4 className="font-medium mb-3">Test Incoming Calls</h4>
            <p className="text-sm text-muted-foreground mb-4">
        </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="font-mono text-lg flex-1">{testPhoneNumber}</span>
              <Button variant="ghost" size="sm" onClick={handleCopyPhoneNumber} className="shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Your assistant will answer and you can test the conversation flow.
            </p>
          </CardContent>
        </Card> : <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h4 className="font-medium mb-3 text-center">Test Outbound Calls</h4>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Enter your phone number to receive a test call from your assistant:
            </p>
            <div className="space-y-4">
              <Input type="tel" placeholder="+1 (555) 123-4567" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="text-center" disabled={isActive || isConnecting} />
              <Button onClick={handleStartOutboundCall} disabled={isActive || isConnecting || !phoneNumber.trim()} className="w-full">
                {isConnecting ? 'Connecting...' : 'Start Test Call'}
              </Button>
            </div>
            {isActive && <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                <p className="text-sm text-green-700 dark:text-green-300">
                  Call in progress. You should receive a call shortly.
                </p>
                <Button variant="destructive" size="sm" onClick={handleEndCall} className="mt-2">
                  End Test Call
                </Button>
              </div>}
          </CardContent>
        </Card>}
    </div>;
};
export default CallTestingInterface;