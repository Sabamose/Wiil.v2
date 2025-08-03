import { useState } from "react";
import { Phone, Mic, MicOff, X, Volume2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BaseAssistant } from "@/types/assistant";

interface LocalizedTestEnvironmentProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: BaseAssistant;
}

const LocalizedTestEnvironment = ({ isOpen, onClose, assistant }: LocalizedTestEnvironmentProps) => {
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  if (!isOpen) return null;

  const handleStartCall = async () => {
    setIsCallActive(true);
    toast({
      title: "Test Call Started",
      description: `Connected to ${assistant.name} - Test Environment`,
      duration: 3000,
    });

    // Simulate call duration
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Store interval for cleanup
    setTimeout(() => {
      clearInterval(interval);
    }, 60000); // Auto-end after 1 minute for demo
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    toast({
      title: "Test Call Ended",
      description: "Call session completed successfully",
      duration: 2000,
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
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
        <div className="p-8 text-center">
          {/* Gradient Circle - Similar to Eleven Labs */}
          <div className="relative w-64 h-64 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-gradient-conic from-primary/20 via-primary/40 to-primary/20 animate-spin-slow"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-radial from-primary/30 to-transparent"></div>
            <div className="absolute inset-4 rounded-full bg-background shadow-inner"></div>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isCallActive ? (
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="w-20 h-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-8 h-8" />
                </Button>
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
              <Button
                variant="outline"
                size="sm"
                className="w-12 h-12 rounded-full"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Status Message */}
          <div className="text-center">
            {!isCallActive ? (
              <>
                <Button
                  onClick={handleStartCall}
                  size="lg"
                  className="mb-4 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-medium"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call AI Agent
                </Button>
                <p className="text-sm text-muted-foreground">
                  Test calls are free in development.{" "}
                  <span className="text-primary cursor-pointer hover:underline">Learn more</span>
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <p className="text-foreground font-medium">Connected to {assistant.name}</p>
                <p className="text-sm text-muted-foreground">
                  Speak naturally to test your assistant
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-muted rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">
              This is a secure test environment. No data is stored or processed.
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