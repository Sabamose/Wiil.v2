import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, MicOff, Loader2, Trash2 } from 'lucide-react';
import { useVoiceConversation } from '@/hooks/useVoiceConversation';
import { cn } from '@/lib/utils';

const AVAILABLE_VOICES = [
  { id: 'aria', name: 'Aria (Female)' },
  { id: 'sarah', name: 'Sarah (Female)' },
  { id: 'charlotte', name: 'Charlotte (Female)' },
  { id: 'alice', name: 'Alice (Female)' },
  { id: 'lily', name: 'Lily (Female)' },
  { id: 'roger', name: 'Roger (Male)' },
  { id: 'callum', name: 'Callum (Male)' },
  { id: 'liam', name: 'Liam (Male)' }
];

const VoiceConversationInterface = () => {
  const {
    isRecording,
    isProcessing,
    messages,
    selectedVoice,
    setSelectedVoice,
    startRecording,
    stopRecording,
    clearConversation
  } = useVoiceConversation();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Voice AI Assistant
            <div className="flex items-center gap-2">
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {messages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearConversation}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Control */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={cn(
                "h-20 w-20 rounded-full transition-all duration-200",
                isRecording 
                  ? "bg-destructive hover:bg-destructive/90 animate-pulse" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              ) : isRecording ? (
                <MicOff className="h-8 w-8 text-white" />
              ) : (
                <Mic className="h-8 w-8 text-white" />
              )}
            </Button>
          </div>

          {/* Status */}
          <div className="text-center text-sm text-muted-foreground">
            {isProcessing ? (
              "Processing your message..."
            ) : isRecording ? (
              "Listening... Click to stop"
            ) : (
              "Click to start talking"
            )}
          </div>

          {/* Conversation History */}
          {messages.length > 0 && (
            <Card className="border-muted">
              <CardHeader>
                <CardTitle className="text-lg">Conversation</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.role === 'user' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] px-4 py-2 rounded-lg",
                            message.role === 'user'
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceConversationInterface;