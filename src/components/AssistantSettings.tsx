import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  ArrowRight, 
  Volume2, 
  PhoneIncoming, 
  PhoneOutgoing, 
  User, 
  MessageSquare, 
  Brain, 
  Upload, 
  Phone, 
  TestTube, 
  Save,
  Play,
  MoreHorizontal,
  Copy,
  Globe,
  FileText,
  Plus,
  Settings2,
  AlertTriangle
} from 'lucide-react';
import KnowledgeUpload from './KnowledgeUpload';
import PhoneNumberPurchaseModal from './PhoneNumberPurchaseModal';
import TestAssistantModal from './TestAssistantModal';
import { useAssistants } from '@/hooks/useAssistants';
import { useElevenLabsLibrary } from '@/hooks/useElevenLabsLibrary';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumber } from '@/types/phoneNumber';

interface AssistantSettingsProps {
  assistant: any; // This will come from the stored assistant data
  onBack: () => void;
}

// System prompt templates organized by industry + assistant type + role
const SYSTEM_PROMPT_TEMPLATES = {
  // Healthcare Industry - Inbound
  'healthcare-inbound-customer-support': {
    name: 'Healthcare Customer Support',
    initial_message: 'Thank you for calling our medical practice. I\'m here to help with your appointment scheduling, medical inquiries, and general support. How may I assist you today?',
    system_prompt: `You are a professional healthcare customer support assistant. You help with:
- Appointment scheduling and rescheduling
- General medical inquiries and information
- Insurance verification and billing questions
- Prescription refill requests
- Medical record requests
- Directing urgent matters to appropriate medical staff

IMPORTANT GUIDELINES:
- Never provide specific medical advice or diagnoses
- Always maintain patient confidentiality and HIPAA compliance
- For medical emergencies, immediately direct callers to emergency services
- Be empathetic, professional, and reassuring
- Verify patient identity before discussing any medical information
- For complex medical questions, schedule appointments with healthcare providers`
  },
  'healthcare-inbound-scheduler': {
    name: 'Healthcare Appointment Scheduler',
    initial_message: 'Hello! I can help you schedule or manage your medical appointments. What type of appointment would you like to book today?',
    system_prompt: `You are a medical appointment scheduling assistant. You help patients with:
- Scheduling new appointments with doctors and specialists
- Rescheduling or canceling existing appointments
- Providing available time slots based on provider schedules
- Collecting necessary patient information and insurance details
- Confirming appointment details and requirements
- Sending appointment reminders and preparation instructions

GUIDELINES:
- Always verify patient identity and insurance information
- Understand the urgency and type of medical concern to schedule appropriately
- Provide clear instructions for appointment preparation
- Maintain strict confidentiality of all patient information
- For urgent medical needs, prioritize scheduling or direct to appropriate care`
  },

  // Retail Industry
  'retail-inbound-customer-support': {
    name: 'Retail Customer Support',
    initial_message: 'Hi there! Thanks for calling. I\'m here to help with your orders, returns, product questions, and any other shopping needs. How can I assist you today?',
    system_prompt: `You are a friendly retail customer support assistant. You help customers with:
- Order status, tracking, and delivery information
- Product information, availability, and recommendations
- Returns, exchanges, and refund processing
- Account management and loyalty program questions
- Store locations, hours, and services
- General shopping assistance and troubleshooting

GUIDELINES:
- Be enthusiastic, helpful, and solution-oriented
- Always try to resolve issues on the first call
- Offer alternatives when products are unavailable
- Promote relevant products and services when appropriate
- Handle complaints with empathy and professionalism
- Escalate complex issues to human representatives when needed`
  },

  // Finance Industry - Inbound
  'finance-inbound-customer-support': {
    name: 'Financial Services Support',
    initial_message: 'Thank you for calling. I\'m here to help with your account questions and banking needs. For your security, I\'ll need to verify your identity first.',
    system_prompt: `You are a professional financial services customer support assistant. You help with:
- Account balance and transaction inquiries
- General banking information
- Card services and security
- Basic loan and mortgage information
- Directing complex financial questions to specialists

SECURITY REQUIREMENTS:
- Always verify customer identity before discussing account details
- Never provide sensitive financial information without proper verification
- Be aware of fraud prevention protocols
- For suspicious activity, escalate immediately
- Maintain strict confidentiality and compliance with financial regulations
- Be professional, trustworthy, and security-conscious`
  }
};

