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
import { Loader2, Play, ArrowLeft, ArrowRight, Volume2, PhoneIncoming, PhoneOutgoing, User, MessageSquare, Brain, Upload, Phone, TestTube, Zap, Save, AlertTriangle, Settings, Calendar, PhoneForwarded } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import KnowledgeUpload from './KnowledgeUpload';
import PhoneNumberPurchaseModal from './PhoneNumberPurchaseModal';
import TestAssistantModal from './TestAssistantModal';
import { useAssistants, CreateAssistantData } from '@/hooks/useAssistants';
import { useElevenLabsLibrary } from '@/hooks/useElevenLabsLibrary';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumber } from '@/types/phoneNumber';
interface RefinedAssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (assistantId: string) => void;
}

// System prompt templates organized by industry + assistant type + role
const SYSTEM_PROMPT_TEMPLATES = {
  // Healthcare Industry - Inbound
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
  'healthcare-inbound-receptionist': {
    name: 'Healthcare Virtual Receptionist',
    initial_message: 'Thank you for calling our medical practice. How may I direct your call today?',
    system_prompt: `You are a virtual receptionist for a healthcare facility. Your role is to:
- Greet callers professionally and warmly
- Direct calls to appropriate departments or providers
- Provide basic information about services and hours
- Handle appointment requests and transfers
- Manage emergency situations appropriately

GUIDELINES:
- Always maintain HIPAA compliance
- Never discuss specific patient information
- For emergencies, immediately transfer to emergency services
- Be patient and understanding with concerned patients
- Route calls efficiently to minimize wait times`
  },
  'healthcare-inbound-technical-support': {
    name: 'Healthcare Technical Support',
    initial_message: 'Hello! I\'m here to help with any technical issues you\'re experiencing with our healthcare systems. What can I assist you with?',
    system_prompt: `You are a healthcare technical support specialist. You help with:
- Patient portal access and navigation
- Insurance verification system issues
- Appointment booking system problems
- Medical record access troubleshooting
- General technical guidance

GUIDELINES:
- Maintain patient privacy and HIPAA compliance at all times
- Provide clear, step-by-step technical instructions
- Be patient with users who may not be tech-savvy
- Escalate complex technical issues to IT specialists
- Verify identity before providing account-specific assistance`
  },
  'healthcare-inbound-lead-qualifier': {
    name: 'Healthcare Lead Qualifier',
    initial_message: 'Hello! Thank you for your interest in our healthcare services. I\'d like to learn more about your needs. How can we help you?',
    system_prompt: `You are a healthcare lead qualification specialist. Your role is to:
- Qualify potential patients for services
- Assess healthcare needs and insurance coverage
- Schedule consultations with appropriate providers
- Collect necessary demographic and insurance information
- Route leads to appropriate departments

GUIDELINES:
- Be empathetic and understanding of health concerns
- Maintain HIPAA compliance throughout the conversation
- Ask relevant questions to understand patient needs
- Provide general information about services
- Schedule follow-up appointments when appropriate`
  },
  'healthcare-inbound-order-processor': {
    name: 'Healthcare Order Processor',
    initial_message: 'Hello! I can help you with prescription refills and medical supply orders. What can I assist you with today?',
    system_prompt: `You are a healthcare order processing assistant. You help with:
- Prescription refill requests
- Medical supply orders
- Insurance verification for orders
- Order status and tracking
- Coordinating with pharmacies and suppliers

GUIDELINES:
- Always verify patient identity before processing orders
- Maintain strict HIPAA compliance
- Confirm insurance coverage before processing
- Provide clear information about order status and delivery
- Escalate urgent medication needs appropriately`
  },

  // Retail Industry - Inbound
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
  'retail-inbound-scheduler': {
    name: 'Retail Appointment Scheduler',
    initial_message: 'Hello! I can help you schedule an appointment for personal shopping, consultation, or in-store services. What would you like to book?',
    system_prompt: `You are a retail appointment scheduling assistant. You help customers with:
- Personal shopping appointments
- Product consultation sessions
- In-store service bookings
- Fitting appointments
- Special event reservations

GUIDELINES:
- Be enthusiastic about helping customers
- Ask about specific needs and preferences
- Confirm availability and book appropriate time slots
- Provide clear appointment details and preparation instructions
- Follow up with confirmation details`
  },
  'retail-inbound-receptionist': {
    name: 'Retail Virtual Receptionist',
    initial_message: 'Thank you for calling! How may I direct your call today?',
    system_prompt: `You are a virtual receptionist for a retail business. Your role is to:
- Greet customers warmly and professionally
- Direct calls to appropriate departments
- Provide store hours and location information
- Handle basic product availability questions
- Transfer calls efficiently

GUIDELINES:
- Maintain a friendly, helpful tone
- Know your store departments and their functions
- Provide accurate information about hours and locations
- Route calls quickly to minimize customer wait time
- Handle multiple calls efficiently`
  },
  'retail-inbound-technical-support': {
    name: 'Retail Technical Support',
    initial_message: 'Hi! I\'m here to help with any technical issues with our products or online services. What can I assist you with?',
    system_prompt: `You are a retail technical support specialist. You help customers with:
- Product setup and troubleshooting
- Website and app navigation issues
- Account access problems
- Online ordering technical difficulties
- Product feature explanations

GUIDELINES:
- Be patient and explain things in simple terms
- Provide step-by-step troubleshooting instructions
- Verify solutions work before ending the call
- Know when to escalate to senior technical support
- Document common issues for future reference`
  },
  'retail-inbound-lead-qualifier': {
    name: 'Retail Lead Qualifier',
    initial_message: 'Hello! Thanks for your interest in our products. I\'d love to learn more about what you\'re looking for. How can we help you today?',
    system_prompt: `You are a retail lead qualification specialist. Your role is to:
- Understand customer needs and preferences
- Qualify budget and timeline
- Recommend appropriate products or services
- Schedule consultations with sales specialists
- Collect contact information for follow-up

GUIDELINES:
- Ask open-ended questions to understand needs
- Listen actively to customer responses
- Provide helpful product information
- Be consultative rather than pushy
- Focus on finding the right solution for the customer`
  },
  'retail-inbound-order-processor': {
    name: 'Retail Order Processor',
    initial_message: 'Hi! I can help you place an order, check order status, or handle any order-related questions. What can I assist you with?',
    system_prompt: `You are a retail order processing assistant. You help customers with:
- Placing new orders over the phone
- Checking order status and tracking
- Modifying existing orders
- Processing returns and exchanges
- Handling payment and shipping questions

GUIDELINES:
- Be thorough when taking order details
- Confirm all information before processing
- Provide clear order confirmations and tracking info
- Handle payment information securely
- Process returns and exchanges efficiently`
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
  },
  'finance-inbound-scheduler': {
    name: 'Financial Services Scheduler',
    initial_message: 'Hello! I can help you schedule an appointment with one of our financial advisors or specialists. What type of consultation are you interested in?',
    system_prompt: `You are a financial services appointment scheduler. You help clients with:
- Scheduling consultations with financial advisors
- Booking loan application appointments
- Setting up insurance consultations
- Arranging investment planning sessions
- Coordinating with appropriate specialists

GUIDELINES:
- Understand the purpose of the appointment to match with right advisor
- Verify client identity before scheduling sensitive meetings
- Provide clear appointment details and preparation requirements
- Maintain confidentiality of client financial information
- Follow up with confirmation and any required documentation`
  },
  'finance-inbound-receptionist': {
    name: 'Financial Services Receptionist',
    initial_message: 'Thank you for calling our financial services office. How may I direct your call today?',
    system_prompt: `You are a virtual receptionist for a financial services firm. Your role is to:
- Greet clients professionally and securely
- Direct calls to appropriate advisors or departments
- Provide general information about services
- Handle appointment scheduling requests
- Maintain client confidentiality

GUIDELINES:
- Always verify caller identity for sensitive matters
- Maintain professional, trustworthy demeanor
- Know your firm\'s services and team structure
- Protect client privacy and confidential information
- Route calls efficiently to appropriate specialists`
  },
  'finance-inbound-technical-support': {
    name: 'Financial Technical Support',
    initial_message: 'Hello! I\'m here to help with any technical issues with our online banking or financial platforms. How can I assist you?',
    system_prompt: `You are a financial technical support specialist. You help clients with:
- Online banking platform issues
- Mobile app troubleshooting
- Account access and password resets
- Transaction processing problems
- Security settings and two-factor authentication

GUIDELINES:
- Always verify client identity before providing account-specific help
- Maintain the highest security standards
- Provide clear, step-by-step technical instructions
- Be aware of potential fraud or security threats
- Escalate security concerns immediately to specialists`
  },
  'finance-inbound-lead-qualifier': {
    name: 'Financial Services Lead Qualifier',
    initial_message: 'Hello! Thank you for your interest in our financial services. I\'d like to learn more about your financial goals. How can we help you?',
    system_prompt: `You are a financial services lead qualifier. Your role is to:
- Understand client financial goals and needs
- Assess current financial situation (general level)
- Qualify for appropriate financial products
- Schedule consultations with financial advisors
- Collect necessary information for follow-up

GUIDELINES:
- Be professional and trustworthy
- Ask appropriate questions about financial goals
- Maintain confidentiality of all financial information
- Focus on understanding needs rather than selling
- Schedule appropriate follow-up meetings with specialists`
  },
  'finance-inbound-order-processor': {
    name: 'Financial Services Order Processor',
    initial_message: 'Hello! I can help you process financial transactions, account openings, or service requests. What can I assist you with today?',
    system_prompt: `You are a financial services order processor. You help clients with:
- Processing account opening requests
- Handling transaction orders
- Managing service requests
- Processing loan applications
- Coordinating account changes

GUIDELINES:
- Always verify client identity before processing any orders
- Follow strict security and compliance protocols
- Provide clear confirmation of all processed orders
- Maintain accurate records of all transactions
- Escalate complex orders to appropriate specialists`
  },

  // Technology Industry - Inbound
  'technology-inbound-customer-support': {
    name: 'Technology Customer Support',
    initial_message: 'Hi! Thanks for calling technical support. I\'m here to help resolve any issues you\'re experiencing. What can I assist you with today?',
    system_prompt: `You are a technology customer support specialist. You help customers with:
- Software troubleshooting and bug reports
- Account access and login issues
- Feature explanations and how-to guidance
- Billing and subscription questions
- General product support

GUIDELINES:
- Be patient and explain technical concepts in simple terms
- Ask clarifying questions to understand the issue
- Provide step-by-step troubleshooting instructions
- Verify solutions work before ending the call
- Know when to escalate to senior technical staff`
  },
  'technology-inbound-scheduler': {
    name: 'Technology Services Scheduler',
    initial_message: 'Hello! I can help you schedule a technical consultation, demo, or support session. What type of appointment would you like to book?',
    system_prompt: `You are a technology services scheduler. You help customers with:
- Scheduling product demonstrations
- Booking technical consultations
- Setting up training sessions
- Arranging installation appointments
- Coordinating with technical specialists

GUIDELINES:
- Understand the technical requirements for the appointment
- Match customers with appropriate technical specialists
- Provide clear meeting details and preparation requirements
- Confirm technical setup requirements beforehand
- Schedule appropriate duration based on complexity`
  },
  'technology-inbound-receptionist': {
    name: 'Technology Virtual Receptionist',
    initial_message: 'Thank you for calling our technology company. How may I direct your call today?',
    system_prompt: `You are a virtual receptionist for a technology company. Your role is to:
- Greet callers professionally
- Direct calls to appropriate technical departments
- Provide general company and service information
- Handle initial support request routing
- Manage call flow efficiently

GUIDELINES:
- Understand your company\'s technical departments and services
- Route technical issues to appropriate specialists
- Provide accurate information about business hours and services
- Handle multiple calls efficiently
- Maintain professional, helpful demeanor`
  },
  'technology-inbound-technical-support': {
    name: 'Advanced Technical Support',
    initial_message: 'Hi! I\'m here to help you troubleshoot any technical issues you\'re experiencing. Could you tell me what problem you\'re having?',
    system_prompt: `You are an advanced technical support specialist. You help customers with:
- Complex software troubleshooting and bug reports
- Hardware compatibility and setup issues
- Advanced feature configuration
- Integration and API support
- Performance optimization

APPROACH:
- Ask detailed, specific questions to diagnose issues
- Provide comprehensive troubleshooting instructions
- Be patient and explain technical concepts clearly
- Document complex issues for development team
- Know when to escalate to engineering specialists`
  },
  'technology-inbound-lead-qualifier': {
    name: 'Technology Lead Qualifier',
    initial_message: 'Hello! Thanks for your interest in our technology solutions. I\'d like to understand your technical needs. How can we help you?',
    system_prompt: `You are a technology lead qualifier. Your role is to:
- Understand technical requirements and challenges
- Assess current technology stack and needs
- Qualify budget and implementation timeline
- Match prospects with appropriate solutions
- Schedule technical consultations

GUIDELINES:
- Ask detailed questions about technical requirements
- Understand current technology challenges
- Assess technical complexity and resources needed
- Provide relevant solution information
- Schedule appropriate technical demonstrations`
  },
  'technology-inbound-order-processor': {
    name: 'Technology Order Processor',
    initial_message: 'Hi! I can help you process orders for our technology products and services. What would you like to order today?',
    system_prompt: `You are a technology order processor. You help customers with:
- Processing software license orders
- Managing hardware equipment orders
- Setting up service subscriptions
- Handling upgrade and renewal orders
- Coordinating delivery and implementation

GUIDELINES:
- Understand technical specifications and requirements
- Confirm compatibility with customer systems
- Provide accurate pricing and delivery information
- Process orders accurately and efficiently
- Coordinate with technical teams for implementation`
  },

  // Outbound Templates
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
const INDUSTRIES = [{
  id: 'healthcare',
  label: 'Healthcare & Medical',
  emoji: '⚕️',
  description: 'Hospitals, clinics, medical practices'
}, {
  id: 'retail',
  label: 'Retail & E-commerce',
  emoji: '🛍️',
  description: 'Online stores, retail chains, boutiques'
}, {
  id: 'finance',
  label: 'Finance & Banking',
  emoji: '🏦',
  description: 'Banks, credit unions, financial services'
}, {
  id: 'real-estate',
  label: 'Real Estate',
  emoji: '🏠',
  description: 'Property sales, rentals, management'
}, {
  id: 'technology',
  label: 'Technology & Software',
  emoji: '💻',
  description: 'SaaS, tech support, IT services'
}, {
  id: 'education',
  label: 'Education & Training',
  emoji: '🎓',
  description: 'Schools, universities, online courses'
}, {
  id: 'legal',
  label: 'Legal Services',
  emoji: '⚖️',
  description: 'Law firms, legal consultations'
}, {
  id: 'automotive',
  label: 'Automotive',
  emoji: '🚗',
  description: 'Car dealers, auto services, parts'
}, {
  id: 'hospitality',
  label: 'Hospitality & Travel',
  emoji: '✈️',
  description: 'Hotels, restaurants, travel agencies'
}, {
  id: 'professional',
  label: 'Professional Services',
  emoji: '💼',
  description: 'Consulting, agencies, business services'
}];
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

const getLanguageDisplay = (code: string, name: string) => {
  const flagMap: Record<string, string> = {
    'en': '🇺🇸',
    'es': '🇪🇸', 
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'it': '🇮🇹',
    'pt': '🇵🇹',
    'pl': '🇵🇱',
    'tr': '🇹🇷',
    'ru': '🇷🇺',
    'nl': '🇳🇱',
    'cs': '🇨🇿',
    'ar': '🇸🇦',
    'zh': '🇨🇳',
    'ja': '🇯🇵',
    'hi': '🇮🇳',
    'ko': '🇰🇷',
    'sv': '🇸🇪',
    'da': '🇩🇰',
    'no': '🇳🇴',
    'fi': '🇫🇮',
  };
  const flag = flagMap[code] || '🌍';
  return `${flag} ${name}`;
};
const RefinedAssistantCreationFlow: React.FC<RefinedAssistantCreationFlowProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Industry
    industry: '',
    // Step 2: Assistant Type
    assistantType: '',
    // 'inbound' or 'outbound'

    // Step 3: Voice & Language
    voice_id: 'aria',
    voice_name: 'Aria (Female)',
    language: 'en',
    language_name: 'English',
    // Step 4: Role & Purpose
    role: '',
    // Step 5: Actions & Integrations
    actions: {
      realTimeBooking: {
        enabled: false,
        calendarType: 'google',
        availableHours: '9:00 AM - 5:00 PM',
        timeZone: 'UTC-5',
        bufferTime: 15, // minutes
      },
      callTransfer: {
        enabled: false,
        conditions: '',
        transferNumber: '',
        maxWaitTime: 30, // seconds
      },
      smsAutomation: {
        enabled: false,
        bookingConfirmation: true,
        reminders: true,
        followUp: false,
        customTemplates: [] as Array<{
          trigger: string;
          message: string;
        }>
      }
    },
    // Step 6: Assistant Details
    name: '',
    initial_message: 'Hello! How can I help you today?',
    system_prompt: 'You are a helpful AI assistant. Be friendly, professional, and concise in your responses. Always aim to be helpful and provide accurate information.',
    temperature: 0.7,
    max_tokens: 300,
    // Step 7: Knowledge Base (optional)
    knowledge: [] as Array<{
      id: string;
      name: string;
      type: 'document' | 'url' | 'text';
      content?: string;
    }>,
    // Step 8: Phone Number
    phoneNumber: null,
    hasPhoneNumber: false

    // Step 9: Testing & Deployment
    // (handled in final step)
  });
  // Initialize ElevenLabs library
  const elevenLabsHook = useElevenLabsLibrary();
  const voices = elevenLabsHook.voices;
  const languages = elevenLabsHook.languages;
  const libraryLoading = elevenLabsHook.loading;
  const testVoice = elevenLabsHook.testVoice;
  const {
    createAssistant
  } = useAssistants();
  const {
    toast
  } = useToast();
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
      toast({
        title: "Error",
        description: "Failed to test voice",
        variant: "destructive"
      });
    } finally {
      setIsTestingVoice(false);
    }
  };
  const handleCreateAssistant = async () => {
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
    
    // Create the assistant (now works with local storage)
    const newAssistant = await createAssistant(assistantData);
    
    if (newAssistant) {
      setCurrentAssistantId(newAssistant.id);
    } else {
      // Fallback for any issues
      const demoAssistantId = `demo-${Date.now()}`;
      setCurrentAssistantId(demoAssistantId);
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
          customTemplates: []
        }
      },
      name: '',
      initial_message: '',
      system_prompt: '',
      temperature: 0.7,
      max_tokens: 300,
      knowledge: [],
      phoneNumber: null,
      hasPhoneNumber: false
    });
    setCurrentAssistantId(null);
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
    setFormData({
      ...formData,
      industry
    });
    // Auto-advance to next step
    setTimeout(() => setStep(2), 300);
  };
  const handleAssistantTypeSelect = (assistantType: string) => {
    setFormData({
      ...formData,
      assistantType,
      role: ''
    }); // Reset role when changing type
    setTimeout(() => setStep(3), 300);
  };
  const handleRoleSelect = (role: string) => {
    // Auto-populate system prompt based on template
    const templateKey = `${formData.industry}-${formData.assistantType}-${role}`;
    console.log('Template key:', templateKey);
    const template = SYSTEM_PROMPT_TEMPLATES[templateKey as keyof typeof SYSTEM_PROMPT_TEMPLATES];
    console.log('Found template:', template);
    
    const updatedFormData = {
      ...formData,
      role,
      ...(template && {
        initial_message: template.initial_message,
        system_prompt: template.system_prompt,
        name: template.name
      })
    };
    
    console.log('Updated form data:', updatedFormData);
    setFormData(updatedFormData);
    setTimeout(() => setStep(5), 300); // Go to actions step next
  };
  const handlePhoneNumberPurchase = (phoneNumber: PhoneNumber) => {
    setFormData({
      ...formData,
      phoneNumber: phoneNumber.number,
      hasPhoneNumber: true
    });
    setIsPurchaseModalOpen(false);
    
    toast({
      title: "Phone Number Connected!",
      description: `${phoneNumber.number} is now connected to your assistant.`,
      duration: 5000,
    });
  };

  const canGoNext = () => {
    switch (step) {
      case 1:
        return formData.industry;
      case 2:
        return formData.assistantType;
      case 3:
        return formData.voice_id && formData.language;
      case 4:
        return formData.role;
      case 5:
        return true; // Actions are optional
      case 6:
        return formData.name && formData.initial_message && formData.system_prompt; // Allow creation if form is valid
      case 7:
        return true;
      // Knowledge base is optional
      case 8:
        return true;
      // Phone number can be skipped
      case 9:
        return true;
      default:
        return false;
    }
  };
  if (libraryLoading) {
    return <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading voice library...</span>
          </div>
        </DialogContent>
      </Dialog>;
  }
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Assistant</DialogTitle>
          <div className="flex items-center justify-between">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={handlePrevious} className="h-8 w-8 p-0">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>


        <div className="space-y-6">
          {/* Step 1: Industry Selection */}
          {step === 1 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What industry is your business in?
                </CardTitle>
                <p className="text-muted-foreground">Select the industry that best describes your business</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INDUSTRIES.map(industry => <div key={industry.id} onClick={() => handleIndustrySelect(industry.id)} className={`p-4 border rounded-lg cursor-pointer transition-all text-center hover:shadow-md ${formData.industry === industry.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <div className="text-3xl mb-2">{industry.emoji}</div>
                      <div className="font-medium mb-1">{industry.label}</div>
                      <div className="text-xs text-muted-foreground">{industry.description}</div>
                    </div>)}
                </div>
              </CardContent>
            </Card>}

          {/* Step 2: Assistant Type Selection */}
          {step === 2 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  What type of assistant do you need?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div onClick={() => handleAssistantTypeSelect('inbound')} className={`p-8 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${formData.assistantType === 'inbound' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/30 hover:bg-muted/50'}`}>
                    <div className="text-center space-y-4">
                      <PhoneIncoming className="w-16 h-16 mx-auto text-primary" />
                      <h3 className="text-xl font-semibold">Incoming Calls</h3>
                      <p className="text-muted-foreground">
                        Handles customer calls to your business
                      </p>
                    </div>
                  </div>

                  <div onClick={() => handleAssistantTypeSelect('outbound')} className={`p-8 rounded-xl cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${formData.assistantType === 'outbound' ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/30 hover:bg-muted/50'}`}>
                    <div className="text-center space-y-4">
                      <PhoneOutgoing className="w-16 h-16 mx-auto text-primary" />
                      <h3 className="text-xl font-semibold">Outgoing Calls</h3>
                      <p className="text-muted-foreground">
                        Makes calls to prospects and customers
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Step 3: Voice & Language Selection */}
          {step === 3 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice & Language Settings
                </CardTitle>
                <p className="text-muted-foreground">Choose how your assistant will sound</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language" className="text-base font-medium">Language</Label>
                  <Select value={formData.language} onValueChange={value => {
                const selectedLang = languages[value];
                setFormData({
                  ...formData,
                  language: value,
                  language_name: selectedLang?.name || 'English'
                });
              }}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select language">
                        {getLanguageDisplay(formData.language, formData.language_name) || "Select language"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(languages).length > 0 ? Object.entries(languages).map(([code, lang]) => <SelectItem key={code} value={code}>
                            {getLanguageDisplay(code, lang.name)}
                          </SelectItem>) : <SelectItem value="en">🇺🇸 English (Loading...)</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium">Select Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(voices).map(([id, voice]) => <div key={id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.voice_id === id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => setFormData({
                  ...formData,
                  voice_id: id,
                  voice_name: `${voice.name} (${voice.gender})`
                })}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{voice.name}</p>
                            <p className="text-sm text-muted-foreground">{voice.description}</p>
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {voice.gender}
                            </Badge>
                          </div>
                          {formData.voice_id === id && <Button size="sm" variant="outline" onClick={e => {
                      e.stopPropagation();
                      handleTestVoice();
                    }} disabled={isTestingVoice}>
                              {isTestingVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                            </Button>}
                        </div>
                      </div>)}
                  </div>
                </div>

              </CardContent>
            </Card>}

          {/* Step 4: Role & Purpose Selection */}
          {step === 4 && <Card>
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
                  {getRolesByType(formData.assistantType, formData.industry).map(role => <div key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.role === role.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{role.emoji}</div>
                        <div className="font-medium mb-1">{role.label}</div>
                        <div className="text-sm text-muted-foreground">{role.description}</div>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>}

          {/* Step 5: Actions & Integrations */}
          {step === 5 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Actions & Integrations
                </CardTitle>
                <p className="text-muted-foreground">Configure what your assistant can do to help your business</p>
              </CardHeader>
              <CardContent className="space-y-8">
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
                      checked={formData.actions.realTimeBooking.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions,
                          realTimeBooking: {
                            ...formData.actions.realTimeBooking,
                            enabled: checked
                          }
                        }
                      })}
                    />
                  </div>

                  {formData.actions.realTimeBooking.enabled && (
                    <div className="space-y-4 pl-9">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Calendar Type</Label>
                          <Select 
                            value={formData.actions.realTimeBooking.calendarType}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                realTimeBooking: {
                                  ...formData.actions.realTimeBooking,
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
                            value={formData.actions.realTimeBooking.availableHours}
                            onChange={(e) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                realTimeBooking: {
                                  ...formData.actions.realTimeBooking,
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
                            value={formData.actions.realTimeBooking.timeZone}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                realTimeBooking: {
                                  ...formData.actions.realTimeBooking,
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
                            value={formData.actions.realTimeBooking.bufferTime}
                            onChange={(e) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                realTimeBooking: {
                                  ...formData.actions.realTimeBooking,
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
                      checked={formData.actions.callTransfer.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions,
                          callTransfer: {
                            ...formData.actions.callTransfer,
                            enabled: checked
                          }
                        }
                      })}
                    />
                  </div>

                  {formData.actions.callTransfer.enabled && (
                    <div className="space-y-4 pl-9">
                      <div>
                        <Label className="text-sm font-medium">Transfer Conditions</Label>
                        <Textarea 
                          value={formData.actions.callTransfer.conditions}
                          onChange={(e) => setFormData({
                            ...formData,
                            actions: {
                              ...formData.actions,
                              callTransfer: {
                                ...formData.actions.callTransfer,
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
                            value={formData.actions.callTransfer.transferNumber}
                            onChange={(e) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                callTransfer: {
                                  ...formData.actions.callTransfer,
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
                            value={formData.actions.callTransfer.maxWaitTime}
                            onChange={(e) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                callTransfer: {
                                  ...formData.actions.callTransfer,
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
                      checked={formData.actions.smsAutomation.enabled}
                      onCheckedChange={(checked) => setFormData({
                        ...formData,
                        actions: {
                          ...formData.actions,
                          smsAutomation: {
                            ...formData.actions.smsAutomation,
                            enabled: checked
                          }
                        }
                      })}
                    />
                  </div>

                  {formData.actions.smsAutomation.enabled && (
                    <div className="space-y-4 pl-9">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Booking Confirmation</Label>
                            <p className="text-xs text-muted-foreground">Send SMS when booking is confirmed</p>
                          </div>
                          <Switch 
                            checked={formData.actions.smsAutomation.bookingConfirmation}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                smsAutomation: {
                                  ...formData.actions.smsAutomation,
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
                            checked={formData.actions.smsAutomation.reminders}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                smsAutomation: {
                                  ...formData.actions.smsAutomation,
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
                            checked={formData.actions.smsAutomation.followUp}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                smsAutomation: {
                                  ...formData.actions.smsAutomation,
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800 mb-1">Actions Configuration</div>
                      <div className="text-blue-700">
                        These actions will be available to your assistant during calls. Each action can be configured with specific conditions and will integrate with your existing business systems.
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Step 6: Assistant Details & Behavior Configuration */}
          {step === 6 && <Card>
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
                  <Input id="assistantName" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} placeholder="e.g., Customer Support Assistant" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="initialMessage" className="text-base font-medium">Initial Message</Label>
                  <p className="text-sm text-muted-foreground mb-2">What your assistant says when the call begins</p>
                  <Textarea id="initialMessage" value={formData.initial_message} onChange={e => setFormData({
                ...formData,
                initial_message: e.target.value
              })} placeholder="Hello! How can I help you today?" rows={3} className="resize-none" />
                </div>

                <div>
                  <Label htmlFor="systemPrompt" className="text-base font-medium">System Prompt</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Define how your assistant should behave, what it can help with, and any guidelines it should follow
                  </p>
                  <Textarea id="systemPrompt" value={formData.system_prompt} onChange={e => setFormData({
                ...formData,
                system_prompt: e.target.value
              })} placeholder="You are a helpful customer support assistant..." rows={8} className="resize-none" />
                </div>

              </CardContent>
            </Card>}

          {/* Step 7: Knowledge Base Upload (Optional) */}
          {step === 7 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Add Knowledge Base
                </CardTitle>
                <p className="text-muted-foreground">
                  Upload files or add text content to enhance your assistant's knowledge
                </p>
              </CardHeader>
              <CardContent>
                <KnowledgeUpload 
                  assistantId={currentAssistantId!}
                  onKnowledgeAdded={(knowledge) => {
                    console.log('Knowledge added:', knowledge);
                  }}
                />
              </CardContent>
            </Card>}

          {/* Step 8: Phone Number Assignment */}
          {step === 8 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number Assignment
                </CardTitle>
                <p className="text-muted-foreground">Your assistant needs a phone number to function</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {!formData.hasPhoneNumber ? <>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <div className="font-medium mb-2">No phone number assigned</div>
                      <div className="text-sm text-muted-foreground mb-4">
                        Purchase a phone number to enable calling functionality
                      </div>
                      <Button onClick={() => setIsPurchaseModalOpen(true)}>
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
                  </> : <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                    <Phone className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <div className="font-medium text-green-800 mb-2">Phone number connected!</div>
                    <div className="text-sm text-green-700">
                      {formData.phoneNumber && `Your assistant is connected to ${formData.phoneNumber}`}
                    </div>
                  </div>}
              </CardContent>
            </Card>}

          {/* Step 9: Testing & Deployment */}
          {step === 9 && <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Testing & Deployment
                </CardTitle>
                <p className="text-muted-foreground">Review your assistant's capabilities and deploy when ready</p>
              </CardHeader>
              <CardContent className="space-y-8">

                {/* Assistant Capabilities Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="font-semibold text-lg mb-4 text-blue-900">
                    🤖 Your Assistant: "{formData.name}"
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Industry:</span>
                        <span className="ml-2 text-blue-700">{formData.industry}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Type:</span>
                        <span className="ml-2 text-blue-700 capitalize">{formData.assistantType} calls</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Voice:</span>
                        <span className="ml-2 text-blue-700">{formData.voice_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Language:</span>
                        <span className="ml-2 text-blue-700">{formData.language_name}</span>
                      </div>
                    </div>

                    {/* Actions & Capabilities */}
                    <div className="mt-6">
                      <h5 className="font-semibold text-blue-900 mb-3">🚀 Actions & Capabilities:</h5>
                      
                      {/* Check if any actions are enabled */}
                      {!formData.actions.realTimeBooking.enabled && 
                       !formData.actions.callTransfer.enabled && 
                       !formData.actions.smsAutomation.enabled ? (
                        <div className="text-sm text-blue-600 bg-blue-100 rounded-lg p-4">
                          📝 Basic conversation handling - Your assistant will engage in natural conversations based on your system prompt and knowledge base.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Real-Time Booking */}
                          {formData.actions.realTimeBooking.enabled && (
                            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <Calendar className="w-5 h-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-green-800">📅 Real-Time Booking</div>
                                <div className="text-sm text-green-700 mt-1">
                                  • Calendar: {formData.actions.realTimeBooking.calendarType}
                                  <br />
                                  • Available: {formData.actions.realTimeBooking.availableHours} ({formData.actions.realTimeBooking.timeZone})
                                  <br />
                                  • Buffer time: {formData.actions.realTimeBooking.bufferTime} minutes between appointments
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Call Transfer */}
                          {formData.actions.callTransfer.enabled && (
                            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                              <PhoneForwarded className="w-5 h-5 text-orange-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-orange-800">📞 Call Transfer</div>
                                <div className="text-sm text-orange-700 mt-1">
                                  • Transfer to: {formData.actions.callTransfer.transferNumber || "Not specified"}
                                  <br />
                                  • Max wait: {formData.actions.callTransfer.maxWaitTime} seconds
                                  <br />
                                  • Conditions: {formData.actions.callTransfer.conditions || "Custom conditions set"}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SMS Automation */}
                          {formData.actions.smsAutomation.enabled && (
                            <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <MessageSquare className="w-5 h-5 text-purple-600 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-purple-800">💬 SMS Automation</div>
                                <div className="text-sm text-purple-700 mt-1">
                                  {formData.actions.smsAutomation.bookingConfirmation && "• Booking confirmation messages"}
                                  {formData.actions.smsAutomation.bookingConfirmation && <br />}
                                  {formData.actions.smsAutomation.reminders && "• Appointment reminder messages"}
                                  {formData.actions.smsAutomation.reminders && <br />}
                                  {formData.actions.smsAutomation.followUp && "• Follow-up messages after calls"}
                                  {(!formData.actions.smsAutomation.bookingConfirmation && 
                                    !formData.actions.smsAutomation.reminders && 
                                    !formData.actions.smsAutomation.followUp) && "• Custom SMS templates configured"}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Basic Conversation */}
                          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Brain className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <div className="font-medium text-blue-800">🧠 Intelligent Conversation</div>
                              <div className="text-sm text-blue-700 mt-1">
                                • Natural language processing and responses
                                <br />
                                • Knowledge base integration {formData.knowledge.length > 0 ? `(${formData.knowledge.length} sources)` : "(no additional sources)"}
                                <br />
                                • Role-specific conversation handling
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Phone Number Info */}
                    {formData.hasPhoneNumber && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                          📱 <strong>Phone Number:</strong> {formData.phoneNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Testing Card */}
                <div className="max-w-md mx-auto">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                    <div className="relative bg-background border rounded-xl p-8 text-center space-y-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full flex items-center justify-center">
                        <TestTube className="w-10 h-10 text-blue-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-lg">Start Test Call</h4>
                        <p className="text-sm text-muted-foreground">
                          {formData.assistantType === 'inbound' 
                            ? 'Call the assigned number to test your assistant' 
                            : 'Enter your number for the assistant to call you'}
                        </p>
                      </div>
                      
                      <Button 
                        size="lg"
                        className="w-full relative overflow-hidden group bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                        onClick={() => setIsTestModalOpen(true)}
                      >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        <TestTube className="h-5 w-5 mr-2" />
                        Start Test
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center">
                  <Button variant="outline" onClick={onClose} className="px-8">
                    <Save className="h-4 w-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </CardContent>
            </Card>}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end pt-6">
          {step === 5 && (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {(step === 3 || step === 7) && (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === totalSteps && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                <h4 className="font-semibold text-green-900 mb-3">
                  🎉 Your Assistant is Ready for Deployment!
                </h4>
                <div className="text-sm text-green-800 space-y-2">
                  <div className="font-medium">"{formData.name}" will be able to:</div>
                  <div className="space-y-1 text-left max-w-md mx-auto">
                    {formData.actions.realTimeBooking.enabled && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>Schedule appointments in real-time via {formData.actions.realTimeBooking.calendarType}</span>
                      </div>
                    )}
                    {formData.actions.callTransfer.enabled && (
                      <div className="flex items-center gap-2">
                        <PhoneForwarded className="w-4 h-4 text-green-600" />
                        <span>Transfer calls to human agents when needed</span>
                      </div>
                    )}
                    {formData.actions.smsAutomation.enabled && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span>Send automated SMS for confirmations and reminders</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-green-600" />
                      <span>Handle {formData.assistantType} calls with intelligent conversation</span>
                    </div>
                    {formData.hasPhoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-green-600" />
                        <span>Operate on phone number: {formData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                onClick={async () => {
                  setIsCreating(true);
                  try {
                    await handleCreateAssistant();
                    onComplete?.(currentAssistantId!);
                    // Show success popup
                    setShowSuccessDialog(true);
                  } catch (error) {
                    console.error('Error deploying assistant:', error);
                  } finally {
                    setIsCreating(false);
                  }
                }}
                disabled={isCreating}
                size="lg"
                className="px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating & Deploying...
                  </>
                ) : (
                  <>
                    🚀 Create & Deploy Assistant
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Phone Number Purchase Modal */}
      <PhoneNumberPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseComplete={handlePhoneNumberPurchase}
      />

      {/* Test Assistant Modal */}
      {isTestModalOpen && (
        <TestAssistantModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          assistant={{
            id: currentAssistantId || 'test-assistant',
            user_id: 'demo-user-123',
            name: formData.name || 'Test Assistant',
            type: 'Voice',
            industry: formData.industry,
            use_case: formData.role,
            assistant_type: formData.assistantType as 'inbound' | 'outbound',
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assistant Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <p className="text-muted-foreground">
              Your assistant is now live and ready to handle calls. You can start receiving or making calls immediately.
            </p>
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                onClose();
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>;
};
export default RefinedAssistantCreationFlow;