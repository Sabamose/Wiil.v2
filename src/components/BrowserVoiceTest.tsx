import { useState, useRef, useEffect } from "react";
import { Phone, Mic, MicOff, X, Volume2, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BaseAssistant } from "@/types/assistant";

// Web Speech API type declarations
interface SpeechRecognitionInterface {
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

interface BrowserVoiceTestProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: BaseAssistant;
}

const BrowserVoiceTest = ({ isOpen, onClose, assistant }: BrowserVoiceTestProps) => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responses, setResponses] = useState<Array<{speaker: 'user' | 'assistant', text: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          handleUserMessage(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleUserMessage = async (message: string) => {
    setIsProcessing(true);
    setResponses(prev => [...prev, { speaker: 'user', text: message }]);

    // Simulate AI response (replace with actual AI call)
    setTimeout(() => {
      const mockResponses = [
        "I understand you need help with that. Let me assist you right away.",
        "That's a great question! I can definitely help you with that.",
        "Thank you for reaching out. I'm here to help resolve any issues you might have.",
        "I see what you're asking about. Let me provide you with the information you need.",
        "That sounds important. I'll make sure to address your concern thoroughly."
      ];
      
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setResponses(prev => [...prev, { speaker: 'assistant', text: response }]);
      
      // Speak the response
      speakText(response);
      setIsProcessing(false);
    }, 1500);
  };

  const speakText = (text: string) => {
    if (synthRef.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      toast({
        title: "Listening Started",
        description: "Speak to test your assistant",
        duration: 2000,
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const startDemo = () => {
    setResponses([]);
    setTranscript("");
    const welcomeMessage = `Hi! I'm ${assistant.name}. How can I help you today?`;
    setResponses([{ speaker: 'assistant', text: welcomeMessage }]);
    speakText(welcomeMessage);
  };

  const clearConversation = () => {
    setResponses([]);
    setTranscript("");
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative p-6 text-center border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-foreground">Browser Voice Test</h2>
          <p className="text-sm text-muted-foreground mt-1">{assistant.name}</p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col h-[600px]">
          {/* Conversation Area */}
          <div className="flex-1 p-6 overflow-y-auto bg-muted/30">
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <Mic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Ready to Test</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Start Demo" to begin a voice conversation with your assistant
                </p>
                <Button onClick={startDemo} className="bg-primary hover:bg-primary/90">
                  <Play className="w-4 h-4 mr-2" />
                  Start Demo
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {responses.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.speaker === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border border-border'
                      }`}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {message.speaker === 'user' ? 'You' : assistant.name}
                      </div>
                      <div className="text-sm">{message.text}</div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="bg-background border border-border p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">{assistant.name}</div>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-6 border-t border-border bg-background">
            <div className="flex items-center justify-center gap-4">
              {responses.length > 0 && (
                <>
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    className="w-16 h-16 rounded-full"
                    disabled={isPlaying}
                  >
                    {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-foreground">
                      {isListening ? 'Listening...' : isPlaying ? 'Assistant Speaking...' : 'Click mic to speak'}
                    </div>
                    {transcript && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Last heard: "{transcript}"
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={clearConversation}
                    variant="outline"
                    size="lg"
                    className="w-16 h-16 rounded-full"
                  >
                    <Square className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>

            {/* Status indicators */}
            <div className="flex justify-center gap-4 mt-4">
              <div className={`flex items-center gap-2 text-xs ${isListening ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                Speech Recognition
              </div>
              <div className={`flex items-center gap-2 text-xs ${isPlaying ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`}></div>
                Voice Synthesis
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Browser-based voice testing. Requires microphone access for speech recognition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserVoiceTest;