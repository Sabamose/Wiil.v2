import React, { useState } from 'react';
import { Bot, Mic, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AssistantVoiceInterface from './AssistantVoiceInterface';
import { StoredAssistant } from '@/hooks/useAssistants';

interface EnhancedVoiceInterfaceProps {
  assistants: StoredAssistant[];
  loading?: boolean;
}

const EnhancedVoiceInterface: React.FC<EnhancedVoiceInterfaceProps> = ({ assistants, loading }) => {
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);

  const selectedAssistant = assistants.find(a => a.id === selectedAssistantId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-muted-foreground">Loading assistants...</span>
        </div>
      </div>
    );
  }

  if (assistants.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Voice Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Assistants Available</h3>
          <p className="text-muted-foreground mb-4">
            You need to create an assistant first to start voice conversations.
          </p>
          <Button onClick={() => window.dispatchEvent(new CustomEvent('openAssistantCreation'))}>
            Create Your First Assistant
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Assistant Selection */}
      {!selectedAssistant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Start Voice Conversation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select an Assistant to Talk With
              </label>
              <Select value={selectedAssistantId || ""} onValueChange={setSelectedAssistantId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose an assistant..." />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map((assistant) => (
                    <SelectItem key={assistant.id} value={assistant.id}>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4" />
                          <span>{assistant.name}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {assistant.voice_name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {assistant.language_name}
                          </Badge>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAssistantId && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-2">Selected Assistant</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Name:</span>
                    <span className="text-sm font-medium">{selectedAssistant?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Voice:</span>
                    <span className="text-sm">{selectedAssistant?.voice_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Language:</span>
                    <span className="text-sm">{selectedAssistant?.language_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <Badge variant="secondary">{selectedAssistant?.type}</Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Voice Interface */}
      {selectedAssistant && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Voice Conversation</h2>
            <Button
              variant="outline"
              onClick={() => setSelectedAssistantId(null)}
            >
              Change Assistant
            </Button>
          </div>
          <AssistantVoiceInterface assistant={selectedAssistant} />
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceInterface;