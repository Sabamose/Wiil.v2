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
            <Button
              onClick={handleSaveAssistant}
              disabled={isSaving}
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(getProgressPercentage())}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="px-8 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Industry Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What industry is your business in?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'healthcare', label: 'Healthcare & Medical' },
                    { id: 'retail', label: 'Retail & E-commerce' },
                    { id: 'finance', label: 'Finance & Banking' },
                    { id: 'real-estate', label: 'Real Estate' },
                    { id: 'education', label: 'Education & Training' },
                    { id: 'hospitality', label: 'Hospitality & Travel' },
                    { id: 'automotive', label: 'Automotive' },
                    { id: 'professional', label: 'Professional Services' },
                    { id: 'technology', label: 'Technology & Software' },
                    { id: 'government', label: 'Government & Public' },
                    { id: 'food', label: 'Food & Beverage' },
                    { id: 'other', label: 'Other' }
                  ].map((industry) => (
                    <button
                      key={industry.id}
                      onClick={() => setFormData({ ...formData, industry: industry.id })}
                      className={`p-4 text-left border rounded-lg transition-all hover:border-gray-400 ${
                        formData.industry === industry.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200'
                      }`}
                    >
                      {industry.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Assistant Type Selection */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  What type of calls will your assistant handle?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <button
                    onClick={() => setFormData({ ...formData, assistantType: 'inbound' })}
                    className={`w-full p-6 text-left border rounded-lg transition-all hover:border-gray-400 ${
                      formData.assistantType === 'inbound'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <PhoneIncoming className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold">Inbound Calls</h3>
                    </div>
                    <p className="text-gray-600">
                      Customers call your business. Perfect for customer support, bookings, and inquiries.
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setFormData({ ...formData, assistantType: 'outbound' })}
                    className={`w-full p-6 text-left border rounded-lg transition-all hover:border-gray-400 ${
                      formData.assistantType === 'outbound'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <PhoneOutgoing className="h-6 w-6 text-green-600" />
                      <h3 className="font-semibold">Outbound Calls</h3>
                    </div>
                    <p className="text-gray-600">
                      Your assistant calls customers. Great for sales, follow-ups, and notifications.
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Voice & Language Selection */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Choose Voice & Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Language Selection */}
                <div>
                  <Label className="text-base font-medium">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => {
                    const selectedLang = Object.values(languages).find(lang => lang.code === value);
                    setFormData({
                      ...formData,
                      language: value,
                      language_name: selectedLang?.name || value
                    });
                  }}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(languages).map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {getCountryFlag(lang.code.toUpperCase())} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Voice Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Voice</Label>
                    {formData.voice_id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestVoice}
                        disabled={isTestingVoice}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isTestingVoice ? 'Testing...' : 'Test Voice'}
                      </Button>
                    )}
                  </div>
                  <Select value={formData.voice_id} onValueChange={(value) => {
                    const selectedVoice = Object.values(voices).find(voice => voice.id === value);
                    setFormData({
                      ...formData,
                      voice_id: value,
                      voice_name: selectedVoice?.name || value
                    });
                  }}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Role & Purpose Selection */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What will your assistant help with?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'customer-support', label: 'Customer Support' },
                    { id: 'scheduling', label: 'Scheduling & Booking' },
                    { id: 'sales', label: 'Sales & Lead Generation' },
                    { id: 'information', label: 'Information & FAQ' },
                    { id: 'billing', label: 'Billing & Payments' },
                    { id: 'technical', label: 'Technical Support' },
                    { id: 'consultation', label: 'Consultation Booking' },
                    { id: 'other', label: 'Other' }
                  ].map((role) => (
                    <button
                      key={role.id}
                      onClick={() => setFormData({ ...formData, role: role.id })}
                      className={`p-4 text-left border rounded-lg transition-all hover:border-gray-400 ${
                        formData.role === role.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Assistant Details & Behavior Configuration */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Configure Assistant Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Assistant Name */}
                <div>
                  <Label htmlFor="assistant-name">Assistant Name</Label>
                  <Input
                    id="assistant-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="My Assistant"
                    className="mt-1"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <Label>Quick Templates</Label>
                  <p className="text-sm text-gray-600 mb-3">Apply a pre-built template for your industry and use case</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(SYSTEM_PROMPT_TEMPLATES)
                      .filter(([key]) => key.includes(formData.industry) && key.includes(formData.assistantType))
                      .map(([key, template]) => (
                        <button
                          key={key}
                          onClick={() => handleApplyTemplate(key)}
                          className="p-3 text-left border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
                        >
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {template.initial_message.substring(0, 100)}...
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Initial Message */}
                <div>
                  <Label htmlFor="initial-message">First Message</Label>
                  <p className="text-sm text-gray-600 mb-2">What your assistant says when answering the call</p>
                  <Textarea
                    id="initial-message"
                    value={formData.initial_message}
                    onChange={(e) => setFormData({ ...formData, initial_message: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {/* System Prompt */}
                <div>
                  <Label htmlFor="system-prompt">System Instructions</Label>
                  <p className="text-sm text-gray-600 mb-2">Define your assistant's personality, role, and capabilities</p>
                  <Textarea
                    id="system-prompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="You are a helpful customer service assistant..."
                    rows={6}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Knowledge Base Upload (Optional) */}
          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Knowledge Base (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KnowledgeUpload
                  assistantId={assistant.id}
                  onKnowledgeAdded={(knowledge) => setFormData({ ...formData, knowledge })}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 7: Phone Number Assignment */}
          {step === 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.assistantType === 'inbound' && (
                  <div>
                    <p className="text-gray-600 mb-4">
                      For inbound calls, you need a phone number that customers can call.
                    </p>
                    
                    {formData.hasPhoneNumber ? (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800">Phone Number Connected</p>
                            <p className="text-green-700">{formData.phoneNumber}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button
                          onClick={() => setIsPurchaseModalOpen(true)}
                          className="w-full"
                          size="lg"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Get Phone Number
                        </Button>
                        <p className="text-sm text-gray-500 text-center">
                          Phone numbers start from $1/month
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {formData.assistantType === 'outbound' && (
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <PhoneOutgoing className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Outbound Setup Ready</p>
                        <p className="text-blue-700">You can make calls using your existing numbers or get a new one for professional outbound calling.</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 8: Testing & Summary */}
          {step === 8 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Test & Deploy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Assistant Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{formData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{formData.assistantType === 'inbound' ? 'Incoming Calls' : 'Outgoing Calls'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Voice:</span>
                      <span className="font-medium">{formData.voice_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{formData.language_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsTestModalOpen(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Assistant
                  </Button>
                  <Button
                    onClick={handleSaveAssistant}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === totalSteps || !canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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
