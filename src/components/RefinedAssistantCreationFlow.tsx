import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Loader2, 
  Play, 
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
  ChevronDown,
  Zap,
  Save,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useElevenLabsLibrary } from '@/hooks/useElevenLabsLibrary';
import { useAssistants, CreateAssistantData } from '@/hooks/useAssistants';
import { useToast } from '@/hooks/use-toast';

interface RefinedAssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (assistantId: string) => void;
}

// System prompt templates organized by industry + assistant type + role
const SYSTEM_PROMPT_TEMPLATES = {
  'healthcare-inbound-customer-support': {
    name: 'Healthcare Customer Support',
    initial_message: 'Hello! Thank you for calling. I\'m here to help you with your healthcare needs. How can I assist you today?',
    system_prompt: `You are a professional healthcare customer support assistant. You help patients with:
- Appointment scheduling and rescheduling
- General inquiries about services
- Insurance and billing questions (basic information only)
- Directing calls to appropriate departments

IMPORTANT GUIDELINES:
- Never provide medical advice or diagnose conditions
- Always maintain patient confidentiality and HIPAA compliance
- Be empathetic and understanding
- For medical emergencies, immediately direct to emergency services
- For complex medical questions, transfer to medical professionals
- Keep responses clear and professional`
  },
  'healthcare-inbound-scheduler': {
    name: 'Healthcare Appointment Scheduler',
    initial_message: 'Hello! I can help you schedule an appointment with our healthcare providers. What type of appointment are you looking for?',
    system_prompt: `You are a healthcare appointment scheduling assistant. Your role is to:
- Schedule new appointments
- Reschedule existing appointments
- Provide available appointment slots
- Collect necessary patient information
- Confirm insurance information

GUIDELINES:
- Always verify patient identity before discussing appointments
- Collect required information: name, DOB, insurance, reason for visit
- Be HIPAA compliant - protect patient privacy
- For urgent medical needs, prioritize scheduling or transfer to triage
- Confirm appointment details clearly before booking`
  },
  'retail-inbound-customer-support': {
    name: 'Retail Customer Support',
    initial_message: 'Hi there! Thanks for calling. I\'m here to help with any questions about your orders, returns, or our products. What can I help you with?',
    system_prompt: `You are a helpful retail customer support assistant. You assist customers with:
- Order status and tracking
- Product information and availability
- Return and exchange policies
- Account management
- Store locations and hours

GUIDELINES:
- Be friendly, patient, and solution-oriented
- Listen actively to customer concerns
- Provide clear, accurate information
- For complex issues, offer to escalate to a specialist
- Always aim to exceed customer expectations
- Keep interactions positive and helpful`
  },
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
  },
  'real-estate-inbound-lead-qualifier': {
    name: 'Real Estate Lead Qualifier',
    initial_message: 'Hello! Thanks for your interest in our real estate services. I\'d love to learn more about what you\'re looking for. Are you buying or selling?',
    system_prompt: `You are a real estate lead qualification assistant. Your role is to:
- Qualify potential buyers and sellers
- Gather property requirements and preferences
- Assess timeline and budget
- Schedule appointments with agents
- Collect contact information for follow-up

QUALIFICATION QUESTIONS:
- Are they buying or selling?
- What\'s their timeline?
- Budget range or current property value
- Preferred neighborhoods or property types
- First-time buyer/seller or experienced?
- Pre-approved for financing (buyers)?

Be friendly, professional, and consultative. Focus on understanding their needs to match them with the right agent.`
  },
  'technology-inbound-technical-support': {
    name: 'Technical Support Specialist',
    initial_message: 'Hi! I\'m here to help you troubleshoot any technical issues you\'re experiencing. Could you tell me what problem you\'re having?',
    system_prompt: `You are a technical support specialist assistant. You help customers with:
- Software troubleshooting and bug reports
- Hardware compatibility and setup issues
- Account access and password resets
- Feature explanations and how-to guidance
- Escalating complex technical issues

APPROACH:
- Ask clear, specific questions to diagnose the issue
- Provide step-by-step troubleshooting instructions
- Be patient and explain technical concepts in simple terms
- Verify solutions work before ending the call
- Document issues for development team when needed
- Know when to escalate to senior technical staff`
  },
  'retail-outbound-sales': {
    name: 'Retail Sales Representative',
    initial_message: 'Hi! I\'m calling from [Company] to share some exciting new products that might interest you. Do you have a quick moment to chat?',
    system_prompt: `You are an outbound sales representative for retail products. Your goals are to:
- Introduce new products and promotions
- Understand customer needs and preferences
- Build rapport and trust
- Present relevant product benefits
- Schedule follow-up calls or in-store visits

SALES APPROACH:
- Be respectful of the customer\'s time
- Listen more than you talk
- Focus on value and benefits, not just features
- Ask open-ended questions to understand needs
- Handle objections professionally
- Always provide value, even if they don\'t buy today
- Respect "no" and maintain positive relationships`
  },
  'finance-outbound-lead-qualifier': {
    name: 'Financial Services Lead Qualifier',
    initial_message: 'Hello! I\'m calling from [Company] regarding financial services that might benefit you. Do you have a moment to discuss your financial goals?',
    system_prompt: `You are a financial services lead qualification specialist making outbound calls. Your role is to:
- Identify potential clients for financial products
- Assess financial needs and goals
- Qualify leads for advisors
- Schedule consultations with financial experts
- Build initial trust and rapport

QUALIFICATION AREAS:
- Investment goals and timeline
- Current financial situation (general)
- Interest in retirement planning, investments, insurance
- Decision-making process and authority
- Timeline for financial decisions

Be professional, trustworthy, and compliant with financial regulations. Never provide specific financial advice - focus on qualification and appointment setting.`
  }
};