// Country phone codes for flag display
const getCountryFlag = (code: string) => {
  const flagMap: { [key: string]: string } = {
    'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'AU': '🇦🇺', 'DE': '🇩🇪', 'FR': '🇫🇷', 'ES': '🇪🇸', 'IT': '🇮🇹',
    'NL': '🇳🇱', 'BE': '🇧🇪', 'CH': '🇨🇭', 'AT': '🇦🇹', 'SE': '🇸🇪', 'NO': '🇳🇴', 'DK': '🇩🇰', 'FI': '🇫🇮',
    'PL': '🇵🇱', 'CZ': '🇨🇿', 'HU': '🇭🇺', 'PT': '🇵🇹', 'GR': '🇬🇷', 'IE': '🇮🇪', 'BR': '🇧🇷', 'MX': '🇲🇽',
    'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪', 'JP': '🇯🇵', 'KR': '🇰🇷', 'CN': '🇨🇳', 'IN': '🇮🇳',
    'SG': '🇸🇬', 'HK': '🇭🇰', 'TH': '🇹🇭', 'MY': '🇲🇾', 'ID': '🇮🇩', 'PH': '🇵🇭', 'VN': '🇻🇳', 'ZA': '🇿🇦'
  };
  return flagMap[code] || '🌍';
};

