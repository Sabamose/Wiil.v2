import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, ArrowLeft, ArrowRight, Volume2 } from 'lucide-react';
import { useElevenLabsLibrary } from '@/hooks/useElevenLabsLibrary';
import { useAssistants, CreateAssistantData } from '@/hooks/useAssistants';
import { useToast } from '@/components/ui/use-toast';

interface EnhancedAssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (assistantId: string) => void;
}

const INDUSTRIES = [
  'E-commerce', 'Healthcare', 'Finance', 'Education', 'Real Estate',
  'Technology', 'Retail', 'Hospitality', 'Automotive', 'Legal'
];

const USE_CASES = [
  'Customer Support', 'Sales', 'Lead Generation', 'Appointment Scheduling',
  'Order Processing', 'Technical Support', 'Information Inquiry', 'Feedback Collection'
];

const EnhancedAssistantCreationFlow: React.FC<EnhancedAssistantCreationFlowProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState<CreateAssistantData>({
    name: '',
    type: 'Voice',
    industry: '',
    use_case: '',
    voice_id: 'aria',
    voice_name: 'Aria (Female)',
    language: 'en',
    language_name: 'English',
    system_prompt: 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
    initial_message: 'Hello! How can I help you today?',
    temperature: 0.7,
    max_tokens: 300
  });

  const { voices, languages, loading: libraryLoading, testVoice } = useElevenLabsLibrary();
  const { createAssistant } = useAssistants();
  const { toast } = useToast();

  const handleTestVoice = async () => {
    if (!formData.voice_id) return;
    
    setIsTestingVoice(true);
    try {
      const audioContent = await testVoice(formData.voice_id, formData.initial_message, formData.language);
      if (audioContent) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
        await audio.play();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test voice",
        variant: "destructive",
      });
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleCreateAssistant = async () => {
    setIsCreating(true);
    try {
      const newAssistant = await createAssistant(formData);
      if (newAssistant) {
        onComplete?.(newAssistant.id);
        onClose();
        // Reset form
        setStep(1);
        setFormData({
          name: '',
          type: 'Voice',
          industry: '',
          use_case: '',
          voice_id: 'aria',
          voice_name: 'Aria (Female)',
          language: 'en',
          language_name: 'English',
          system_prompt: 'You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.',
          initial_message: 'Hello! How can I help you today?',
          temperature: 0.7,
          max_tokens: 300
        });
      }
    } catch (error) {
      console.error('Error creating assistant:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        return formData.name && formData.industry && formData.use_case;
      case 2:
        return formData.voice_id && formData.language;
      case 3:
        return formData.system_prompt && formData.initial_message;
      default:
        return false;
    }
  };

  if (libraryLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading voice library...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assistant - Step {step} of 3</DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > stepNum ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Assistant Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Customer Support Bot"
                  />
                </div>

                {/* Assistant Type field removed - hardcoded to Voice */}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((industry) => (
                          <SelectItem key={industry} value={industry.toLowerCase()}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="useCase">Use Case</Label>
                    <Select
                      value={formData.use_case}
                      onValueChange={(value) => setFormData({ ...formData, use_case: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                      <SelectContent>
                        {USE_CASES.map((useCase) => (
                          <SelectItem key={useCase} value={useCase.toLowerCase().replace(/\s+/g, '-')}>
                            {useCase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Voice & Language Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Voice & Language Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Select Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(voices).map(([id, voice]) => (
                      <div
                        key={id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.voice_id === id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            voice_id: id,
                            voice_name: `${voice.name} (${voice.gender})`
                          })
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-sm text-muted-foreground">{voice.description}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {voice.gender}
                            </Badge>
                          </div>
                          {formData.voice_id === id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTestVoice();
                              }}
                              disabled={isTestingVoice}
                            >
                              {isTestingVoice ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => {
                      const selectedLang = languages[value];
                      setFormData({
                        ...formData,
                        language: value,
                        language_name: selectedLang?.name || 'English'
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language">
                        {formData.language_name || "Select language"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(languages).length > 0 ? (
                        Object.entries(languages).map(([code, lang]) => (
                          <SelectItem key={code} value={code}>
                            {lang.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="en">English (Loading...)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {formData.voice_id && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Volume2 className="h-4 w-4" />
                      <span className="font-medium">Voice Preview</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Test how your assistant will sound in {formData.language_name} with the selected voice
                    </p>
                    <Button onClick={handleTestVoice} disabled={isTestingVoice} variant="outline">
                      {isTestingVoice ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Testing Voice...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Test Voice
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: AI Configuration */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="initialMessage">Initial Message</Label>
                  <Input
                    id="initialMessage"
                    value={formData.initial_message}
                    onChange={(e) => setFormData({ ...formData, initial_message: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                  />
                </div>

                <div>
                  <Label htmlFor="systemPrompt">System Prompt</Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    rows={4}
                    placeholder="Define how your assistant should behave..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="temperature">Temperature ({formData.temperature})</Label>
                    <input
                      type="range"
                      id="temperature"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                      className="w-full mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="maxTokens">Max Response Length</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={formData.max_tokens}
                      onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                      min="50"
                      max="1000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canGoNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateAssistant}
              disabled={!canGoNext() || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Assistant'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAssistantCreationFlow;