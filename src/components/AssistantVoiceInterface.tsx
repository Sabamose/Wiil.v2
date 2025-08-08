import React from 'react';
import { Mic, MicOff, Square, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAssistantVoiceConversation } from '@/hooks/useAssistantVoiceConversation';
import { StoredAssistant } from '@/hooks/useAssistants';
import VoiceOrb from '@/components/VoiceOrb';
import useMicLevel from '@/hooks/useMicLevel';

interface AssistantVoiceInterfaceProps {
  assistant: StoredAssistant;
}

const AssistantVoiceInterface: React.FC<AssistantVoiceInterfaceProps> = ({ assistant }) => {
  const {
    isRecording,
    isProcessing,
    isSpeaking,
    messages,
    startRecording,
    stopRecording,
    clearConversation
  } = useAssistantVoiceConversation(assistant);

  const level = useMicLevel(isRecording);

  const orbState: 'idle' | 'listening' | 'thinking' | 'speaking' =
    isRecording ? 'listening' : isProcessing ? 'thinking' : isSpeaking ? 'speaking' : 'idle';

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const getMicIcon = () => {
    if (isProcessing) return <Square className="h-6 w-6" />;
    if (isRecording) return <MicOff className="h-6 w-6" />;
    return <Mic className="h-6 w-6" />;
  };

  const getStatusMessage = () => {
    if (isProcessing) return "Processing your message...";
    if (isRecording) return "Listening... Click to stop";
    return "Click the microphone to start talking";
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
      {/* Assistant Info Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{assistant.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {assistant.voice_name} • {assistant.language_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{assistant.type}</Badge>
              <Badge variant={assistant.status === 'active' ? 'default' : 'outline'}>
                {assistant.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conversation Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Conversation
            </CardTitle>
            {messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearConversation}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-3 w-3" />
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Status and Controls */}
          <div className="border-t pt-4 mt-4">
<div className="flex flex-col items-center gap-5">
  <VoiceOrb state={orbState} level={level} size={220} />
  <p className="text-sm text-muted-foreground text-center">
    {getStatusMessage()}
  </p>
  
  <Button
    onClick={handleMicClick}
    disabled={isProcessing}
    size="lg"
    className={`w-16 h-16 rounded-full ${
      isRecording 
        ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
        : 'bg-primary hover:bg-primary/90'
    } ${isProcessing ? 'animate-pulse' : ''}`}
  >
    {getMicIcon()}
  </Button>
</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssistantVoiceInterface;