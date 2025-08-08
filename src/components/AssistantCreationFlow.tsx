import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Phone, Upload, Link, Settings, TestTube, Rocket, Save, PhoneCall, PhoneIncoming, PhoneOutgoing, AlertTriangle, FileText, Plus } from "lucide-react";
import PhoneNumberPurchaseModal from "./PhoneNumberPurchaseModal";
import TestAssistantModal from "./TestAssistantModal";
import { PhoneNumber } from "@/types/phoneNumber";
import { useToast } from "@/hooks/use-toast";
import { BaseAssistant } from "@/types/assistant";

interface AssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantCreationFlow = ({ isOpen, onClose }: AssistantCreationFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isCreateTextModalOpen, setIsCreateTextModalOpen] = useState(false);
  const [textFormData, setTextFormData] = useState({
    name: "",
    content: ""
  });
  const [formData, setFormData] = useState({
    industry: "",
    assistantType: "", // "inbound" or "outbound"
    role: "",
    name: "",
    description: "",
    firstMessage: "",
    systemPrompt: "",
    knowledge: [] as Array<{id: string, name: string, type: 'document' | 'url' | 'text', content?: string}>,
    phoneNumber: null as PhoneNumber | null,
    hasPhoneNumber: false
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleIndustrySelect = (industry: string) => {
    setFormData({ ...formData, industry });
    setTimeout(() => setCurrentStep(2), 200);
  };

  const handleAssistantTypeSelect = (assistantType: string) => {
    setFormData({ ...formData, assistantType });
    setTimeout(() => setCurrentStep(3), 200);
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
    setTimeout(() => setCurrentStep(4), 200);
  };

  const handlePhoneNumberPurchase = (phoneNumber: PhoneNumber) => {
    setFormData({
      ...formData,
      phoneNumber,
      hasPhoneNumber: true
    });
    setIsPurchaseModalOpen(false);
    
    toast({
      title: "Phone Number Connected!",
      description: `${phoneNumber.number} is now connected to your assistant.`,
      duration: 5000,
    });
  };

  const handleSkipPhoneNumber = () => {
    setCurrentStep(7); // Skip to testing step
  };

  const handleTemplateSelect = (template: string) => {
    const templates = {
      'customer-support': {
        firstMessage: "Hello! I'm here to help you with any questions or issues you might have. How can I assist you today?",
        systemPrompt: "You are a helpful customer support assistant. Be friendly, professional, and solution-oriented. Always try to resolve customer issues efficiently while maintaining a positive tone."
      },
      'sales': {
        firstMessage: "Hi there! I'd love to learn more about your needs and see how we can help. What brings you here today?",
        systemPrompt: "You are a sales assistant focused on understanding customer needs and qualifying leads. Be consultative, ask relevant questions, and guide prospects toward solutions."
      },
      'technical': {
        firstMessage: "Hello! I'm here to help you troubleshoot technical issues. Please describe the problem you're experiencing.",
        systemPrompt: "You are a technical support specialist. Be methodical in your approach, ask clarifying questions, and provide step-by-step solutions."
      },
      'lead-qualifier': {
        firstMessage: "Hi! I'd like to learn more about your business needs. May I ask a few quick questions?",
        systemPrompt: "You are a lead qualification specialist. Ask relevant questions to understand prospect needs and determine if they're a good fit for our services."
      },
      'scheduler': {
        firstMessage: "Hello! I can help you schedule an appointment. What type of meeting are you looking for?",
        systemPrompt: "You are a scheduling assistant. Help customers book appointments efficiently while collecting necessary information."
      },
      'receptionist': {
        firstMessage: "Thank you for calling! How may I direct your call today?",
        systemPrompt: "You are a professional receptionist. Be welcoming, helpful, and efficient in directing calls and taking messages."
      }
    };

    const selectedTemplate = templates[template as keyof typeof templates];
    if (selectedTemplate) {
      setFormData({
        ...formData,
        firstMessage: selectedTemplate.firstMessage,
        systemPrompt: selectedTemplate.systemPrompt
      });
    }
  };

  const handleDeploy = () => {
    const assistantTypeText = formData.assistantType === 'inbound' ? 'Inbound' : 'Outbound';
    alert(`🚀 Creating ${formData.name}...\n\nAssistant created successfully!\nType: ${assistantTypeText} Call Assistant\nRole: ${formData.role}`);
    onClose();
  };

  const handleTestAssistant = () => {
    setIsTestModalOpen(true);
  };

  const handleSaveDraft = () => {
    alert(`💾 Saving ${formData.name} as draft...\n\nYou can continue configuring this assistant later.`);
    onClose();
  };

  const handleCreateText = () => {
    if (textFormData.name.trim() && textFormData.content.trim()) {
      const newTextKnowledge = {
        id: Date.now().toString(),
        name: textFormData.name,
        type: 'text' as const,
        content: textFormData.content
      };
      
      setFormData({
        ...formData,
        knowledge: [...formData.knowledge, newTextKnowledge]
      });
      
      setTextFormData({ name: "", content: "" });
      setIsCreateTextModalOpen(false);
      
      toast({
        title: "Text Knowledge Added!",
        description: `"${textFormData.name}" has been added to your knowledge base.`,
        duration: 3000,
      });
    }
  };

  const handleRemoveKnowledge = (id: string) => {
    setFormData({
      ...formData,
      knowledge: formData.knowledge.filter(item => item.id !== id)
    });
  };

  // Get role options based on industry and assistant type
  const getRoleOptions = () => {
    const baseRoles = [
      { id: 'customer-support', label: 'Customer Support', description: 'Handle customer inquiries and support issues', emoji: '🎧' },
      { id: 'sales', label: 'Sales Agent', description: 'Engage prospects and drive sales conversations', emoji: '💼' },
      { id: 'lead-qualifier', label: 'Lead Qualifier', description: 'Qualify potential customers and gather information', emoji: '🎯' },
      { id: 'scheduler', label: 'Scheduler', description: 'Book appointments and manage calendars', emoji: '📅' },
      { id: 'receptionist', label: 'Receptionist', description: 'Answer calls and direct inquiries', emoji: '📞' },
      { id: 'technical-support', label: 'Technical Support', description: 'Provide technical assistance and troubleshooting', emoji: '🔧' }
    ];

    // Filter roles based on assistant type if needed
    if (formData.assistantType === 'outbound') {
      return baseRoles.filter(role => ['sales', 'lead-qualifier', 'scheduler'].includes(role.id));
    }
    
    return baseRoles;
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">What industry is your business in?</h2>
              <p className="text-gray-600">Select the industry that best describes your business</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'retail', label: 'Retail & E-commerce', emoji: '🛍️' },
                { id: 'healthcare', label: 'Healthcare & Medical', emoji: '⚕️' },
                { id: 'finance', label: 'Finance & Banking', emoji: '🏦' },
                { id: 'real-estate', label: 'Real Estate', emoji: '🏠' },
                { id: 'education', label: 'Education & Training', emoji: '🎓' },
                { id: 'hospitality', label: 'Hospitality & Travel', emoji: '✈️' },
                { id: 'automotive', label: 'Automotive', emoji: '🚗' },
                { id: 'professional', label: 'Professional Services', emoji: '💼' },
                { id: 'technology', label: 'Technology & Software', emoji: '💻' },
                { id: 'government', label: 'Government & Public', emoji: '🏛️' },
                { id: 'food', label: 'Food & Beverage', emoji: '🍕' },
                { id: 'manufacturing', label: 'Manufacturing', emoji: '🏭' },
                { id: 'fitness', label: 'Fitness & Wellness', emoji: '💪' },
                { id: 'legal', label: 'Legal Services', emoji: '⚖️' },
                { id: 'nonprofit', label: 'Non-Profit', emoji: '❤️' },
                { id: 'media', label: 'Media & Entertainment', emoji: '🎬' },
                { id: 'other', label: 'Other', emoji: '❓' }
              ].map((industry) => (
                <div
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                    formData.industry === industry.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  style={{ height: '120px', width: '150px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-2xl mb-2">{industry.emoji}</div>
                    <div className="text-sm font-medium text-center leading-tight">{industry.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">What type of assistant do you need?</h2>
              <p className="text-gray-600">Choose how your assistant will interact with customers</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div
                onClick={() => handleAssistantTypeSelect('inbound')}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.assistantType === 'inbound'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="text-center">
                  <PhoneIncoming className="w-16 h-16 mx-auto mb-3 text-gray-800" />
                  <h3 className="text-lg font-semibold mb-2">Incoming Calls</h3>
                  <p className="text-sm text-gray-600">
                    Handles customer calls to your business
                  </p>
                </div>
              </div>

              <div
                onClick={() => handleAssistantTypeSelect('outbound')}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.assistantType === 'outbound'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="text-center">
                  <PhoneOutgoing className="w-16 h-16 mx-auto mb-3 text-gray-800" />
                  <h3 className="text-lg font-semibold mb-2">Outgoing Calls</h3>
                  <p className="text-sm text-gray-600">
                    Makes calls to prospects and customers
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Choose the assistant's role</h2>
              <p className="text-gray-600">What specific role will your {formData.assistantType} assistant perform?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {getRoleOptions().map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.role === role.id
                      ? 'border-[hsl(var(--brand-teal))] bg-[hsl(var(--brand-teal))/0.06]'
                      : 'border-gray-300 hover:border-[hsl(var(--brand-teal))]'
                  }`}
                  style={{ height: '140px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-2xl mb-2">{role.emoji}</div>
                    <div className="text-sm font-medium mb-1">{role.label}</div>
                    <div className="text-xs text-gray-500 leading-tight">{role.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Assistant Details & Behavior</h2>
              <p className="text-gray-600">Configure your assistant's identity and behavior</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Support Assistant"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brief Description (optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this assistant do?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First message (optional)
                </label>
                <textarea
                  value={formData.firstMessage}
                  onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
                  placeholder="What should your assistant say when customers first contact you?"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  System prompt
                </label>
                <textarea
                  value={formData.systemPrompt}
                  onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                  placeholder="Tell your assistant how to behave and what role to play..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Add Knowledge (Optional)</h2>
              <p className="text-gray-600">Help your assistant answer questions about your business</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="font-medium mb-2">Upload documents</div>
                <div className="text-sm text-gray-500 mb-4">
                  PDFs, Word docs, or text files with your business information
                </div>
                <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
                  Choose Files
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Link className="w-5 h-5 text-gray-600" />
                  <div className="font-medium">Add website URLs</div>
                </div>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div className="font-medium">Create Text Knowledge</div>
                  </div>
                  <button
                    onClick={() => setIsCreateTextModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Text
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Create knowledge sources from text content like FAQs, policies, or documentation
                </div>
              </div>

              {/* Display added knowledge items */}
              {formData.knowledge.length > 0 && (
                <div className="space-y-2">
                  <div className="font-medium text-gray-700">Added Knowledge:</div>
                  {formData.knowledge.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-gray-500">Text knowledge</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveKnowledge(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Assign Phone Number</h2>
              <p className="text-gray-600">Connect a phone number to enable calling functionality</p>
            </div>

            {formData.phoneNumber ? (
              <div className="border border-green-300 bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-6 h-6 text-green-600" />
                  <div className="font-medium text-green-800">Phone Number Connected</div>
                </div>
                <div className="text-sm text-green-700">
                  Your assistant is connected to: <strong>{formData.phoneNumber.number}</strong>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border border-gray-300 rounded-lg p-6 text-center">
                  <Phone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <div className="font-medium mb-2">No Phone Number Assigned</div>
                  <div className="text-sm text-gray-500 mb-4">
                    Purchase a phone number to enable calling functionality
                  </div>
                  <button 
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                  >
                    Connect Phone Number
                  </button>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={handleSkipPhoneNumber}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Skip for now
                  </button>
                  <div className="flex items-center gap-2 mt-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <div className="text-xs">
                      Your assistant won't be able to make or receive calls without a phone number
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Testing & Deployment</h2>
              <p className="text-gray-600">Test your assistant before going live</p>
            </div>

            {!formData.hasPhoneNumber && (
              <div className="border border-amber-300 bg-amber-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  <div className="font-medium">Your assistant doesn't have a phone number and can't make calls</div>
                </div>
                <div className="text-sm text-amber-700 mt-1">
                  You can still save as draft and add a phone number later.
                </div>
              </div>
            )}

            <div className="border border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="font-medium mb-2">Test Your Assistant</div>
                <div className="text-sm text-gray-500 mb-4">
                  {formData.assistantType === 'inbound' 
                    ? formData.hasPhoneNumber 
                      ? `Call ${formData.phoneNumber?.number} to test your assistant`
                      : "Assign a phone number to test incoming calls"
                    : formData.hasPhoneNumber 
                      ? "Provide your number for the assistant to call you"
                      : "Assign a phone number to test outbound calls"
                  }
                </div>
                {formData.hasPhoneNumber && (
                  <button
                    onClick={handleTestAssistant}
                    className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center gap-2 mx-auto"
                  >
                    <TestTube className="w-4 h-4" />
                    Start Test
                  </button>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="font-medium mb-4">Ready to deploy?</div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeploy}
                  className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Deploy Assistant
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {currentStep > 1 && (
              <button
                onClick={handlePrevious}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-gray-800 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        {currentStep >= 4 && currentStep < totalSteps && (
          <div className="flex justify-between p-6 border-t border-gray-200 bg-white relative z-10">
            <button
              onClick={handlePrevious}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <PhoneNumberPurchaseModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onPurchaseComplete={handlePhoneNumberPurchase}
      />

      {/* Create a mock assistant for testing during creation flow */}
      <TestAssistantModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assistant={{
          id: "draft",
          user_id: "draft",
          name: formData.name || "Draft Assistant",
          type: "Voice" as const,
          industry: formData.industry || "technology",
          use_case: formData.role || "customer-support",
          assistant_type: "inbound" as const,
          voice_id: "aria",
          voice_name: "Aria (Female)",
          language: "en",
          language_name: "English",
          system_prompt: "You are a helpful AI assistant. Keep responses concise and engaging for voice interaction.",
          initial_message: "Hello! How can I help you today?",
          temperature: 0.7,
          max_tokens: 300,
          status: "draft" as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }}
      />

      {/* Create Text Knowledge Modal */}
      {isCreateTextModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Create Text</h3>
              <button
                onClick={() => setIsCreateTextModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Name
                </label>
                <input
                  type="text"
                  value={textFormData.name}
                  onChange={(e) => setTextFormData({ ...textFormData, name: e.target.value })}
                  placeholder="Enter a name for your text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Content
                </label>
                <textarea
                  value={textFormData.content}
                  onChange={(e) => setTextFormData({ ...textFormData, content: e.target.value })}
                  placeholder="Enter your text content here"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsCreateTextModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateText}
                  disabled={!textFormData.name.trim() || !textFormData.content.trim()}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantCreationFlow;