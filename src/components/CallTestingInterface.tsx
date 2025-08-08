import { useState } from "react";
import { Phone, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { StoredAssistant } from "@/hooks/useAssistants";
import VoiceOrbSigma from "./VoiceOrbSigma";
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
  const uiState: "idle" | "listening" | "thinking" | "speaking" | "muted" | "error" = isConnecting ? "thinking" : isActive ? "speaking" : "idle";
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
      {/* Voice Orb Widget */}
      <div className="relative mb-8">
        <VoiceOrbSigma width={400} height={400} orb={300} state={uiState} muted={false} />

        {/* Microphone button for active calls */}
        {isActive && <button onClick={handleEndCall} className="absolute bottom-8 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10" aria-label="End test call">
            <Phone className="w-5 h-5 rotate-[135deg]" />
          </button>}
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4 mb-6 w-full max-w-md">
        <div className="flex-1 h-px bg-border"></div>
        <span className="text-muted-foreground font-medium">OR</span>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      {/* Test Instructions */}
      {isInboundAssistant ? <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h4 className="font-medium mb-3">Call Assistant to this number: </h4>
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