const AssistantSettings: React.FC<AssistantSettingsProps> = ({ assistant, onBack }) => {
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  // Initialize form data with existing assistant data
  const [formData, setFormData] = useState({
    // Step 1: Industry
    industry: assistant.industry || '',
    // Step 2: Assistant Type  
    assistantType: assistant.assistant_type || 'inbound',
    // Step 3: Voice & Language
    voice_id: assistant.voice_id || 'aria',
    voice_name: assistant.voice_name || 'Aria (Female)',
    language: assistant.language || 'en',
    language_name: assistant.language_name || 'English',
    // Step 4: Role & Purpose
    role: assistant.use_case || '',
    // Step 5: Assistant Details
    name: assistant.name || '',
    initial_message: assistant.initial_message || 'Hello! How can I help you today?',
    system_prompt: assistant.system_prompt || 'You are a helpful AI assistant.',
    temperature: assistant.temperature || 0.7,
    max_tokens: assistant.max_tokens || 300,
    // Step 6: Knowledge Base
    knowledge: assistant.knowledge || [],
    // Step 7: Phone Number
    phoneNumber: assistant.phone_number || null,
    hasPhoneNumber: !!assistant.phone_number
  });

  // Initialize ElevenLabs library
  const elevenLabsHook = useElevenLabsLibrary();
  const voices = elevenLabsHook.voices;
  const languages = elevenLabsHook.languages;
  const libraryLoading = elevenLabsHook.loading;
  const testVoice = elevenLabsHook.testVoice;

  const { updateAssistant } = useAssistants();
  const { toast } = useToast();

  const totalSteps = 8;

  const handleTestVoice = async () => {
    if (!formData.voice_id) return;
    setIsTestingVoice(true);
    try {
      const audioContent = await testVoice(formData.voice_id, undefined, formData.language);
      if (audioContent) {
        const audio = new Audio(`data:audio/mpeg;base64,${audioContent}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Voice test error:', error);
      toast({
        title: "Voice test failed",
        description: "Could not test the selected voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleSaveAssistant = async () => {
    setIsSaving(true);
    try {
      await updateAssistant(assistant.id, {
        name: formData.name,
        type: 'Voice',
        industry: formData.industry,
        use_case: formData.role,
        assistant_type: formData.assistantType,
        voice_id: formData.voice_id,
        voice_name: formData.voice_name,
        language: formData.language,
        language_name: formData.language_name,
        system_prompt: formData.system_prompt,
        initial_message: formData.initial_message,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
      });
      
      toast({
        title: "Assistant updated",
        description: "Changes saved automatically.",
      });
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast({
        title: "Update failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save when form data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.name && formData.industry) {
        handleSaveAssistant();
      }
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timer);
  }, [formData]);

  const handleApplyTemplate = (templateKey: string) => {
    const template = SYSTEM_PROMPT_TEMPLATES[templateKey as keyof typeof SYSTEM_PROMPT_TEMPLATES];
    if (template) {
      setFormData(prev => ({
        ...prev,
        initial_message: template.initial_message,
        system_prompt: template.system_prompt
      }));
      toast({
        title: "Template applied",
        description: `Applied ${template.name} template to your assistant.`,
      });
    }
  };

  const getProgressPercentage = () => {
    return (step / totalSteps) * 100;
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.industry;
      case 2: return formData.assistantType;
      case 3: return formData.voice_id && formData.language;
      case 4: return formData.role;
      case 5: return formData.name && formData.initial_message && formData.system_prompt;
      case 6: return true; // Knowledge base is optional
      case 7: return true; // Phone number setup is optional
      case 8: return true; // Final step
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <span>Assistants</span>
              <span>/</span>
              <span className="text-2xl font-semibold text-black">{assistant.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsTestModalOpen(true)}
              variant="outline"
              size="sm"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Test Assistant
            </Button>
            <div className="text-sm text-gray-500">
              {isSaving ? 'Saving...' : 'Auto-saved'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-8">
        <div className="flex space-x-8">
          {['Agent', 'Voice', 'Role', 'Phone', 'Knowledge', 'Advanced'].map((tab) => (
            <button
              key={tab}
              className="py-4 px-1 border-b-2 border-black text-black font-medium text-sm"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-8 py-8 max-w-4xl">
        <div className="space-y-12">
          
          {/* Agent Settings */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Agent Configuration</h2>
              <p className="text-gray-600">Configure your assistant's basic settings and industry.</p>
            </div>
            
            <div className="space-y-8">
              {/* Industry */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Industry</h3>
                </div>
                <p className="text-gray-600 mb-4">Choose the industry your business operates in.</p>
                <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                  <SelectTrigger className="w-full max-w-md bg-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {[
                      { id: 'healthcare', label: 'Healthcare & Medical' },
                      { id: 'retail', label: 'Retail & E-commerce' },
                      { id: 'finance', label: 'Finance & Banking' },
                      { id: 'real-estate', label: 'Real Estate' },
                      { id: 'education', label: 'Education & Training' },
                      { id: 'hospitality', label: 'Hospitality & Travel' },
                      { id: 'other', label: 'Other' }
                    ].map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assistant Type */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Call Type</h3>
                </div>
                <p className="text-gray-600 mb-4">Choose whether your assistant handles incoming or outgoing calls.</p>
                <Select value={formData.assistantType} onValueChange={(value) => setFormData({ ...formData, assistantType: value })}>
                  <SelectTrigger className="w-full max-w-md bg-white">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="inbound">
                      <div className="flex items-center gap-2">
                        <PhoneIncoming className="w-4 h-4" />
                        Inbound Calls
                      </div>
                    </SelectItem>
                    <SelectItem value="outbound">
                      <div className="flex items-center gap-2">
                        <PhoneOutgoing className="w-4 h-4" />
                        Outbound Calls
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Use Case */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Use Case</h3>
                </div>
                <p className="text-gray-600 mb-4">What will your assistant help with?</p>
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="w-full max-w-md bg-white">
                    <SelectValue placeholder="Select use case" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {[
                      { id: 'customer-support', label: 'Customer Support' },
                      { id: 'scheduling', label: 'Scheduling & Booking' },
                      { id: 'sales', label: 'Sales & Lead Generation' },
                      { id: 'information', label: 'Information & FAQ' },
                      { id: 'other', label: 'Other' }
                    ].map((useCase) => (
                      <SelectItem key={useCase.id} value={useCase.id}>
                        {useCase.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          {/* Voice & Language Settings */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Voice & Language</h2>
              <p className="text-gray-600">Configure how your assistant speaks and communicates.</p>
            </div>
            
            <div className="space-y-8">
              {/* Agent Language */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Agent Language</h3>
                </div>
                <p className="text-gray-600 mb-4">Choose the default language the agent will communicate in.</p>
                <Select value={formData.language} onValueChange={(value) => {
                  const selectedLang = Object.values(languages).find(lang => lang.code === value);
                  setFormData({
                    ...formData,
                    language: value,
                    language_name: selectedLang?.name || value
                  });
                }}>
                  <SelectTrigger className="w-full max-w-md bg-white">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    {Object.values(languages).map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <div className="flex items-center gap-2">
                          {getCountryFlag(lang.code.toUpperCase())}
                          {lang.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Voice Selection */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">Voice</h3>
                </div>
                <p className="text-gray-600 mb-4">Select the voice for your assistant.</p>
                <div className="flex items-center gap-4">
                  <Select value={formData.voice_id} onValueChange={(value) => {
                    const selectedVoice = Object.values(voices).find(voice => voice.id === value);
                    setFormData({
                      ...formData,
                      voice_id: value,
                      voice_name: selectedVoice?.name || value
                    });
                  }}>
                    <SelectTrigger className="w-full max-w-md bg-white">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {Object.values(voices).map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center gap-2">
                            <span>{voice.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {voice.gender || 'Unknown'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestVoice}
                    disabled={isTestingVoice || !formData.voice_id}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isTestingVoice ? 'Testing...' : 'Test Voice'}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* First Message */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">First Message</h2>
              <p className="text-gray-600">The first message the agent will say. If empty, the agent will wait for the user to start the conversation.</p>
            </div>
            
            <div>
              <Textarea
                value={formData.initial_message}
                onChange={(e) => setFormData({ ...formData, initial_message: e.target.value })}
                placeholder="Thanks for calling! How can I help you today?"
                rows={4}
                className="w-full max-w-2xl bg-white"
              />
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Variable
              </Button>
            </div>
          </section>

          {/* System Prompt */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Prompt</h2>
              <p className="text-gray-600">The system prompt is used to determine the persona of the agent and the context of the conversation.</p>
              <button className="text-blue-600 text-sm hover:underline">Learn more</button>
            </div>
            
            <div>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                placeholder="You are a helpful customer service assistant..."
                rows={8}
                className="w-full max-w-2xl bg-white"
              />
            </div>
          </section>

          {/* Phone Number Management */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Phone Number</h2>
              <p className="text-gray-600">Manage phone numbers assigned to this assistant.</p>
            </div>
            
            <div>
              {formData.hasPhoneNumber ? (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4 max-w-md">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Connected</p>
                      <p className="text-green-700">{formData.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  variant="outline"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Get Phone Number
                </Button>
              )}
            </div>
          </section>

          {/* Knowledge Base */}
          <section>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Knowledge Base</h2>
              <p className="text-gray-600">Connect knowledge sources to help your assistant answer questions about your business.</p>
            </div>
            
            <KnowledgeUpload
              assistantId={assistant.id}
              onKnowledgeAdded={(knowledge) => setFormData({ ...formData, knowledge })}
            />
          </section>

        </div>
      </div>

      {/* Modals */}
      {isPurchaseModalOpen && (
        <PhoneNumberPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          onPurchaseComplete={(phoneNumber: PhoneNumber) => {
            setFormData({
              ...formData,
              phoneNumber: phoneNumber.number,
              hasPhoneNumber: true
            });
            setIsPurchaseModalOpen(false);
          }}
        />
      )}

      {isTestModalOpen && (
        <TestAssistantModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          assistant={{
            id: assistant.id,
            user_id: assistant.user_id || 'test-user',
            name: formData.name,
            type: 'Voice',
            industry: formData.industry,
            use_case: formData.role,
            assistant_type: formData.assistantType,
            phone_number: formData.phoneNumber || '+1 (555) 123-4567',
            voice_id: formData.voice_id,
            voice_name: formData.voice_name,
            language: formData.language,
            language_name: formData.language_name,
            system_prompt: formData.system_prompt,
            initial_message: formData.initial_message,
            temperature: formData.temperature,
            max_tokens: formData.max_tokens,
            status: 'testing' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }}
        />
      )}
    </div>
  );
};

export default AssistantSettings;