const INDUSTRIES = [
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
];

const getRolesByType = (assistantType: string, industry: string) => {
  const inboundRoles = [
    { id: 'customer-support', label: 'Customer Support', description: 'Handle customer inquiries and issues', emoji: '🎧' },
    { id: 'scheduler', label: 'Appointment Scheduler', description: 'Book and manage appointments', emoji: '📅' },
    { id: 'receptionist', label: 'Virtual Receptionist', description: 'Answer calls and direct inquiries', emoji: '📞' },
    { id: 'technical-support', label: 'Technical Support', description: 'Provide technical assistance', emoji: '🔧' },
    { id: 'lead-qualifier', label: 'Lead Qualifier', description: 'Qualify incoming leads', emoji: '🎯' },
    { id: 'order-processor', label: 'Order Processor', description: 'Handle order inquiries and processing', emoji: '📦' }
  ];

  const outboundRoles = [
    { id: 'sales', label: 'Sales Representative', description: 'Engage prospects and drive sales', emoji: '💼' },
    { id: 'lead-qualifier', label: 'Lead Qualifier', description: 'Qualify potential customers', emoji: '🎯' },
    { id: 'appointment-setter', label: 'Appointment Setter', description: 'Schedule meetings with prospects', emoji: '📅' },
    { id: 'survey-conductor', label: 'Survey Conductor', description: 'Conduct market research surveys', emoji: '📊' },
    { id: 'follow-up-specialist', label: 'Follow-up Specialist', description: 'Follow up on leads and customers', emoji: '🔄' }
  ];

  // Filter roles based on industry relevance
  const roleFilter = (role: any) => {
    if (industry === 'healthcare' && role.id === 'technical-support') return false;
    if (industry === 'technology' && role.id === 'scheduler') return assistantType === 'inbound';
    return true;
  };

  return assistantType === 'inbound' 
    ? inboundRoles.filter(roleFilter)
    : outboundRoles.filter(roleFilter);
};

