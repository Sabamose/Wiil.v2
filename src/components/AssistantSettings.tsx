import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneNumberSuccessModal from './PhoneNumberSuccessModal';
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
  const [activeTab, setActiveTab] = useState<'Industry' | 'Type' | 'Voice' | 'Role' | 'Actions' | 'Instructions' | 'Knowledge' | 'Phone' | 'EmailSettings'>('Industry');
  const [showPhoneSuccessModal, setShowPhoneSuccessModal] = useState(false);
  const [connectedPhoneNumber, setConnectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [isAssistantConnectedToPhone, setIsAssistantConnectedToPhone] = useState(true);
  
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
    hasPhoneNumber: !!assistant?.phone_number,
    // Email-specific properties
    emailTone: assistant?.emailTone || 'professional',
    responseLength: assistant?.responseLength || 'detailed',
    customInstructions: assistant?.customInstructions || ''
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
      hasPhoneNumber: !!assistant?.phone_number,
      // Email-specific properties
      emailTone: assistant?.emailTone || 'professional',
      responseLength: assistant?.responseLength || 'detailed',
      customInstructions: assistant?.customInstructions || ''
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

  // Check if this is an email assistant
  const isEmailAssistant = assistant?.assistant_type === 'email' || formData.assistantType === 'email';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Assistants</span>
              <span className="text-gray-500">/</span>
              <span className="text-xl font-semibold text-gray-900">
                {isEmailAssistant ? 'Email Assistant Settings' : 'Assistant Settings'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsTestModalOpen(true)}
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <TestTube className="w-4 h-4 mr-2" />
              {isEmailAssistant ? 'Test Email Assistant' : 'Test Assistant'}
            </Button>
            
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 font-medium">
                Unsaved changes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation - Different tabs for email assistants */}
      <div className="border-b border-gray-200 px-8 bg-white">
        <div className="flex space-x-2">
          {(isEmailAssistant ? [
            { id: 'Role', icon: User, label: 'Role' },
            { id: 'Knowledge', icon: FileText, label: 'Knowledge Base' },
            { id: 'Instructions', icon: MessageSquare, label: 'Tone & Instructions' },
            { id: 'EmailSettings', icon: Settings, label: 'Email Settings' }
          ] : [
            { id: 'Industry', icon: User, label: 'Industry' },
            { id: 'Type', icon: PhoneIncoming, label: 'Type' },
            { id: 'Voice', icon: Volume2, label: 'Voice' },
            { id: 'Role', icon: Brain, label: 'Role' },
            { id: 'Actions', icon: Settings2, label: 'Actions' },
            { id: 'Instructions', icon: MessageSquare, label: 'Instructions' },
            { id: 'Knowledge', icon: FileText, label: 'Knowledge' },
            { id: 'Phone', icon: Phone, label: 'Phone' }
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex items-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[hsl(var(--brand-teal))] text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-[hsl(var(--brand-teal))] hover:bg-teal-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Settings Content */}
      <div className="px-8 py-8 max-w-4xl">{isEmailAssistant ? (
        /* Email Assistant Settings */
        <div className="space-y-8 bg-white rounded-lg border border-gray-200 p-6">
          
          {/* Role Selection for Email Assistant */}
          <section className={activeTab === 'Role' ? '' : 'hidden'}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-[hsl(var(--brand-teal))]" />
                Email Assistant Role
              </h2>
              <p className="text-gray-600">Choose the specific role for your email assistant</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'customer-support', label: 'Customer Support', emoji: '📧', description: 'Handle customer inquiries via email' },
                { id: 'sales-support', label: 'Sales Support', emoji: '💼', description: 'Support sales inquiries and follow-ups' },
                { id: 'technical-support', label: 'Technical Support', emoji: '🔧', description: 'Provide technical assistance via email' },
                { id: 'account-management', label: 'Account Management', emoji: '👥', description: 'Manage existing customer accounts' },
                { id: 'lead-nurturing', label: 'Lead Nurturing', emoji: '🌱', description: 'Nurture leads through email campaigns' },
                { id: 'order-management', label: 'Order Management', emoji: '📦', description: 'Handle order-related inquiries' }
              ].map(role => (
                <div
                  key={role.id}
                  onClick={() => setFormData({ ...formData, role: role.id })}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    formData.role === role.id 
                      ? 'border-[hsl(var(--brand-teal))] bg-teal-50' 
                      : 'border-gray-200 hover:border-[hsl(var(--brand-teal))]'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{role.emoji}</div>
                    <div className="font-medium mb-1">{role.label}</div>
                    <div className="text-sm text-gray-600">{role.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Knowledge Base for Email Assistant */}
          <section className={activeTab === 'Knowledge' ? '' : 'hidden'}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[hsl(var(--brand-teal))]" />
                Knowledge Base
              </h2>
              <p className="text-gray-600">Upload documents and information for your email assistant</p>
            </div>
            
            <KnowledgeUpload 
              assistantId={assistant?.id || 'temp-id'}
              onKnowledgeAdded={(knowledge) => {
                console.log('Knowledge added:', knowledge);
              }}
            />
          </section>

          {/* Tone & Instructions for Email Assistant */}
          <section className={activeTab === 'Instructions' ? '' : 'hidden'}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[hsl(var(--brand-teal))]" />
                Tone & Instructions
              </h2>
              <p className="text-gray-600">Configure how your email assistant communicates</p>
            </div>
            
            <div className="space-y-6">
              {/* Email Tone Selection */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Email Tone</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'professional', label: 'Professional', desc: 'Formal and business-focused' },
                    { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' },
                    { value: 'empathetic', label: 'Empathetic', desc: 'Understanding and supportive' }
                  ].map(tone => (
                    <button
                      key={tone.value}
                      onClick={() => setFormData({ ...formData, emailTone: tone.value })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.emailTone === tone.value 
                          ? 'border-[hsl(var(--brand-teal))] bg-teal-50' 
                          : 'border-gray-200 hover:border-[hsl(var(--brand-teal))]'
                      }`}
                    >
                      <div className="font-medium">{tone.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Length */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Response Length</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'concise', label: 'Concise', desc: 'Brief and to the point' },
                    { value: 'detailed', label: 'Detailed', desc: 'Comprehensive responses' },
                    { value: 'adaptive', label: 'Adaptive', desc: 'Matches inquiry complexity' }
                  ].map(length => (
                    <button
                      key={length.value}
                      onClick={() => setFormData({ ...formData, responseLength: length.value })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        formData.responseLength === length.value 
                          ? 'border-[hsl(var(--brand-teal))] bg-teal-50' 
                          : 'border-gray-200 hover:border-[hsl(var(--brand-teal))]'
                      }`}
                    >
                      <div className="font-medium">{length.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{length.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <Label htmlFor="custom-instructions" className="text-sm font-medium text-gray-900">
                  Custom Instructions
                </Label>
                <Textarea
                  id="custom-instructions"
                  value={formData.customInstructions || ''}
                  onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                  placeholder="Add specific instructions for how your email assistant should behave..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </section>

          {/* Email Settings */}
          <section className={activeTab === 'EmailSettings' ? '' : 'hidden'}>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[hsl(var(--brand-teal))]" />
                Email Configuration
              </h2>
              <p className="text-gray-600">Configure email provider and automation settings</p>
            </div>
            
            <div className="space-y-6">
              {/* Email Provider */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Connected Email Provider</Label>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[hsl(var(--brand-teal))] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">Gmail Connected</div>
                        <div className="text-sm text-gray-600">support@wiil.ai</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Change Provider
                    </Button>
                  </div>
                </div>
              </div>

              {/* Auto-reply Settings */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Auto-Reply Settings</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Auto-Reply</div>
                      <div className="text-sm text-gray-600">Automatically send AI-generated responses</div>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Human Review Required</div>
                      <div className="text-sm text-gray-600">Require human approval before sending</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div>
                <Label className="text-sm font-medium text-gray-900 mb-3 block">Response Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select response time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="5min">Within 5 minutes</SelectItem>
                    <SelectItem value="30min">Within 30 minutes</SelectItem>
                    <SelectItem value="1hour">Within 1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

        </div>
      ) : (
        /* Regular Assistant Settings */
        <div className="space-y-12 rounded-xl border border-[hsl(var(--brand-teal))]/20 bg-white shadow-sm p-6">
          
          <section className={activeTab === 'Industry' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-teal mb-2 flex items-center gap-2">
                <User className="h-6 w-6 text-brand-teal" />
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
              <h2 className="text-2xl font-semibold text-brand-teal mb-2">Voice & Language</h2>
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
              <h2 className="text-2xl font-semibold text-brand-teal mb-2">Actions & Integrations</h2>
              <p className="text-gray-600">Configure what your assistant can do to help your business</p>
            </div>
            
            <div className="space-y-8">
              {/* Real-Time Booking */}
               <div className={`rounded-lg p-6 border transition-colors ${formData.actions?.realTimeBooking?.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-start gap-3">
                     <Calendar className={`h-6 w-6 mt-1 ${formData.actions?.realTimeBooking?.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                     <div>
                       <h3 className="font-semibold text-lg">Real-Time Booking</h3>
                       <p className="text-sm text-[hsl(var(--brand-teal))]">Allow customers to book appointments directly through the call</p>
                     </div>
                   </div>
                   <Switch 
                     className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                   <div className="pl-9 mt-2 flex flex-wrap gap-2">
                     <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{({google:'Google Calendar',outlook:'Outlook Calendar',calendly:'Calendly',custom:'Custom'} as Record<string,string>)[formData.actions?.realTimeBooking?.calendarType || 'google']}</span>
                     <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions?.realTimeBooking?.availableHours || '9:00 AM - 5:00 PM'}</span>
                     <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions?.realTimeBooking?.timeZone || 'UTC-5'}</span>
                     <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions?.realTimeBooking?.bufferTime || 15}m buffer</span>
                     <span className="text-xs text-muted-foreground">Defaults in use • You can change these later</span>
                   </div>
                 )}
               </div>

              {/* Call Transfer */}
               <div className={`rounded-lg p-6 border transition-colors ${formData.actions?.callTransfer?.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-start gap-3">
                     <PhoneForwarded className={`h-6 w-6 mt-1 ${formData.actions?.callTransfer?.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                     <div>
                       <h3 className="font-semibold text-lg">Call Transfer</h3>
                       <p className="text-sm text-[hsl(var(--brand-teal))]">Transfer calls to human agents based on specific conditions</p>
                     </div>
                   </div>
                   <Switch 
                     className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                         className="mt-2"
                       />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <Label className="text-sm font-medium">Transfer Number</Label>
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
                           className="mt-2"
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
                           className="mt-2"
                         />
                       </div>
                     </div>
                   </div>
                 )}
               </div>

              {/* SMS Automation */}
               <div className={`rounded-lg p-6 border transition-colors ${formData.actions?.smsAutomation?.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex items-start gap-3">
                     <MessageSquare className={`h-6 w-6 mt-1 ${formData.actions?.smsAutomation?.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                     <div>
                       <h3 className="font-semibold text-lg">SMS Automation</h3>
                       <p className="text-sm text-[hsl(var(--brand-teal))]">Send automated messages for confirmations and follow-ups</p>
                     </div>
                   </div>
                   <Switch 
                     className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                         <Label className="text-sm font-medium">Booking Confirmation</Label>
                         <Switch 
                           className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
                           checked={formData.actions?.smsAutomation?.bookingConfirmation ?? true}
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
                         <Label className="text-sm font-medium">Appointment Reminders</Label>
                         <Switch 
                           className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
                           checked={formData.actions?.smsAutomation?.reminders ?? true}
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
                         <Label className="text-sm font-medium">Follow-up Messages</Label>
                         <Switch 
                           className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
                           checked={formData.actions?.smsAutomation?.followUp ?? false}
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
              <h2 className="text-2xl font-semibold text-brand-teal mb-2 flex items-center justify-center gap-2">
                <Brain className="h-6 w-6 text-brand-teal" />
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

              {/* Audience */}
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-600">Who will your assistant be talking to?</h3>
                  <p className="text-gray-600">Describe your typical callers so your assistant knows how to connect with them</p>
                  <div className="max-w-lg mx-auto">
                    <Input 
                      placeholder="e.g., small business owners, new customers, existing clients" 
                      value={behavior.audience} 
                      onChange={(e) => setBehavior(prev => ({ ...prev, audience: e.target.value }))} 
                      className="text-center text-lg"
                    />
                  </div>
                </div>
              </Card>

              {/* What TO Say */}
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-600">What should your assistant always mention?</h3>
                  
                  {/* Input section */}
                  <div className="max-w-lg mx-auto">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add something your assistant should always mention" 
                        value=""
                        className="text-center"
                      />
                      <Button type="button">Add</Button>
                    </div>
                  </div>
                  
                  {/* Categorized Examples */}
                  <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="font-medium text-sm text-teal-600">💰 Offers & Benefits</div>
                        <div className="space-y-2">
                          {['Free consultation', '30-day money back guarantee', 'We price match competitors', 'Same-day service available'].map(ex => (
                            <Button 
                              key={ex} 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs border-teal-600/30 text-teal-600 hover:bg-teal-600/10" 
                              type="button"
                              onClick={() => {
                                if (behavior.alwaysMention.length < 3 && !behavior.alwaysMention.includes(ex)) {
                                  setBehavior(prev => ({ ...prev, alwaysMention: [...prev.alwaysMention, ex] }))
                                }
                              }}
                              disabled={behavior.alwaysMention.length >= 3 || behavior.alwaysMention.includes(ex)}
                            >
                              + {ex}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="font-medium text-sm text-teal-600">🏆 Credentials & Trust</div>
                        <div className="space-y-2">
                          {['Licensed and insured', '10+ years in business', 'Family owned and operated', '5-star Google rating'].map(ex => (
                            <Button 
                              key={ex} 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs border-teal-600/30 text-teal-600 hover:bg-teal-600/10" 
                              type="button"
                              onClick={() => {
                                if (behavior.alwaysMention.length < 3 && !behavior.alwaysMention.includes(ex)) {
                                  setBehavior(prev => ({ ...prev, alwaysMention: [...prev.alwaysMention, ex] }))
                                }
                              }}
                              disabled={behavior.alwaysMention.length >= 3 || behavior.alwaysMention.includes(ex)}
                            >
                              + {ex}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="font-medium text-sm text-teal-600">📞 Next Steps</div>
                        <div className="space-y-2">
                          {['Ask about your timeline', 'Schedule a site visit', 'Get a custom quote', 'Check our availability'].map(ex => (
                            <Button 
                              key={ex} 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs border-teal-600/30 text-teal-600 hover:bg-teal-600/10" 
                              type="button"
                              onClick={() => {
                                if (behavior.alwaysMention.length < 3 && !behavior.alwaysMention.includes(ex)) {
                                  setBehavior(prev => ({ ...prev, alwaysMention: [...prev.alwaysMention, ex] }))
                                }
                              }}
                              disabled={behavior.alwaysMention.length >= 3 || behavior.alwaysMention.includes(ex)}
                            >
                              + {ex}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected items */}
                  {behavior.alwaysMention.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Your assistant will mention:</div>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {behavior.alwaysMention.map((item, idx) => (
                          <Badge 
                            key={idx} 
                            className="cursor-pointer bg-teal-600/10 text-teal-600 border-teal-600/30 text-sm py-1 px-3" 
                            onClick={() => setBehavior(prev => ({ ...prev, alwaysMention: prev.alwaysMention.filter((_, i) => i !== idx) }))}
                          >
                            ✓ {item} <span className="ml-2 opacity-60">×</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* What NOT to Say */}
              <Card className="p-6">
                <div className="text-center space-y-5">
                  <h3 className="text-xl font-semibold text-teal-600">What should your assistant avoid mentioning?</h3>
                  
                  <div className="max-w-lg mx-auto space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Add topics to avoid (up to 3)" 
                        className="text-center"
                      />
                      <Button type="button">Add</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Pricing details','Internal policies','Personal advice','Competitor info'].map(ex => (
                        <Button 
                          key={ex} 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-red-300 text-red-600 hover:bg-red-50" 
                          type="button"
                          onClick={() => {
                            if (behavior.avoidMentioning.length < 3 && !behavior.avoidMentioning.includes(ex)) {
                              setBehavior(prev => ({ ...prev, avoidMentioning: [...prev.avoidMentioning, ex] }))
                            }
                          }}
                          disabled={behavior.avoidMentioning.length >= 3 || behavior.avoidMentioning.includes(ex)}
                        >
                          + {ex}
                        </Button>
                      ))}
                    </div>
                    
                    {behavior.avoidMentioning.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Will avoid:</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {behavior.avoidMentioning.map((item, idx) => (
                            <Badge 
                              key={idx} 
                              variant="destructive"
                              className="cursor-pointer text-sm py-1 px-3" 
                              onClick={() => setBehavior(prev => ({ ...prev, avoidMentioning: prev.avoidMentioning.filter((_, i) => i !== idx) }))}
                            >
                              ⚠️ {item} <span className="ml-2 opacity-60">×</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Important Questions to Ask */}
              <Card className="p-6">
                <div className="text-center space-y-6">
                  <h3 className="text-xl font-semibold text-teal-600">What questions should your assistant always ask?</h3>
                  <p className="text-gray-600">Teach your assistant the most important questions to gather key information</p>
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g., What's your budget range?, When do you need this completed?" 
                        className="text-center"
                      />
                      <Button type="button">Add</Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {behavior.questionsToAsk.map((item, idx) => (
                        <Badge 
                          key={idx} 
                          className="cursor-pointer bg-blue-100 text-blue-700 border-blue-300 text-sm py-1 px-3" 
                          onClick={() => setBehavior(prev => ({ ...prev, questionsToAsk: prev.questionsToAsk.filter((_, i) => i !== idx) }))}
                        >
                          ❓ {item} <span className="ml-2 opacity-60">×</span>
                        </Badge>
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
              <h2 className="text-2xl font-semibold text-brand-teal mb-2 flex items-center gap-2">
                <Phone className="h-6 w-6 text-brand-teal" />
                Phone Number Connection
              </h2>
              
            </div>
            
            <div className="space-y-6">
              {formData.hasPhoneNumber ? (
                <Card className="max-w-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-teal-600" />
                      </div>
                      Connected Phone Number
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Phone Number Display */}
                    <div className="flex items-center justify-between p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <Phone className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-teal-800">{formData.phoneNumber}</p>
                          <p className="text-sm text-teal-600">
                            {isAssistantConnectedToPhone 
                              ? "Connected • Ready to receive calls"
                              : "Available • Not connected to assistant"
                            }
                          </p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        isAssistantConnectedToPhone 
                          ? "bg-teal-500 animate-pulse" 
                          : "bg-gray-400"
                      }`}></div>
                    </div>


                    {/* Management Actions */}
                    <div className="border-t pt-6">
                      <p className="text-sm font-medium text-gray-900 mb-4">Phone Number Management</p>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => setIsTestModalOpen(true)}
                          variant="outline"
                          size="sm"
                        >
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </Button>
                        <Button
                          onClick={async () => {
                            if (isAssistantConnectedToPhone) {
                              // Disconnect assistant from phone number
                              try {
                                await updateAssistant(assistant.id, {
                                  phone_number: null,
                                });
                                
                                setIsAssistantConnectedToPhone(false);
                                
                                toast({
                                  title: "Assistant Disconnected",
                                  description: "Assistant has been disconnected from the phone number. The number is still available.",
                                });
                              } catch (error) {
                                console.error('Error disconnecting assistant:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to disconnect assistant. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            } else {
                              // Reconnect assistant to phone number
                              try {
                                await updateAssistant(assistant.id, {
                                  phone_number: formData.phoneNumber,
                                });
                                
                                setIsAssistantConnectedToPhone(true);
                                
                                toast({
                                  title: "Assistant Connected",
                                  description: "Assistant has been connected to the phone number.",
                                });
                              } catch (error) {
                                console.error('Error connecting assistant:', error);
                                toast({
                                  title: "Error",
                                  description: "Failed to connect assistant. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className={isAssistantConnectedToPhone 
                            ? "text-red-600 border-red-200 hover:bg-red-50"
                            : "text-teal-600 border-teal-200 hover:bg-teal-50"
                          }
                        >
                          {isAssistantConnectedToPhone ? (
                            <>
                              <AlertTriangle className="w-4 h-4 mr-2" />
                              Disconnect Number
                            </>
                          ) : (
                            <>
                              <Phone className="w-4 h-4 mr-2" />
                              Connect Assistant to Phone Number
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                  </CardContent>
                </Card>
              ) : (
                <Card className="max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-gray-600" />
                      </div>
                      No Phone Number Connected
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">
                        Connect a phone number to deploy your {formData.assistantType} assistant
                      </p>
                      <Button
                        onClick={() => setIsPurchaseModalOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Connect Phone Number
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          <section className={activeTab === 'Knowledge' ? '' : 'hidden'}>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-brand-teal mb-2">Knowledge Base</h2>
              <p className="text-gray-600">Connect knowledge sources to help your assistant answer questions about your business.</p>
            </div>
            
            <KnowledgeUpload
              assistantId={assistant.id}
              onKnowledgeAdded={(knowledge) => setFormData({ ...formData, knowledge })}
            />
          </section>

        </div>
      )}
      </div>

      {/* Modals */}
      {isPurchaseModalOpen && (
        <PhoneNumberPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setActiveTab('Phone'); // Navigate back to phone settings page
          }}
          assistantType={formData.assistantType as 'inbound' | 'outbound'}
          assistantName={formData.name}
          onPurchaseComplete={(phoneNumber: PhoneNumber) => {
            setFormData({
              ...formData,
              phoneNumber: phoneNumber.number,
              hasPhoneNumber: true
            });
            setIsPurchaseModalOpen(false);
            setConnectedPhoneNumber(phoneNumber);
            setShowPhoneSuccessModal(true);
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

      {/* Phone Number Success Modal */}
      {showPhoneSuccessModal && connectedPhoneNumber && (
        <PhoneNumberSuccessModal
          isOpen={showPhoneSuccessModal}
          onClose={() => setShowPhoneSuccessModal(false)}
          phoneNumber={connectedPhoneNumber}
          assistantType={formData.assistantType as 'inbound' | 'outbound'}
          assistantName={formData.name}
          onTestAssistant={() => {
            setIsTestModalOpen(true);
            setShowPhoneSuccessModal(false);
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
              className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg px-6 py-3"
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
