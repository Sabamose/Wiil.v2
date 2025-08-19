import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Loader2, Play, ArrowLeft, ArrowRight, Volume2, PhoneIncoming, PhoneOutgoing, User, MessageSquare, Brain, Upload, Phone, TestTube, Zap, Save, AlertTriangle, Settings, Calendar, PhoneForwarded, Check, Lightbulb, CheckCircle, Sparkles, Target, Globe, Copy } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import KnowledgeUpload from './KnowledgeUpload';
import PhoneNumberPurchaseModal from './PhoneNumberPurchaseModal';
import TestAssistantModal from './TestAssistantModal';
import { useAssistants, CreateAssistantData } from '@/hooks/useAssistants';
import { useElevenLabsLibrary } from '@/hooks/useElevenLabsLibrary';
import { useToast } from '@/hooks/use-toast';
import { PhoneNumber } from '@/types/phoneNumber';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  return assistantType === 'inbound' ? inboundRoles.filter(roleFilter) : assistantType === 'website' ? inboundRoles.filter(roleFilter) : outboundRoles.filter(roleFilter);
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
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentAssistantId, setCurrentAssistantId] = useState<string | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [copied, setCopied] = useState(false); // Move useState to top level
  // Inputs for quick list additions in Behavior step
  const [doSayInput, setDoSayInput] = useState('');
  const [dontSayInput, setDontSayInput] = useState('');
  const [mustAskInput, setMustAskInput] = useState('');
  const [handoffWhenInput, setHandoffWhenInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromptEditing, setShowPromptEditing] = useState(false);
  
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
    // Behavior settings (used to auto-compose prompts)
    behavior: {
      goal: '',
      audience: '',
      tone: 'Friendly',
      responseLength: 'Short',
      jargonLevel: 'Simple',
      doSay: [] as string[],
      dontSay: [] as string[],
      mustAsk: [] as string[],
      handoff: { when: [] as string[], to: '', preface: '' },
      autoCompose: true,
    },
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
  // Compose prompt and greeting from Behavior answers
  const composeFromBehavior = (fd = formData) => {
    const b = fd.behavior;
    const goal = b.goal || 'help the caller';
    const audience = b.audience ? ` for ${b.audience}` : '';
    const tone = b.tone ? `Use a ${b.tone.toLowerCase()} tone.` : '';
    const lengthRule = b.responseLength ? `Keep responses ${b.responseLength.toLowerCase()}.` : '';
    const jargonRule = b.jargonLevel ? `Use ${b.jargonLevel.toLowerCase()} language.` : '';
    const industry = fd.industry ? `${fd.industry} ` : '';
    const role = fd.role ? `${fd.role} ` : '';

    const greetingName = fd.name || 'our assistant';
    const initial = `Hi! This is ${greetingName}. I'm here to ${goal}${audience}. How can I help today?`;

    const doSay = b.doSay.length ? `\nApproved phrases & facts:\n- ${b.doSay.join('\n- ')}` : '';
    const dontSay = b.dontSay.length ? `\nForbidden topics/phrasing:\n- ${b.dontSay.join('\n- ')}` : '';
    const mustAsk = b.mustAsk.length ? `\nMust-ask questions every call:\n- ${b.mustAsk.join('\n- ')}` : '';
    const handoff = (b.handoff.when.length || b.handoff.to || b.handoff.preface)
      ? `\nHandoff policy:\n- When: ${b.handoff.when.join(', ')}\n- Transfer to: ${b.handoff.to || 'human agent'}\n- Say before transfer: ${b.handoff.preface || 'Let me connect you to a teammate who can assist further.'}`
      : '';

    const prompt = `You are a ${industry}${role}voice assistant. Primary goal: ${goal}. Audience: ${b.audience || 'callers'}. ${tone} ${lengthRule} ${jargonRule}\n${doSay}${dontSay}${mustAsk}${handoff}\nFollow these rules strictly. Be accurate, polite, and efficient.`;

    return { initial, prompt };
  };

  const updateBehavior = (patch: Partial<typeof formData.behavior>) => {
    setFormData(prev => {
      const next = { ...prev, behavior: { ...prev.behavior, ...patch } } as typeof prev;
      if (next.behavior.autoCompose) {
        const { initial, prompt } = composeFromBehavior(next);
        next.initial_message = initial;
        next.system_prompt = prompt;
      }
      return next;
    });
  };

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
      assistant_type: formData.assistantType as 'inbound' | 'outbound' | 'website',
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
      behavior: {
        goal: '',
        audience: '',
        tone: 'Friendly',
        responseLength: 'Short',
        jargonLevel: 'Simple',
        doSay: [],
        dontSay: [],
        mustAsk: [],
        handoff: { when: [], to: '', preface: '' },
        autoCompose: true,
      },
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
          {step === 1 && <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  What industry is your business in?
                </CardTitle>
                <p className="text-muted-foreground">Select the industry that best describes your business</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {INDUSTRIES.map(industry => <div key={industry.id} onClick={() => handleIndustrySelect(industry.id)} className={`p-4 border rounded-lg cursor-pointer transition-all text-center hover:shadow-md ${formData.industry === industry.id ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]'}`}>
                      <div className="text-3xl mb-2">{industry.emoji}</div>
                      <div className="font-medium mb-1">{industry.label}</div>
                      <div className="text-xs text-muted-foreground">{industry.description}</div>
                    </div>)}
                </div>
              </CardContent>
            </Card>}

          {/* Step 2: Assistant Type Selection */}
          {step === 2 && <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  What type of assistant do you need?
                </CardTitle>
                <p className="text-muted-foreground">Choose the type that best fits your use case.</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    onClick={() => handleAssistantTypeSelect('inbound')}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${formData.assistantType === 'inbound' ? 'border-[hsl(var(--brand-teal))] ring-2 ring-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))] bg-muted/30 hover:bg-muted/50'}`}
                  >
                    {formData.assistantType === 'inbound' && (
                      <div className="absolute top-3 right-3">
                        <Badge className="gap-1">
                          <Check className="h-3 w-3" /> Selected
                        </Badge>
                      </div>
                    )}
                    <div className="text-center space-y-3">
                      <PhoneIncoming className="w-12 h-12 mx-auto text-primary" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold">
                        Phone Assistant
                      </h3>
                      <p className="text-sm text-muted-foreground">Handles phone calls and voice interactions</p>
                    </div>
                  </div>

                  <div
                    onClick={() => handleAssistantTypeSelect('website')}
                    className={`relative p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${formData.assistantType === 'website' ? 'border-[hsl(var(--brand-teal))] ring-2 ring-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))] bg-muted/30 hover:bg-muted/50'}`}
                  >
                    {formData.assistantType === 'website' && (
                      <div className="absolute top-3 right-3">
                        <Badge className="gap-1">
                          <Check className="h-3 w-3" /> Selected
                        </Badge>
                      </div>
                    )}
                    <div className="text-center space-y-3">
                      <Globe className="w-12 h-12 mx-auto text-primary" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold">
                        Website Assistant
                      </h3>
                      <p className="text-sm text-muted-foreground">Provides support through web chat interface</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>}

          {/* Step 3: Voice & Language Selection */}
          {step === 3 && <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Voice & Language Settings
                </CardTitle>
                <p className="text-muted-foreground">Choose how your assistant will sound</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="language" className="text-base font-medium">Choose a language</Label>
                    <p className="text-sm text-muted-foreground mt-1">Popular languages</p>
                  </div>

                  {/* Quick picks - popular languages with improved visual design */}
                  <ToggleGroup type="single" value={formData.language} onValueChange={(value) => {
                    if (!value) return;
                    const selectedLang = languages[value];
                    setFormData({
                      ...formData,
                      language: value,
                      language_name: selectedLang?.name || 'English'
                    });
                  }} className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {['en','es','fr','de','pt','it','hi','ar','ja','zh'].map((code) => (
                      <ToggleGroupItem 
                        key={code} 
                        value={code} 
                        aria-label={code} 
                        className="flex flex-col items-center gap-2 p-4 h-20 border-2 border-muted hover:border-[hsl(var(--brand-teal))]/50 data-[state=on]:border-[hsl(var(--brand-teal))] data-[state=on]:bg-[hsl(var(--brand-teal))]/10 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="text-2xl">
                          {getLanguageDisplay(code, '').split(' ')[0]}
                        </div>
                        <div className="text-xs font-medium text-center leading-tight">
                          {languages[code]?.name || code.toUpperCase()}
                        </div>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>

                  {/* Full list with improved styling */}
                  <div className="space-y-3">
                    <Label htmlFor="language" className="text-sm font-medium text-muted-foreground">All languages</Label>
                    <Select value={formData.language} onValueChange={value => {
                      const selectedLang = languages[value];
                      setFormData({
                        ...formData,
                        language: value,
                        language_name: selectedLang?.name || 'English'
                      });
                    }}>
                      <SelectTrigger className="h-12 border-2 hover:border-[hsl(var(--brand-teal))]/50 focus:border-[hsl(var(--brand-teal))] transition-colors">
                        <SelectValue placeholder="Search for more languages...">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">
                              {getLanguageDisplay(formData.language, '').split(' ')[0]}
                            </span>
                            <span>
                              {formData.language_name || "Select language"}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-background border-2 shadow-xl max-h-[300px]">
                        {Object.keys(languages).length > 0 ? Object.entries(languages).map(([code, lang]) => (
                          <SelectItem key={code} value={code} className="flex items-center gap-2 py-3 hover:bg-[hsl(var(--brand-teal))]/10">
                            <div className="flex items-center gap-3 w-full">
                              <span className="text-lg">
                                {getLanguageDisplay(code, '').split(' ')[0]}
                              </span>
                              <span className="font-medium">
                                {lang.name}
                              </span>
                            </div>
                          </SelectItem>
                        )) : (
                          <SelectItem value="en">🇺🇸 English (Loading...)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Select Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {Object.entries(voices).map(([id, voice]) => <div key={id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${formData.voice_id === id ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]'}`} onClick={() => setFormData({
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
          {step === 4 && <Card className="max-w-5xl mx-auto">
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
                  {getRolesByType(formData.assistantType, formData.industry).map(role => <div key={role.id} onClick={() => handleRoleSelect(role.id)} className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${formData.role === role.id ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]'}`}>
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
          {step === 5 && <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Choose what your assistant can do
                </CardTitle>
                <p className="text-muted-foreground">Turn on the actions your assistant can do during calls.</p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Real-Time Booking */}
                <div className={`rounded-lg p-6 border transition-colors ${formData.actions.realTimeBooking.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Calendar className={`h-6 w-6 mt-1 ${formData.actions.realTimeBooking.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                      <div>
                        <h3 className="font-semibold text-lg">Real-Time Booking</h3>
                        <p className="text-sm text-[hsl(var(--brand-teal))]">Allow customers to book appointments directly through the call</p>
                      </div>
                    </div>
                    <Switch 
                      className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                    <div className="pl-9 mt-2 flex flex-wrap gap-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{({google:'Google Calendar',outlook:'Outlook Calendar',calendly:'Calendly',custom:'Custom'} as Record<string,string>)[formData.actions.realTimeBooking.calendarType]}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions.realTimeBooking.availableHours}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions.realTimeBooking.timeZone}</span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs">{formData.actions.realTimeBooking.bufferTime}m buffer</span>
                      <span className="text-xs text-muted-foreground">Defaults in use • You can change these later</span>
                    </div>
                  )}
                </div>

                {/* Call Transfer */}
                <div className={`rounded-lg p-6 border transition-colors ${formData.actions.callTransfer.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <PhoneForwarded className={`h-6 w-6 mt-1 ${formData.actions.callTransfer.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                      <div>
                        <h3 className="font-semibold text-lg">Call Transfer</h3>
                        <p className="text-sm text-[hsl(var(--brand-teal))]">Transfer calls to human agents based on specific conditions</p>
                      </div>
                    </div>
                    <Switch 
                      className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                <div className={`rounded-lg p-6 border transition-colors ${formData.actions.smsAutomation.enabled ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]' : 'border-border hover:border-[hsl(var(--brand-teal))]/50'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <MessageSquare className={`h-6 w-6 mt-1 ${formData.actions.smsAutomation.enabled ? 'text-[hsl(var(--brand-teal))]' : 'text-foreground'}`} />
                      <div>
                        <h3 className="font-semibold text-lg">SMS Automation</h3>
                        <p className="text-sm text-[hsl(var(--brand-teal))]">Send automated SMS messages for bookings and follow-ups</p>
                      </div>
                    </div>
                    <Switch 
                      className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                            className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                            className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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
                            className="data-[state=checked]:bg-[hsl(var(--brand-teal))]"
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

              </CardContent>
            </Card>}

          {/* Step 6: Teach Your Assistant */}
          {step === 6 && <Card className="max-w-4xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Brain className="h-6 w-6 text-[hsl(var(--brand-teal))]" />
                  Teach Your Assistant How to Talk to Customers
                </CardTitle>
                
              </CardHeader>
              <CardContent className="space-y-12">
                
                {/* Assistant Name */}
                <Card className="p-6 border-2 border-[hsl(var(--brand-teal))]/20 bg-[hsl(var(--brand-teal))]/5">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">First, what should we call your assistant?</h3>
                    <Input 
                      value={formData.name} 
                      onChange={e => {
                        const name = e.target.value
                        setFormData(prev => {
                          const next = { ...prev, name } as typeof prev
                          if (next.behavior?.autoCompose) {
                            const { initial, prompt } = composeFromBehavior(next)
                            next.initial_message = initial
                            next.system_prompt = prompt
                          }
                          return next
                        })
                      }} 
                      placeholder="e.g., Sarah, Alex, Customer Care Assistant" 
                      className="max-w-md mx-auto text-center text-lg"
                    />
                    
                  </div>
                </Card>

                {/* Question 1: Main Focus */}
                <Card className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">What should your assistant focus on during calls?</h3>
                    
                    <div className="flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
                      {[
                        { value: 'Book appointment', icon: '📅', desc: 'Schedule meetings or appointments' },
                        { value: 'Qualify lead', icon: '🎯', desc: 'Assess if caller is a good fit' },
                        { value: 'Support', icon: '🤝', desc: 'Help with questions and issues' },
                        { value: 'Collect info', icon: '📝', desc: 'Gather customer information' },
                        { value: 'Route call', icon: '📞', desc: 'Direct to right department' }
                      ].map(goal => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => updateBehavior({ goal: goal.value })}
                          className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                            formData.behavior.goal === goal.value 
                              ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))]/10 text-[hsl(var(--brand-teal))]' 
                              : 'border-border hover:border-[hsl(var(--brand-teal))]/50'
                          }`}
                        >
                          <div className="text-2xl mb-2">{goal.icon}</div>
                          <div className="font-medium">{goal.value}</div>
                          <div className="text-xs text-muted-foreground mt-1">{goal.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Question 2: Who They Talk To */}
                <Card className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">Who will your assistant be talking to?</h3>
                    <p className="text-muted-foreground">Describe your typical callers so your assistant knows how to connect with them</p>
                    <div className="max-w-lg mx-auto">
                      <Input 
                        placeholder="e.g., small business owners, new customers, existing clients" 
                        value={formData.behavior.audience} 
                        onChange={e => updateBehavior({ audience: e.target.value })} 
                        className="text-center text-lg"
                      />
                    </div>
                  </div>
                </Card>

                {/* Question 3: Conversation Style */}
                <Card className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">How should your assistant sound on calls?</h3>
                    <p className="text-muted-foreground">Choose the personality that fits your brand</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                      {[
                        { value: 'Friendly', icon: '😊', desc: 'Warm, welcoming, and approachable' },
                        { value: 'Professional', icon: '💼', desc: 'Polite, formal, and business-focused' },
                        { value: 'Empathetic', icon: '❤️', desc: 'Understanding, caring, and supportive' }
                      ].map(tone => (
                        <button
                          key={tone.value}
                          type="button"
                          onClick={() => updateBehavior({ tone: tone.value })}
                          className={`p-6 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                            formData.behavior.tone === tone.value 
                              ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))]/10 text-[hsl(var(--brand-teal))]' 
                              : 'border-border hover:border-[hsl(var(--brand-teal))]/50'
                          }`}
                        >
                          <div className="text-3xl mb-3">{tone.icon}</div>
                          <div className="font-semibold text-lg">{tone.value}</div>
                          
                        </button>
                      ))}
                    </div>
                    
                    {/* Sub-choices for conversation style */}
                    <div className="space-y-8 max-w-xl mx-auto mt-8">
                      <div className="text-center space-y-4">
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
                              onClick={() => updateBehavior({ responseLength: length.value })}
                              className={`px-6 py-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                                formData.behavior.responseLength === length.value 
                                  ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))]/10 text-[hsl(var(--brand-teal))]' 
                                  : 'border-border hover:border-[hsl(var(--brand-teal))]/50'
                              }`}
                            >
                              <div className="font-medium">{length.value}</div>
                              <div className="text-xs text-muted-foreground">{length.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center space-y-4">
                        <p className="font-semibold text-lg">Language Style</p>
                        <div className="flex gap-3 justify-center">
                          {[
                            { value: 'Simple', desc: 'Easy language' },
                            { value: 'Standard', desc: 'Business terms' }
                          ].map(jargon => (
                            <button
                              key={jargon.value}
                              type="button"
                              onClick={() => updateBehavior({ jargonLevel: jargon.value })}
                              className={`px-6 py-3 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                                formData.behavior.jargonLevel === jargon.value 
                                  ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))]/10 text-[hsl(var(--brand-teal))]' 
                                  : 'border-border hover:border-[hsl(var(--brand-teal))]/50'
                              }`}
                            >
                              <div className="font-medium">{jargon.value}</div>
                              <div className="text-xs text-muted-foreground">{jargon.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Question 4: What TO Say */}
                <Card className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">What should your assistant always mention?</h3>
                    
                    
                    {/* Input section */}
                    <div className="max-w-lg mx-auto">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type your own or pick from examples below" 
                          value={doSayInput} 
                          onChange={e => setDoSayInput(e.target.value)} 
                          onKeyDown={e => { 
                            if (e.key==='Enter' && doSayInput && formData.behavior.doSay.length < 3) { 
                              updateBehavior({ doSay: [...formData.behavior.doSay, doSayInput] }); 
                              setDoSayInput('') 
                            } 
                          }} 
                          className="text-center"
                        />
                        <Button 
                          type="button" 
                          onClick={() => { 
                            if (doSayInput && formData.behavior.doSay.length < 3) { 
                              updateBehavior({ doSay: [...formData.behavior.doSay, doSayInput] }); 
                              setDoSayInput('') 
                            } 
                          }}
                          disabled={!doSayInput || formData.behavior.doSay.length >= 3}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                    
                    {/* Categorized Examples */}
                    <div className="space-y-6 max-w-3xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-[hsl(var(--brand-teal))]">💰 Offers & Benefits</div>
                          <div className="space-y-2">
                            {['Free consultation', '30-day money back guarantee', 'We price match competitors', 'Same-day service available'].map(ex => (
                              <Button 
                                key={ex} 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs border-[hsl(var(--brand-teal))]/30 text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal))]/10" 
                                type="button" 
                                onClick={() => {
                                  if (formData.behavior.doSay.length < 3 && !formData.behavior.doSay.includes(ex)) {
                                    updateBehavior({ doSay: [...formData.behavior.doSay, ex] })
                                  }
                                }}
                                disabled={formData.behavior.doSay.length >= 3 || formData.behavior.doSay.includes(ex)}
                              >
                                + {ex}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-[hsl(var(--brand-teal))]">🏆 Credentials & Trust</div>
                          <div className="space-y-2">
                            {['Licensed and insured', '10+ years in business', 'Family owned and operated', '5-star Google rating'].map(ex => (
                              <Button 
                                key={ex} 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs border-[hsl(var(--brand-teal))]/30 text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal))]/10" 
                                type="button" 
                                onClick={() => {
                                  if (formData.behavior.doSay.length < 3 && !formData.behavior.doSay.includes(ex)) {
                                    updateBehavior({ doSay: [...formData.behavior.doSay, ex] })
                                  }
                                }}
                                disabled={formData.behavior.doSay.length >= 3 || formData.behavior.doSay.includes(ex)}
                              >
                                + {ex}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="font-medium text-sm text-[hsl(var(--brand-teal))]">📞 Next Steps</div>
                          <div className="space-y-2">
                            {['Ask about your timeline', 'Schedule a site visit', 'Get a custom quote', 'Check our availability'].map(ex => (
                              <Button 
                                key={ex} 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs border-[hsl(var(--brand-teal))]/30 text-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal))]/10" 
                                type="button" 
                                onClick={() => {
                                  if (formData.behavior.doSay.length < 3 && !formData.behavior.doSay.includes(ex)) {
                                    updateBehavior({ doSay: [...formData.behavior.doSay, ex] })
                                  }
                                }}
                                disabled={formData.behavior.doSay.length >= 3 || formData.behavior.doSay.includes(ex)}
                              >
                                + {ex}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Selected items */}
                    {formData.behavior.doSay.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Your assistant will mention:</div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {formData.behavior.doSay.map((item, idx) => (
                            <Badge 
                              key={idx} 
                              className="cursor-pointer bg-[hsl(var(--brand-teal))]/10 text-[hsl(var(--brand-teal))] border-[hsl(var(--brand-teal))]/30 text-sm py-1 px-3" 
                              onClick={() => updateBehavior({ doSay: formData.behavior.doSay.filter((_,i)=>i!==idx) })}
                            >
                              ✓ {item} <span className="ml-2 opacity-60">×</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Question 5: What NOT to Say */}
                <Card className="p-6">
                  <div className="text-center space-y-5">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">What should your assistant avoid mentioning?</h3>
                    
                    <div className="max-w-lg mx-auto space-y-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Type topics to avoid (up to 3)" 
                          value={dontSayInput} 
                          onChange={e => setDontSayInput(e.target.value)} 
                          onKeyDown={e => { 
                            if (e.key==='Enter' && dontSayInput && formData.behavior.dontSay.length < 3) { 
                              updateBehavior({ dontSay: [...formData.behavior.dontSay, dontSayInput] }); 
                              setDontSayInput('') 
                            } 
                          }}
                          className="text-center"
                        />
                        <Button 
                          type="button" 
                          onClick={() => { 
                            if (dontSayInput && formData.behavior.dontSay.length < 3) { 
                              updateBehavior({ dontSay: [...formData.behavior.dontSay, dontSayInput] }); 
                              setDontSayInput('') 
                            } 
                          }}
                          disabled={!dontSayInput || formData.behavior.dontSay.length >= 3}
                        >
                          Add
                        </Button>
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
                              if (formData.behavior.dontSay.length < 3 && !formData.behavior.dontSay.includes(ex)) {
                                updateBehavior({ dontSay: [...formData.behavior.dontSay, ex] })
                              }
                            }}
                            disabled={formData.behavior.dontSay.length >= 3 || formData.behavior.dontSay.includes(ex)}
                          >
                            + {ex}
                          </Button>
                        ))}
                      </div>
                      
                      {formData.behavior.dontSay.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm font-medium">Will avoid:</div>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {formData.behavior.dontSay.map((item, idx) => (
                              <Badge 
                                key={idx} 
                                variant="destructive"
                                className="cursor-pointer text-sm py-1 px-3" 
                                onClick={() => updateBehavior({ dontSay: formData.behavior.dontSay.filter((_,i)=>i!==idx) })}
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

                {/* Question 6: Important Questions to Ask */}
                <Card className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold text-[hsl(var(--brand-teal))]">What questions should your assistant always ask?</h3>
                    <p className="text-muted-foreground">Teach your assistant the most important questions to gather key information</p>
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g., What's your budget range?, When do you need this completed?" 
                          value={mustAskInput} 
                          onChange={e => setMustAskInput(e.target.value)} 
                          onKeyDown={e => { 
                            if (e.key==='Enter' && mustAskInput && formData.behavior.mustAsk.length < 3) { 
                              updateBehavior({ mustAsk: [...formData.behavior.mustAsk, mustAskInput] }); 
                              setMustAskInput('') 
                            } 
                          }}
                          className="text-center"
                        />
                        <Button 
                          type="button" 
                          onClick={() => { 
                            if (mustAskInput && formData.behavior.mustAsk.length < 3) { 
                              updateBehavior({ mustAsk: [...formData.behavior.mustAsk, mustAskInput] }); 
                              setMustAskInput('') 
                            } 
                          }}
                          disabled={!mustAskInput || formData.behavior.mustAsk.length >= 3}
                        >
                          Add
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {formData.behavior.mustAsk.map((item, idx) => (
                          <Badge 
                            key={idx} 
                            className="cursor-pointer bg-teal-100 text-teal-700 border-teal-300 text-sm py-1 px-3" 
                            onClick={() => updateBehavior({ mustAsk: formData.behavior.mustAsk.filter((_,i)=>i!==idx) })}
                          >
                            ❓ {item} <span className="ml-2 opacity-60">×</span>
                          </Badge>
                        ))}
                      </div>
                      
                    </div>
                  </div>
                </Card>


                {/* Prompt Editing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center text-xl">Review & Customize</CardTitle>
                    <p className="text-center text-muted-foreground">Fine-tune your assistant's messages and instructions</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">Advanced prompt editing</div>
                        <Switch checked={showPromptEditing} onCheckedChange={setShowPromptEditing} />
                      </div>
                      {showPromptEditing && (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="initialMessage" className="text-base font-medium">Opening Message</Label>
                            <Textarea 
                              id="initialMessage" 
                              disabled={formData.behavior.autoCompose} 
                              value={formData.initial_message} 
                              onChange={e => setFormData({ ...formData, initial_message: e.target.value })} 
                              rows={3} 
                              className="resize-none mt-2" 
                            />
                          </div>
                          <div>
                            <Label htmlFor="systemPrompt" className="text-base font-medium">System Instructions</Label>
                            <Textarea 
                              id="systemPrompt" 
                              disabled={formData.behavior.autoCompose} 
                              value={formData.system_prompt} 
                              onChange={e => setFormData({ ...formData, system_prompt: e.target.value })} 
                              rows={8} 
                              className="resize-none mt-2" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>}

          {/* Step 7: Knowledge Base Upload (Optional) */}
          {step === 7 && <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Add Company Info for Smarter Answers
                </CardTitle>
                <p className="text-muted-foreground">Optional: Upload FAQs, services, and policies.</p>
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

          {/* Step 8: Phone Number Assignment / Code Integration */}
          {step === 8 && (() => {
            console.log('Step 8 - assistantType:', formData.assistantType, 'hasPhoneNumber:', formData.hasPhoneNumber, 'phoneNumber:', formData.phoneNumber);
            
            // Website Assistant Flow - Show Code Snippet
            if (formData.assistantType === 'website') {
              const generateCodeSnippet = () => {
                return `<script src="https://widget.lovable.ai/v1/widget.js"></script>
<script>LovableWidget.init({assistantId: "${currentAssistantId || 'your-assistant-id'}", name: "${formData.name}"});</script>`;
              };

              const codeSnippet = generateCodeSnippet();
              
              const copyToClipboard = () => {
                navigator.clipboard.writeText(codeSnippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              };

              return <Card className="max-w-5xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Website Integration Code
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Copy and paste this code snippet into your website to add your assistant
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-6 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">HTML Integration Code</h3>
                        <Button 
                          onClick={copyToClipboard}
                          variant="outline" 
                          size="sm"
                          className="gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          {copied ? 'Copied!' : 'Copy Code'}
                        </Button>
                      </div>
                      <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm whitespace-pre-wrap">{codeSnippet}</pre>
                      </div>
                    </div>
                    

                     <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                       <h4 className="font-medium text-teal-900 mb-2">Integration Instructions:</h4>
                       <ul className="text-sm text-teal-800 space-y-1 list-disc list-inside">
                        <li><strong>Lovable Projects:</strong> Add to your main HTML file or component</li>
                        <li><strong>Replit:</strong> Paste in your index.html file</li>
                        <li><strong>Website Builders:</strong> Add to custom HTML/code injection section</li>
                        <li><strong>Manual HTML:</strong> Insert before the closing <code>&lt;/body&gt;</code> tag</li>
                      </ul>
                    </div>
                    
                    <div className="text-center">
                      <Button variant="brand" onClick={handleNext}>
                        Continue to Testing
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>;
            }
            
            // Phone Assistant Flow - Show Phone Number Purchase
            return <Card className="max-w-5xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone Number Assignment
                </CardTitle>
                <p className="text-muted-foreground">
                  {formData.hasPhoneNumber ? (
                    <>
                      Assistant connected to phone number{formData.phoneNumber ? ` ${formData.phoneNumber}` : ""}
                    </>
                  ) : (
                    "Your assistant needs a phone number to function"
                  )}
                </p>
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
                      <Button variant="brand-outline" onClick={handleNext}>
                        Skip for Now
                      </Button>
                    </div>
                  </> : <div className="text-center p-6 bg-[hsl(var(--brand-teal))/0.06] border border-[hsl(var(--brand-teal))] rounded-lg">
                    <Phone className="w-12 h-12 text-[hsl(var(--brand-teal))] mx-auto mb-4" />
                    <div className="font-semibold text-[hsl(var(--brand-teal))] mb-1">Phone number connected!</div>
                    <div className="text-sm text-foreground mb-4">
                      {formData.phoneNumber && (
                        <>Your assistant is connected to <span className="font-semibold text-[hsl(var(--brand-teal))]">{formData.phoneNumber}</span></>
                      )}
                    </div>
                    <Button variant="brand" onClick={handleNext}>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>}
               </CardContent>
              </Card>;
          })()}

           {/* Step 9: Testing & Deployment */}
           {step === 9 && <Card className="max-w-5xl mx-auto">
             <CardHeader className="text-center pb-8">
               <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--brand-teal))] to-[hsl(var(--brand-teal-hover))] rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                 <TestTube className="h-8 w-8 text-white" />
               </div>
               <CardTitle className="text-2xl">Test Your Assistant</CardTitle>
             </CardHeader>
             <CardContent className="space-y-8">
               {/* Primary Actions - Clean & Prominent */}
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button 
                   variant="brand" 
                   size="lg"
                   onClick={() => setIsTestModalOpen(true)}
                   className="flex-1 sm:flex-none px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover-scale"
                 >
                   <Phone className="h-5 w-5 mr-3" />
                   Start Test Call
                 </Button>
                 <Button 
                   variant="outline"
                   size="lg"
                   onClick={onClose}
                   className="flex-1 sm:flex-none px-8 py-6 text-base font-semibold bg-white hover:bg-gray-50"
                 >
                   <Save className="h-5 w-5 mr-3" />
                   Save as Draft
                 </Button>
               </div>


             </CardContent>
           </Card>}
         </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end pt-6">
          {step === 5 && (
            <Button onClick={handleNext} disabled={!canGoNext()} variant="brand">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {(step === 3 || step === 6 || step === 7) && (
            <Button onClick={handleNext} disabled={!canGoNext()} variant="brand">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {step === totalSteps && (
            <div className="text-center space-y-3">
              {!formData.hasPhoneNumber && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm">
                    ⚠️ To deploy your assistant, please go back to previous step  and connect a phone number first
                  </p>
                </div>
              )}
              <Button 
                onClick={async () => {
                  if (!formData.hasPhoneNumber) {
                    onClose();
                    navigate('/phone-numbers');
                    return;
                  }
                  
                  setIsCreating(true);
                  try {
                    await handleCreateAssistant();
                    const newAssistant = await createAssistant({
                      name: formData.name,
                      type: 'Voice',
                      industry: formData.industry,
                      use_case: formData.role,
                      assistant_type: formData.assistantType as 'inbound' | 'outbound' | 'website',
                      voice_id: formData.voice_id,
                      voice_name: formData.voice_name,
                      language: formData.language,
                      language_name: formData.language_name,
                      system_prompt: formData.system_prompt,
                      initial_message: formData.initial_message,
                      temperature: formData.temperature,
                      max_tokens: formData.max_tokens
                    });
                    
                    if (newAssistant) {
                      console.log('Successfully created assistant:', newAssistant);
                      onComplete?.(newAssistant.id);
                      // Show success popup
                      setShowSuccessDialog(true);
                    } else {
                      throw new Error('Failed to create assistant');
                    }
                  } catch (error) {
                    console.error('Error deploying assistant:', error);
                  } finally {
                    setIsCreating(false);
                  }
                }}
                disabled={isCreating}
                size="lg"
                className="px-8"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating & Deploying...
                  </>
                ) : !formData.hasPhoneNumber ? (
                  <>
                    Connect Phone Number to Deploy
                  </>
                ) : (
                  <>
                    Create & Deploy Assistant
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Phone Number Purchase Modal - Only for Phone Assistants */}
      {formData.assistantType !== 'website' && (
        <PhoneNumberPurchaseModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          assistantType={formData.assistantType as 'inbound' | 'outbound'}
          assistantName={formData.name}
          onPurchaseComplete={handlePhoneNumberPurchase}
        />
      )}

      {/* Test Assistant Modal */}
      {isTestModalOpen && (
        <TestAssistantModal
          isOpen={isTestModalOpen}
          onClose={() => setIsTestModalOpen(false)}
          onBackToCreation={() => {
            setIsTestModalOpen(false);
            setStep(totalSteps); // Navigate to final step with deploy/save/test options
          }}
          assistant={{
            id: currentAssistantId || 'test-assistant',
            user_id: 'demo-user-123',
            name: formData.name || 'Test Assistant',
            type: 'Voice',
            industry: formData.industry,
            use_case: formData.role,
            assistant_type: formData.assistantType as 'inbound' | 'outbound' | 'website',
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

      {/* Enhanced Success Dialog with Contextual Guidance */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[hsl(var(--brand-teal))] to-[hsl(var(--brand-teal-hover))] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="text-xl">🎉 Assistant Deployed Successfully!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Contextual Message Based on Assistant Type */}
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {formData.assistantType === 'inbound' ? (
                  <>Your inbound assistant is now live and ready to receive calls! Test it first, then start receiving calls on {formData.phoneNumber ? `your number ${formData.phoneNumber}` : 'your configured number'}.</>
                ) : (
                  <>Your outbound assistant is ready to make calls! Test it first, then create campaigns to start reaching your prospects effectively.</>
                )}
              </p>
            </div>

            {/* Assistant Capabilities */}
            {(formData.actions.realTimeBooking.enabled || 
              formData.actions.callTransfer.enabled || 
              formData.actions.smsAutomation.enabled) && (
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Your assistant can:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                  {formData.actions.realTimeBooking.enabled && (
                    <li>• Schedule appointments in real-time</li>
                  )}
                  {formData.actions.callTransfer.enabled && (
                    <li>• Transfer calls to human agents when needed</li>
                  )}
                  {formData.actions.smsAutomation.enabled && (
                    <li>• Send automated SMS messages for bookings and reminders</li>
                  )}
                  <li>• Handle {formData.assistantType} calls with intelligent conversation</li>
                </ul>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setShowSuccessDialog(false);
                  setIsTestModalOpen(true);
                }}
                className="w-full bg-[hsl(var(--brand-teal))] hover:bg-[hsl(var(--brand-teal-hover))] text-white"
                size="lg"
              >
                <Phone className="h-4 w-4 mr-2" />
                Test Your Assistant First
              </Button>

              {formData.assistantType === 'inbound' ? (
                <Button 
                  onClick={() => {
                    setShowSuccessDialog(false);
                    onClose();
                    // Navigate to conversations page
                    window.location.href = '/conversations';
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Monitor Incoming Calls
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    setShowSuccessDialog(false);
                    onClose();
                    // Navigate to campaigns page
                    window.location.href = '/campaigns';
                  }}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground text-center mb-3">Quick access to:</p>
              <div className="flex justify-center gap-4 text-xs">
                <button 
                  onClick={() => {
                    setShowSuccessDialog(false);
                    onClose();
                    window.location.href = '/phone-numbers';
                  }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="h-3 w-3" />
                  Phone Numbers
                </button>
                {formData.actions.realTimeBooking.enabled && (
                  <button 
                    onClick={() => {
                      setShowSuccessDialog(false);
                      onClose();
                      window.location.href = '/bookings';
                    }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                    Bookings
                  </button>
                )}
                <button 
                  onClick={() => {
                    setShowSuccessDialog(false);
                    onClose();
                    window.location.href = '/conversations';
                  }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  Conversations
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>;
};
export default RefinedAssistantCreationFlow;