const RefinedAssistantCreationFlow: React.FC<RefinedAssistantCreationFlowProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Industry
    industry: '',
    
    // Step 2: Assistant Type
    assistantType: '', // 'inbound' or 'outbound'
    
    // Step 3: Voice & Language
    voice_id: 'aria',
    voice_name: 'Aria (Female)',
    language: 'en',
    language_name: 'English',
    
    // Step 4: Role & Purpose
    role: '',
    
    // Step 5: Assistant Details
    name: '',
    initial_message: '',
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 300,
    
    // Step 6: Knowledge Base (optional)
    knowledge: [] as Array<{id: string, name: string, type: 'document' | 'url' | 'text', content?: string}>,
    
    // Step 7: Phone Number
    phoneNumber: null,
    hasPhoneNumber: false,
    
    // Step 8: Testing & Deployment
    // (handled in final step)
  });

  const { voices, languages, loading: libraryLoading, testVoice } = useElevenLabsLibrary();
  const { createAssistant } = useAssistants();
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
      const assistantData: CreateAssistantData = {
        name: formData.name,
        type: 'Voice',
        industry: formData.industry,
        use_case: formData.role,
        assistant_type: formData.assistantType as 'inbound' | 'outbound',
        voice_id: formData.voice_id,
        voice_name: formData.voice_name,
        language: formData.language,
        language_name: formData.language_name,
        system_prompt: formData.system_prompt,
        initial_message: formData.initial_message,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens
      };

      console.log('Creating assistant with data:', assistantData);

      const newAssistant = await createAssistant(assistantData);
      if (newAssistant) {
        toast({
          title: "Assistant Created!",
          description: `${formData.name} has been created successfully.`,
        });
        onComplete?.(newAssistant.id);
        onClose();
        resetForm();
      }
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast({
        title: "Error",
        description: "Failed to create assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      industry: '',
      assistantType: '',
      voice_id: 'aria',
      voice_name: 'Aria (Female)',
      language: 'en',
      language_name: 'English',
      role: '',
      name: '',
      initial_message: '',
      system_prompt: '',
      temperature: 0.7,
      max_tokens: 300,
      knowledge: [],
      phoneNumber: null,
      hasPhoneNumber: false,
    });
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleIndustrySelect = (industry: string) => {
    setFormData({ ...formData, industry });
    // Auto-advance to next step
    setTimeout(() => setStep(2), 300);
  };

  const handleAssistantTypeSelect = (assistantType: string) => {
    setFormData({ ...formData, assistantType, role: '' }); // Reset role when changing type
    setTimeout(() => setStep(3), 300);
  };

  const handleRoleSelect = (role: string) => {
    // Auto-populate system prompt based on template
    const templateKey = `${formData.industry}-${formData.assistantType}-${role}`;
    const template = SYSTEM_PROMPT_TEMPLATES[templateKey as keyof typeof SYSTEM_PROMPT_TEMPLATES];
    
    const updatedFormData = { 
      ...formData, 
      role,
      ...(template && {
        initial_message: template.initial_message,
        system_prompt: template.system_prompt,
        name: template.name
      })
    };
    
    setFormData(updatedFormData);
    setTimeout(() => setStep(5), 300); // Skip voice step for now, will implement later
  };

  const canGoNext = () => {
    switch (step) {
      case 1: return formData.industry;
      case 2: return formData.assistantType;
      case 3: return formData.voice_id && formData.language;
      case 4: return formData.role;
      case 5: return formData.name && formData.initial_message && formData.system_prompt;
      case 6: return true; // Knowledge base is optional
      case 7: return true; // Phone number can be skipped
      case 8: return true;
      default: return false;
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="assistant-creation-description">
        <DialogHeader>
          <DialogTitle>Create New Assistant - Step {step} of {totalSteps}</DialogTitle>
          <p id="assistant-creation-description" className="text-sm text-muted-foreground">
            Follow the steps to create your AI assistant
          </p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
            <div key={stepNum} className="flex-1 flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
              {stepNum < totalSteps && (
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
          {/* Step 1: Industry Selection */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What industry is your business in?
                </CardTitle>
                <p className="text-muted-foreground">Select the industry that best describes your business</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INDUSTRIES.map((industry) => (
                    <div
                      key={industry.id}
                      onClick={() => handleIndustrySelect(industry.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all text-center hover:shadow-md ${
                        formData.industry === industry.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{industry.emoji}</div>
                      <div className="font-medium mb-1">{industry.label}</div>
                      <div className="text-xs text-muted-foreground">{industry.description}</div>
                    </div>
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
                  What type of assistant do you need?
                </CardTitle>
                <p className="text-muted-foreground">Choose how your assistant will interact with customers</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => handleAssistantTypeSelect('inbound')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.assistantType === 'inbound'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <PhoneIncoming className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Incoming Call Assistant</h3>
                      <p className="text-muted-foreground mb-4">
                        Handles customer calls to your business
                      </p>
                      <div className="text-sm text-left space-y-1">
                        <div>• Answer customer inquiries</div>
                        <div>• Provide support and information</div>
                        <div>• Schedule appointments</div>
                        <div>• Route calls to the right person</div>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => handleAssistantTypeSelect('outbound')}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.assistantType === 'outbound'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="text-center">
                      <PhoneOutgoing className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">Outgoing Call Assistant</h3>
                      <p className="text-muted-foreground mb-4">
                        Makes calls to prospects and customers
                      </p>
                      <div className="text-sm text-left space-y-1">
                        <div>• Qualify potential leads</div>
                        <div>• Conduct sales outreach</div>
                        <div>• Schedule appointments</div>
                        <div>• Follow up with customers</div>
                      </div>
                    </div>
                  </div>
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
                  Voice & Language Settings
                </CardTitle>
                <p className="text-muted-foreground">Choose how your assistant will sound</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Select Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(voices).map(([id, voice]) => (
                      <div
                        key={id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.voice_id === id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
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
                          <div className="flex-1">
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
                  <Label htmlFor="language" className="text-base font-medium">Language</Label>
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
                    <SelectTrigger className="mt-2">
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
                      Test how your assistant will sound in {formData.language_name}
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

          {/* Step 4: Role & Purpose Selection */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Choose the assistant's role
                </CardTitle>
                <p className="text-muted-foreground">
                  What specific role will your {formData.assistantType} assistant perform?
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getRolesByType(formData.assistantType, formData.industry).map((role) => (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        formData.role === role.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
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
              </CardContent>
            </Card>
          )}

          {/* Step 5: Assistant Details & Behavior Configuration */}
          {step === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Assistant Details & Behavior
                </CardTitle>
                <p className="text-muted-foreground">Configure your assistant's identity and behavior</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="assistantName" className="text-base font-medium">Assistant Name</Label>
                  <Input
                    id="assistantName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Customer Support Assistant"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="initialMessage" className="text-base font-medium">Initial Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">What your assistant says when the call begins</p>
                  <Textarea
                    id="initialMessage"
                    value={formData.initial_message}
                    onChange={(e) => setFormData({ ...formData, initial_message: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="systemPrompt" className="text-base font-medium">System Prompt</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define how your assistant should behave, what it can help with, and any guidelines it should follow
                  </p>
                  <Textarea
                    id="systemPrompt"
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    placeholder="You are a helpful customer support assistant..."
                    rows={8}
                    className="resize-none"
                  />
                </div>

                <Collapsible open={showAdvancedSettings} onOpenChange={setShowAdvancedSettings}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                      <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedSettings ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
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
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Knowledge Base Upload (Optional) */}
          {step === 6 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Add Knowledge (Optional)
                </CardTitle>
                <p className="text-muted-foreground">Help your assistant answer questions about your business</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <div className="font-medium mb-2">Upload documents</div>
                  <div className="text-sm text-muted-foreground mb-4">
                    PDFs, Word docs, or text files with your business information
                  </div>
                  <Button variant="outline">
                    Choose Files
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div className="font-medium">Add website URLs</div>
                    </div>
                    <Input
                      type="url"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-muted-foreground" />
                      <div className="font-medium">Add text content</div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Create Text Knowledge
                    </Button>
                  </div>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  You can always add knowledge later from the assistant settings
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 7: Phone Number Assignment */}
          {step === 7 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number Assignment
                </CardTitle>
                <p className="text-muted-foreground">Your assistant needs a phone number to function</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!formData.hasPhoneNumber ? (
                  <>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <div className="font-medium mb-2">No phone number assigned</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Purchase a phone number to enable calling functionality
                      </div>
                      <Button>
                        Purchase Phone Number
                      </Button>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-amber-800 mb-1">Warning</div>
                        <div className="text-amber-700">
                          Your assistant won't be able to {formData.assistantType === 'inbound' ? 'receive' : 'make'} calls without a phone number. 
                          You can skip this step and add a phone number later.
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button variant="outline" onClick={handleNext}>
                        Skip for Now
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="font-medium text-green-800 mb-2">Phone number connected!</div>
                    <div className="text-sm text-green-700">
                      {formData.phoneNumber && `Your assistant is connected to ${formData.phoneNumber}`}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 8: Testing & Deployment */}
          {step === 8 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing & Deployment
                </CardTitle>
                <p className="text-muted-foreground">Test your assistant and deploy when ready</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-6 text-center">
                    <TestTube className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <div className="font-medium mb-2">Test Assistant</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {formData.assistantType === 'inbound' 
                        ? 'Call the assigned number to test your assistant'
                        : 'Enter your number for the assistant to call you'
                      }
                    </div>
                    <Button variant="outline" className="w-full">
                      <TestTube className="h-4 w-4 mr-2" />
                      Start Test
                    </Button>
                  </div>

                  <div className="border rounded-lg p-6 text-center">
                    <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="font-medium mb-2">Deploy Assistant</div>
                    <div className="text-sm text-muted-foreground mb-4">
                      Make your assistant live and ready to handle calls
                    </div>
                    <Button className="w-full">
                      <Zap className="h-4 w-4 mr-2" />
                      Deploy Now
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="text-center">
                  <Button variant="outline" onClick={onClose}>
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => step > 1 ? handlePrevious() : onClose()}
            disabled={isCreating}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={handleNext}
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
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Create & Deploy
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RefinedAssistantCreationFlow;