import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
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
  AlertTriangle,
  Calendar,
  PhoneForwarded,
  Settings,
  Check
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

// Role selection logic from creation flow
const getRolesByType = (assistantType: string, industry: string) => {
  const inboundRoles = [{
    id: 'customer-support',
    label: 'Customer Support',
    description: 'Handle customer inquiries and issues',
    emoji: '🎧'
  }, {
    id: 'scheduler',
    label: 'Appointment Scheduler',
    description: 'Book and manage appointments',
    emoji: '📅'
  }, {
    id: 'receptionist',
    label: 'Virtual Receptionist',
    description: 'Answer calls and direct inquiries',
    emoji: '📞'
  }, {
    id: 'technical-support',
    label: 'Technical Support',
    description: 'Provide technical assistance',
    emoji: '🔧'
  }, {
    id: 'lead-qualifier',
    label: 'Lead Qualifier',
    description: 'Qualify incoming leads',
    emoji: '🎯'
  }, {
    id: 'order-processor',
    label: 'Order Processor',
    description: 'Handle order inquiries and processing',
    emoji: '📦'
  }];
  
  const outboundRoles = [{
    id: 'sales',
    label: 'Sales Representative',
    description: 'Engage prospects and drive sales',
    emoji: '💼'
  }, {
    id: 'lead-qualifier',
    label: 'Lead Qualifier',
    description: 'Qualify potential customers',
    emoji: '🎯'
  }, {
    id: 'appointment-setter',
    label: 'Appointment Setter',
    description: 'Schedule meetings with prospects',
    emoji: '📅'
  }, {
    id: 'survey-conductor',
    label: 'Survey Conductor',
    description: 'Conduct market research surveys',
    emoji: '📊'
  }, {
    id: 'follow-up-specialist',
    label: 'Follow-up Specialist',
    description: 'Follow up on leads and customers',
    emoji: '🔄'
  }];

  // Filter roles based on industry relevance
  const roleFilter = (role: any) => {
    if (industry === 'healthcare' && role.id === 'technical-support') return false;
    if (industry === 'technology' && role.id === 'scheduler') return assistantType === 'inbound';
    return true;
  };
  
  return assistantType === 'inbound' ? inboundRoles.filter(roleFilter) : outboundRoles.filter(roleFilter);
};

const AssistantSettings: React.FC<AssistantSettingsProps> = ({ assistant, onBack }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'Industry' | 'Type' | 'Voice' | 'Role' | 'Actions' | 'Instructions' | 'Knowledge' | 'Phone'>('Industry');
  
  // Store original data to track changes
  const [originalData, setOriginalData] = useState<any>({});
  
  // Behavior state for interactive Instructions
  const [behavior, setBehavior] = useState({
    goal: '',
    audience: '',
    tone: 'Friendly',
    responseLength: 'Medium',
    jargonLevel: 'Simple',
    alwaysMention: [] as string[],
    avoidMentioning: [] as string[],
    questionsToAsk: [] as string[],
    autoCompose: true
  });
  
  // Initialize form data with existing assistant data
  const [formData, setFormData] = useState({
    // Step 1: Industry
    industry: assistant?.industry || '',
    // Step 2: Assistant Type  
    assistantType: assistant?.assistant_type || 'inbound',
    // Step 3: Voice & Language
    voice_id: assistant?.voice_id || 'aria',
    voice_name: assistant?.voice_name || 'Aria (Female)',
    language: assistant?.language || 'en',
    language_name: assistant?.language_name || 'English',
    // Step 4: Role & Purpose
    role: assistant?.use_case || '',
    // Step 5: Actions & Integrations
    actions: {
      realTimeBooking: {
        enabled: false,
        calendarType: 'google',
        availableHours: '9:00 AM - 5:00 PM',
        timeZone: 'UTC-5',
        bufferTime: 15,
      },
      callTransfer: {
        enabled: false,
        conditions: '',
        transferNumber: '',
        maxWaitTime: 30,
      },
      smsAutomation: {
        enabled: false,
        bookingConfirmation: true,
        reminders: true,
        followUp: false,
        customTemplates: [] as Array<{ trigger: string; message: string; }>
      }
    },
    // Step 6: Assistant Details
    name: assistant?.name || '',
    initial_message: assistant?.initial_message || 'Hello! How can I help you today?',
    system_prompt: assistant?.system_prompt || 'You are a helpful AI assistant.',
    temperature: assistant?.temperature || 0.7,
    max_tokens: assistant?.max_tokens || 300,
    // Step 7: Knowledge Base
    knowledge: assistant?.knowledge || [],
    // Step 8: Phone Number
    phoneNumber: assistant?.phone_number || null,
    hasPhoneNumber: !!assistant?.phone_number
  });

  // Initialize original data and track changes
  useEffect(() => {
    const initialData = {
      // Step 1: Industry
      industry: assistant?.industry || '',
      // Step 2: Assistant Type
      assistantType: assistant?.assistant_type || 'inbound',
      // Step 3: Voice & Language
      voice_id: assistant?.voice_id || 'aria',
      voice_name: assistant?.voice_name || 'Aria (Female)',
      language: assistant?.language || 'en',
      language_name: assistant?.language_name || 'English',
      // Step 4: Role & Purpose
      role: assistant?.use_case || '',
      // Step 5: Actions & Integrations
      actions: {
        realTimeBooking: {
          enabled: false,
          calendarType: 'google',
          availableHours: '9:00 AM - 5:00 PM',
          timeZone: 'UTC-5',
          bufferTime: 15,
        },
        callTransfer: {
          enabled: false,
          conditions: '',
          transferNumber: '',
          maxWaitTime: 30,
        },
        smsAutomation: {
          enabled: false,
          bookingConfirmation: true,
          reminders: true,
          followUp: false,
          customTemplates: [] as Array<{ trigger: string; message: string; }>
        }
      },
      // Step 6: Assistant Details
      name: assistant?.name || '',
      initial_message: assistant?.initial_message || 'Hello! How can I help you today?',
      system_prompt: assistant?.system_prompt || 'You are a helpful AI assistant.',
      temperature: assistant?.temperature || 0.7,
      max_tokens: assistant?.max_tokens || 300,
      // Step 7: Knowledge Base
      knowledge: [] as Array<{ id: string; name: string; type: 'document' | 'url' | 'text'; content?: string }>,
      // Step 8: Phone Number
      phoneNumber: assistant?.phone_number || null,
      hasPhoneNumber: !!assistant?.phone_number
    };
    
    setOriginalData(initialData);
    setFormData(initialData);
  }, [assistant]);

  // Track changes
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, originalData]);

  // Auto-generate system prompt based on behavior selections
  useEffect(() => {
    if (behavior.autoCompose && behavior.goal && behavior.tone) {
      const generateSystemPrompt = () => {
        const basePrompt = `You are ${formData.name || 'an AI assistant'}, a ${behavior.tone.toLowerCase()} and helpful voice assistant.`;
        
        let goalSection = '';
        switch (behavior.goal) {
          case 'Book appointment':
            goalSection = `Your primary goal is to help customers schedule appointments. You should:
- Ask for preferred dates and times
- Collect necessary contact information
- Confirm appointment details
- Provide any preparation instructions`;
            break;
          case 'Qualify lead':
            goalSection = `Your primary goal is to qualify potential customers. You should:
- Ask about their specific needs and requirements
- Understand their budget and timeline
- Assess if they're a good fit for our services
- Collect contact information for follow-up`;
            break;
          case 'Support':
            goalSection = `Your primary goal is to provide excellent customer support. You should:
- Listen carefully to customer issues
- Provide helpful solutions and guidance
- Escalate complex problems when necessary
- Ensure customer satisfaction`;
            break;
          case 'Collect info':
            goalSection = `Your primary goal is to gather important customer information. You should:
- Ask relevant questions to understand their needs
- Collect contact details and preferences
- Document important details for follow-up
- Be thorough but respectful of their time`;
            break;
          case 'Route call':
            goalSection = `Your primary goal is to direct callers to the right department. You should:
- Ask about the nature of their inquiry
- Determine the best department or person to help
- Provide clear transfer information
- Ensure smooth handoff when transferring`;
            break;
        }

        let styleSection = '';
        switch (behavior.responseLength) {
          case 'Short':
            styleSection = 'Keep your responses brief and to the point. ';
            break;
          case 'Medium':
            styleSection = 'Provide balanced responses that are informative but not overwhelming. ';
            break;
          case 'Detailed':
            styleSection = 'Give thorough and comprehensive responses with helpful details. ';
            break;
        }

        if (behavior.jargonLevel === 'Simple') {
          styleSection += 'Use simple, easy-to-understand language. Avoid technical jargon.';
        } else {
          styleSection += 'You can use standard business terminology when appropriate.';
        }

        const fullPrompt = `${basePrompt}

${goalSection}

COMMUNICATION STYLE:
${styleSection}

IMPORTANT GUIDELINES:
- Always be ${behavior.tone.toLowerCase()} and professional
- Listen actively to understand customer needs
- Ask clarifying questions when needed
- Confirm important information before proceeding
- Thank customers for their time and patience
- If you cannot help with something, explain what you can do instead`;

        return fullPrompt;
      };

      const initialMessage = () => {
        const greeting = behavior.tone === 'Professional' 
          ? `Thank you for calling. This is ${formData.name || 'your assistant'}.`
          : `Hi! This is ${formData.name || 'your assistant'}.`;
          
        switch (behavior.goal) {
          case 'Book appointment':
            return `${greeting} I'm here to help you schedule an appointment. How can I assist you today?`;
          case 'Qualify lead':
            return `${greeting} I'd love to learn more about your needs and see how we can help. What brings you to us today?`;
          case 'Support':
            return `${greeting} I'm here to help with any questions or issues you might have. What can I assist you with?`;
          case 'Collect info':
            return `${greeting} I'm here to help gather some information for you. How can I get started?`;
          case 'Route call':
            return `${greeting} I'm here to make sure you reach the right person. What can I help you with today?`;
          default:
            return `${greeting} How can I help you today?`;
        }
      };

      setFormData(prev => ({
        ...prev,
        system_prompt: generateSystemPrompt(),
        initial_message: initialMessage()
      }));
    }
  }, [behavior.goal, behavior.tone, behavior.responseLength, behavior.jargonLevel, behavior.autoCompose, formData.name]);

  // Initialize ElevenLabs library
  const elevenLabsHook = useElevenLabsLibrary();
  const voices = elevenLabsHook.voices;
  const languages = elevenLabsHook.languages;
  const libraryLoading = elevenLabsHook.loading;
  const testVoice = elevenLabsHook.testVoice;

  const { updateAssistant } = useAssistants();
  const { toast } = useToast();

  const totalSteps = 9;

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
      
      // Update original data after successful save
      setOriginalData({ ...formData });
      setHasUnsavedChanges(false);
      
      toast({
        title: "Success",
        description: "Assistant settings saved successfully",
      });
    } catch (error) {
      console.error('Error updating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to save assistant settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setFormData({ ...originalData });
    setHasUnsavedChanges(false);
  };


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
      case 5: return true; // Actions are optional
      case 6: return formData.name && formData.initial_message && formData.system_prompt;
      case 7: return true; // Knowledge base is optional
      case 8: return true; // Phone number setup is optional
      case 9: return true; // Final step
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
              <span className="text-2xl font-semibold text-black">Assistant Settings</span>
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
            
            {/* Deploy Button with Phone Number Check */}
            {!formData.hasPhoneNumber ? (
              <Button
                onClick={() => {
                  setIsPurchaseModalOpen(true);
                }}
                variant="default"
                size="sm"
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Phone className="w-4 h-4 mr-2" />
                Connect Phone Number
              </Button>
            ) : (
              <Button
                onClick={handleSaveAssistant}
                disabled={isSaving}
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Deploy Assistant
              </Button>
            )}
            
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 font-medium">
                Unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-8">
        <div className="flex space-x-8">
          {(['Industry', 'Type', 'Voice', 'Role', 'Actions', 'Instructions', 'Knowledge', 'Phone'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 text-sm font-medium ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Phone Number Warning */}
      {!formData.hasPhoneNumber && (
        <div className="mx-8 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <p className="text-amber-800 font-medium">
              Phone Number Required for Deployment
            </p>
          </div>
          <p className="text-amber-700 text-sm mt-1">
            To deploy your assistant and start receiving calls, you need to connect a phone number. 
            You can save your assistant as a draft and connect a phone number later.
          </p>
        </div>
      )}

      {/* Settings Content */}
      <div className="px-8 py-8 max-w-4xl">
        <div className="space-y-12">
          
          <section className={activeTab === 'Industry' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="h-6 w-6 text-teal-600" />
                What industry is your business in?
              </h2>
              <p className="text-gray-600">Select the industry that best describes your business</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: 'healthcare', label: 'Healthcare & Medical', emoji: '⚕️', description: 'Hospitals, clinics, medical practices' },
                { id: 'retail', label: 'Retail & E-commerce', emoji: '🛍️', description: 'Online stores, retail chains, boutiques' },
                { id: 'finance', label: 'Finance & Banking', emoji: '🏦', description: 'Banks, credit unions, financial services' },
                { id: 'real-estate', label: 'Real Estate', emoji: '🏠', description: 'Property sales, rentals, management' },
                { id: 'technology', label: 'Technology & Software', emoji: '💻', description: 'SaaS, tech support, IT services' },
                { id: 'education', label: 'Education & Training', emoji: '🎓', description: 'Schools, universities, online courses' },
                { id: 'legal', label: 'Legal Services', emoji: '⚖️', description: 'Law firms, legal consultations' },
                { id: 'automotive', label: 'Automotive', emoji: '🚗', description: 'Car dealers, auto services, parts' },
                { id: 'hospitality', label: 'Hospitality & Travel', emoji: '✈️', description: 'Hotels, restaurants, travel agencies' },
                { id: 'professional', label: 'Professional Services', emoji: '💼', description: 'Consulting, agencies, business services' }
              ].map(industry => (
                <div
                  key={industry.id}
                  onClick={() => setFormData({ ...formData, industry: industry.id })}
                  className={`p-4 border rounded-lg cursor-pointer transition-all text-center hover:shadow-md ${
                    formData.industry === industry.id 
                      ? 'border-teal-600 bg-teal-600/10' 
                      : 'border-border hover:border-teal-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{industry.emoji}</div>
                  <div className="font-medium mb-1">{industry.label}</div>
                  <div className="text-xs text-muted-foreground">{industry.description}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={activeTab === 'Type' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Phone className="h-6 w-6 text-teal-600" />
                What calls will this assistant handle?
              </h2>
              <p className="text-gray-600">Pick one. You can change this later.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
              <div
                onClick={() => setFormData({ ...formData, assistantType: 'inbound' })}
                className={`relative p-8 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                  formData.assistantType === 'inbound' 
                    ? 'border-teal-600 ring-2 ring-teal-600 bg-teal-600/10' 
                    : 'border-border hover:border-teal-600 bg-muted/30 hover:bg-muted/50'
                }`}
              >
                {formData.assistantType === 'inbound' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="gap-1 bg-teal-600 text-white">
                      <Check className="h-3 w-3" /> Selected
                    </Badge>
                  </div>
                )}
                <div className="text-center space-y-3">
                  <PhoneIncoming className="w-16 h-16 mx-auto text-teal-600" />
                  <h3 className="text-lg font-semibold">
                    Answer incoming calls
                  </h3>
                  <p className="text-sm text-muted-foreground">Customers call your number. The assistant answers.</p>
                </div>
              </div>

              <div
                onClick={() => setFormData({ ...formData, assistantType: 'outbound' })}
                className={`relative p-8 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                  formData.assistantType === 'outbound' 
                    ? 'border-teal-600 ring-2 ring-teal-600 bg-teal-600/10' 
                    : 'border-border hover:border-teal-600 bg-muted/30 hover:bg-muted/50'
                }`}
              >
                {formData.assistantType === 'outbound' && (
                  <div className="absolute top-3 right-3">
                    <Badge className="gap-1 bg-teal-600 text-white">
                      <Check className="h-3 w-3" /> Selected
                    </Badge>
                  </div>
                )}
                <div className="text-center space-y-3">
                  <PhoneOutgoing className="w-16 h-16 mx-auto text-teal-600" />
                  <h3 className="text-lg font-semibold">
                    Make outgoing calls
                  </h3>
                  <p className="text-sm text-muted-foreground">The assistant calls prospects or customers for you.</p>
                </div>
              </div>
            </div>
          </section>

          <section className={activeTab === 'Voice' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Voice & Language</h2>
              <p className="text-gray-600">Configure how your assistant speaks and communicates.</p>
            </div>
            
            <div className="space-y-8">
              {/* Language Selection */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Language</h3>
                <div className="grid grid-cols-4 gap-3">
                  {Object.values(languages).slice(0, 8).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          language: lang.code,
                          language_name: lang.name
                        });
                      }}
                      className={`p-3 text-center border rounded-lg transition-all hover:border-gray-400 ${
                        formData.language === lang.code
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="text-2xl mb-1">{getCountryFlag(lang.code.toUpperCase())}</div>
                      <div className="text-sm font-medium">{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Voice</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestVoice}
                    disabled={isTestingVoice || !formData.voice_id}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isTestingVoice ? 'Testing...' : 'Test Selected Voice'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(voices).slice(0, 6).map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => {
                        setFormData({
                          ...formData,
                          voice_id: voice.id,
                          voice_name: voice.name
                        });
                      }}
                      className={`p-4 text-left border rounded-lg transition-all hover:border-gray-400 ${
                        formData.voice_id === voice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{voice.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {voice.gender || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm">{voice.description || 'Professional voice'}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={activeTab === 'Role' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="h-6 w-6 text-teal-600" />
                Choose the assistant's role
              </h2>
              <p className="text-gray-600">
                What specific role will your {formData.assistantType} assistant perform?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRolesByType(formData.assistantType, formData.industry).map(role => (
                <div
                  key={role.id}
                  onClick={() => setFormData({ ...formData, role: role.id })}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.role === role.id 
                      ? 'border-teal-600 bg-teal-600/10' 
                      : 'border-border hover:border-teal-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{role.emoji}</div>
                    <div className="font-medium mb-1">{role.label}</div>
                    <div className="text-sm text-muted-foreground">{role.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

           <section className={activeTab === 'Actions' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Actions & Integrations</h2>
              <p className="text-gray-600">Configure what your assistant can do to help your business</p>
            </div>
            
            <div className="space-y-8">
              {/* Real-Time Booking */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Real-Time Booking</h3>
                      <p className="text-sm text-muted-foreground">Allow customers to book appointments directly through the call</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.actions?.realTimeBooking?.enabled || false}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: {
                        ...formData.actions,
                        realTimeBooking: {
                          ...formData.actions?.realTimeBooking,
                          enabled: checked
                        }
                      }
                    })}
                  />
                </div>

                {formData.actions?.realTimeBooking?.enabled && (
                  <div className="space-y-4 pl-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Calendar Type</Label>
                        <Select 
                          value={formData.actions?.realTimeBooking?.calendarType || 'google'}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              realTimeBooking: {
                                ...formData.actions?.realTimeBooking,
                                calendarType: value
                              }
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google Calendar</SelectItem>
                            <SelectItem value="outlook">Outlook Calendar</SelectItem>
                            <SelectItem value="calendly">Calendly</SelectItem>
                            <SelectItem value="custom">Custom Integration</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Available Hours</Label>
                        <Input 
                          value={formData.actions?.realTimeBooking?.availableHours || '9:00 AM - 5:00 PM'}
                          onChange={(e) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              realTimeBooking: {
                                ...formData.actions?.realTimeBooking,
                                availableHours: e.target.value
                              }
                            }
                          })}
                          placeholder="e.g., 9:00 AM - 5:00 PM"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Time Zone</Label>
                        <Select 
                          value={formData.actions?.realTimeBooking?.timeZone || 'UTC-5'}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              realTimeBooking: {
                                ...formData.actions?.realTimeBooking,
                                timeZone: value
                              }
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                            <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                            <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                            <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Buffer Time (minutes)</Label>
                        <Input 
                          type="number"
                          value={formData.actions?.realTimeBooking?.bufferTime || 15}
                          onChange={(e) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              realTimeBooking: {
                                ...formData.actions?.realTimeBooking,
                                bufferTime: parseInt(e.target.value) || 15
                              }
                            }
                          })}
                          placeholder="15"
                          min="0"
                          max="120"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Transfer */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <PhoneForwarded className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Call Transfer</h3>
                      <p className="text-sm text-muted-foreground">Transfer calls to human agents based on specific conditions</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.actions?.callTransfer?.enabled || false}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: {
                        ...formData.actions,
                        callTransfer: {
                          ...formData.actions?.callTransfer,
                          enabled: checked
                        }
                      }
                    })}
                  />
                </div>

                {formData.actions?.callTransfer?.enabled && (
                  <div className="space-y-4 pl-9">
                    <div>
                      <Label className="text-sm font-medium">Transfer Conditions</Label>
                      <Textarea 
                        value={formData.actions?.callTransfer?.conditions || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          actions: {
                            ...formData.actions,
                            callTransfer: {
                              ...formData.actions?.callTransfer,
                              conditions: e.target.value
                            }
                          }
                        })}
                        placeholder="e.g., When customer asks for a manager, mentions technical issues, or requests complex information..."
                        rows={3}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Describe when the assistant should transfer the call to a human agent</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Transfer Phone Number</Label>
                        <Input 
                          value={formData.actions?.callTransfer?.transferNumber || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              callTransfer: {
                                ...formData.actions?.callTransfer,
                                transferNumber: e.target.value
                              }
                            }
                          })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Max Wait Time (seconds)</Label>
                        <Input 
                          type="number"
                          value={formData.actions?.callTransfer?.maxWaitTime || 30}
                          onChange={(e) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              callTransfer: {
                                ...formData.actions?.callTransfer,
                                maxWaitTime: parseInt(e.target.value) || 30
                              }
                            }
                          })}
                          placeholder="30"
                          min="10"
                          max="300"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SMS Automation */}
              <div className="border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">SMS Automation</h3>
                      <p className="text-sm text-muted-foreground">Send automated SMS messages for bookings and follow-ups</p>
                    </div>
                  </div>
                  <Switch 
                    checked={formData.actions?.smsAutomation?.enabled || false}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      actions: {
                        ...formData.actions,
                        smsAutomation: {
                          ...formData.actions?.smsAutomation,
                          enabled: checked
                        }
                      }
                    })}
                  />
                </div>

                {formData.actions?.smsAutomation?.enabled && (
                  <div className="space-y-4 pl-9">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Booking Confirmation</Label>
                          <p className="text-xs text-muted-foreground">Send SMS when booking is confirmed</p>
                        </div>
                        <Switch 
                          checked={formData.actions?.smsAutomation?.bookingConfirmation || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              smsAutomation: {
                                ...formData.actions?.smsAutomation,
                                bookingConfirmation: checked
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Appointment Reminders</Label>
                          <p className="text-xs text-muted-foreground">Send reminder SMS before appointments</p>
                        </div>
                        <Switch 
                          checked={formData.actions?.smsAutomation?.reminders || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              smsAutomation: {
                                ...formData.actions?.smsAutomation,
                                reminders: checked
                              }
                            }
                          })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Follow-up Messages</Label>
                          <p className="text-xs text-muted-foreground">Send follow-up SMS after calls or appointments</p>
                        </div>
                        <Switch 
                          checked={formData.actions?.smsAutomation?.followUp || false}
                          onCheckedChange={(checked) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              smsAutomation: {
                                ...formData.actions?.smsAutomation,
                                followUp: checked
                              }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={activeTab === 'Instructions' ? '' : 'hidden'}>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Brain className="h-6 w-6 text-teal-600" />
                Teach Your Assistant How to Talk to Customers
              </h2>
              <p className="text-gray-600">Configure how your assistant should behave and respond to customers.</p>
            </div>
            
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Assistant Name */}
              <Card className="p-6 border-2 border-teal-600/20 bg-teal-600/5">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-teal-600">First, what should we call your assistant?</h3>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })} 
                    placeholder="e.g., Sarah, Alex, Customer Care Assistant" 
                    className="max-w-md mx-auto text-center text-lg"
                  />
                </div>
              </Card>

              {/* Focus/Goal Selection */}
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-600">What should your assistant focus on during calls?</h3>
                  
                  <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                    {[
                      { value: 'Book appointment', icon: '📅', desc: 'Schedule meetings or appointments' },
                      { value: 'Qualify lead', icon: '🎯', desc: 'Assess if caller is a good fit' },
                      { value: 'Support', icon: '🛡️', desc: 'Help with questions and issues' },
                      { value: 'Collect info', icon: '📝', desc: 'Gather customer information' },
                      { value: 'Route call', icon: '📞', desc: 'Direct to right department' }
                    ].map(goal => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setBehavior(prev => ({ ...prev, goal: goal.value }))}
                        className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                          behavior.goal === goal.value 
                            ? 'border-teal-600 bg-teal-600/10 text-teal-600' 
                            : 'border-gray-200 hover:border-teal-600/50'
                        }`}
                      >
                        <div className="text-2xl mb-2">{goal.icon}</div>
                        <div className="font-medium">{goal.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{goal.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Personality & Style */}
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-600">How should your assistant sound on calls?</h3>
                  <p className="text-gray-600">Choose the personality that fits your brand</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    {[
                      { value: 'Friendly', icon: '😊', desc: 'Warm, welcoming, and approachable' },
                      { value: 'Professional', icon: '💼', desc: 'Polite, formal, and business-focused' },
                      { value: 'Empathetic', icon: '❤️', desc: 'Understanding, caring, and supportive' }
                    ].map(tone => (
                      <button
                        key={tone.value}
                        type="button"
                        onClick={() => setBehavior(prev => ({ ...prev, tone: tone.value }))}
                        className={`p-6 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                          behavior.tone === tone.value 
                            ? 'border-teal-600 bg-teal-600/10 text-teal-600' 
                            : 'border-gray-200 hover:border-teal-600/50'
                        }`}
                      >
                        <div className="text-3xl mb-3">{tone.icon}</div>
                        <div className="font-semibold text-lg">{tone.value}</div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Response Length */}
                  <div className="space-y-4 max-w-xl mx-auto mt-8">
                    <p className="font-semibold text-lg">Response Length</p>
                    <div className="flex gap-3 justify-center">
                      {[
                        { value: 'Short', desc: 'Brief' },
                        { value: 'Medium', desc: 'Balanced' },
                        { value: 'Detailed', desc: 'Thorough' }
                      ].map(length => (
                        <button
                          key={length.value}
                          type="button"
                          onClick={() => setBehavior(prev => ({ ...prev, responseLength: length.value }))}
                          className={`px-6 py-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                            behavior.responseLength === length.value 
                              ? 'border-teal-600 bg-teal-600/10 text-teal-600' 
                              : 'border-gray-200 hover:border-teal-600/50'
                          }`}
                        >
                          <div className="font-medium">{length.value}</div>
                          <div className="text-xs text-gray-500">{length.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Language Style */}
                  <div className="space-y-4 max-w-xl mx-auto">
                    <p className="font-semibold text-lg">Language Style</p>
                    <div className="flex gap-3 justify-center">
                      {[
                        { value: 'Simple', desc: 'Easy language' },
                        { value: 'Standard', desc: 'Business terms' }
                      ].map(jargon => (
                        <button
                          key={jargon.value}
                          type="button"
                          onClick={() => setBehavior(prev => ({ ...prev, jargonLevel: jargon.value }))}
                          className={`px-6 py-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                            behavior.jargonLevel === jargon.value 
                              ? 'border-teal-600 bg-teal-600/10 text-teal-600' 
                              : 'border-gray-200 hover:border-teal-600/50'
                          }`}
                        >
                          <div className="font-medium">{jargon.value}</div>
                          <div className="text-xs text-gray-500">{jargon.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Review & Customize */}
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900">Review & Customize</h3>
                    <p className="text-gray-600">Fine-tune your assistant's messages and instructions</p>
                  </div>
                  
                  <div className="flex items-center justify-between max-w-md mx-auto">
                    <Label htmlFor="advanced-editing" className="text-sm font-medium">
                      Advanced prompt editing
                    </Label>
                    <Switch
                      id="advanced-editing"
                      checked={!behavior.autoCompose}
                      onCheckedChange={(checked) => setBehavior(prev => ({ ...prev, autoCompose: !checked }))}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <Label className="text-base font-medium">First Message</Label>
                      <Textarea
                        value={formData.initial_message}
                        onChange={e => setFormData({ ...formData, initial_message: e.target.value })}
                        placeholder="Hello! Thanks for calling. How can I help you today?"
                        className="mt-2 min-h-[100px]"
                        disabled={behavior.autoCompose}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">System Instructions</Label>
                      <Textarea
                        value={formData.system_prompt}
                        onChange={e => setFormData({ ...formData, system_prompt: e.target.value })}
                        placeholder="You are a helpful AI assistant..."
                        className="mt-2 min-h-[300px] font-mono text-sm"
                        disabled={behavior.autoCompose}
                      />
                    </div>
                  </div>
                  
                  {behavior.autoCompose && (
                    <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                      <p className="text-sm text-teal-800 mb-2">
                        Turn off "Advanced prompt editing" to manually customize your assistant's responses.
                        Currently using auto-generated prompts based on your selections above.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </section>

          <section className={activeTab === 'Phone' ? '' : 'hidden'}>
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

          <section className={activeTab === 'Knowledge' ? '' : 'hidden'}>
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
          assistantType={formData.assistantType as 'inbound' | 'outbound'}
          assistantName={formData.name}
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

      {/* Floating Save Changes Button */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleDiscardChanges}
              variant="outline"
              size="sm"
              className="bg-white shadow-lg border-gray-300 hover:bg-gray-50"
            >
              Discard Changes
            </Button>
            <Button
              onClick={handleSaveAssistant}
              disabled={isSaving}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-3"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantSettings;
