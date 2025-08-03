import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Mic, MessageCircle, Repeat, Phone, MessageSquare, Globe, Smartphone, Upload, Link, Settings, TestTube, Rocket, Save } from "lucide-react";
import PhoneNumberPurchaseModal from "./PhoneNumberPurchaseModal";
import BrowserVoiceTest from "./BrowserVoiceTest";
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
  const [purchasedPhoneNumber, setPurchasedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [formData, setFormData] = useState({
    industry: "",
    useCase: "",
    name: "",
    type: "",
    firstMessage: "",
    systemPrompt: "",
    channels: {
      phone: false,
      sms: false,
      website: false
    },
    knowledge: [],
    phoneNumber: null as PhoneNumber | null
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

  const handleUseCaseSelect = (useCase: string) => {
    setFormData({ ...formData, useCase });
    setTimeout(() => setCurrentStep(3), 200);
  };

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
    setTimeout(() => setCurrentStep(4), 200);
  };

  const handleChannelToggle = (channel: string) => {
    if (channel === 'phone') {
      // Open phone number purchase modal instead of just toggling
      setIsPurchaseModalOpen(true);
    } else {
      setFormData({
        ...formData,
        channels: {
          ...formData.channels,
          [channel]: !formData.channels[channel as keyof typeof formData.channels]
        }
      });
    }
  };

  const handlePhoneNumberPurchase = (phoneNumber: PhoneNumber) => {
    setPurchasedPhoneNumber(phoneNumber);
    setFormData({
      ...formData,
      phoneNumber,
      channels: {
        ...formData.channels,
        phone: true
      }
    });
    setIsPurchaseModalOpen(false);
    
    toast({
      title: "Phone Channel Connected!",
      description: `${phoneNumber.number} is now connected to your assistant and ready to receive calls.`,
      duration: 5000,
    });
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
    alert(`🚀 Creating ${formData.name}...\n\nAssistant created successfully!\nChannels: ${Object.entries(formData.channels).filter(([_, enabled]) => enabled).map(([channel]) => channel).join(', ')}`);
    onClose();
  };

  const handleTestAssistant = () => {
    setIsTestModalOpen(true);
  };

  const handleSaveDraft = () => {
    alert(`💾 Saving ${formData.name} as draft...\n\nYou can continue configuring this assistant later.`);
    onClose();
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
              <h2 className="text-2xl font-semibold mb-2">Use case</h2>
              <p className="text-gray-600">What will your assistant help with?</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'customer-support', label: 'Customer Support', emoji: '🎧' },
                { id: 'outbound-sales', label: 'Outbound Sales', emoji: '📈' },
                { id: 'learning', label: 'Learning and Development', emoji: '📚' },
                { id: 'scheduling', label: 'Scheduling', emoji: '📅' },
                { id: 'lead-qualification', label: 'Lead Qualification', emoji: '👥' },
                { id: 'answering-service', label: 'Answering Service', emoji: '📞' },
                { id: 'consultation', label: 'Consultation Scheduling', emoji: '📋' },
                { id: 'case-intake', label: 'Case Intake', emoji: '📝' },
                { id: 'legal-resources', label: 'Legal Resources', emoji: '📖' },
                { id: 'billing', label: 'Billing Inquiries', emoji: '💳' },
                { id: 'document-prep', label: 'Document Preparation', emoji: '📄' },
                { id: 'case-updates', label: 'Case Updates', emoji: '🔄' },
                { id: 'other', label: 'Other', emoji: '❓' }
              ].map((useCase) => (
                <div
                  key={useCase.id}
                  onClick={() => handleUseCaseSelect(useCase.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                    formData.useCase === useCase.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  style={{ height: '120px', width: '150px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-2xl mb-2">{useCase.emoji}</div>
                    <div className="text-sm font-medium text-center leading-tight">{useCase.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Assistant Details</h2>
              <p className="text-gray-600">Let's name your assistant and choose its type</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name your assistant
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Support"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose assistant type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'voice', label: 'Voice Assistant', description: 'Handles phone calls and voice interactions', emoji: '🎙️' },
                    { id: 'chat', label: 'Chat Assistant', description: 'Responds to text messages and website chat', emoji: '💬' },
                    { id: 'unified', label: 'Unified Assistant', description: 'Handles both voice and text across all channels', emoji: '🔄' }
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                        formData.type === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-blue-500'
                      }`}
                      style={{ height: '120px' }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-2xl mb-2">{type.emoji}</div>
                        <div className="text-sm font-medium text-center leading-tight mb-1">{type.label}</div>
                        <div className="text-xs text-gray-500 text-center leading-tight">{type.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Configure Behavior</h2>
              <p className="text-gray-600">Define how your assistant should interact</p>
            </div>

            <div className="space-y-4">
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

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick start with a template:</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleTemplateSelect('customer-support')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Customer Support
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('sales')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Sales Assistant
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('technical')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Technical Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Add Knowledge</h2>
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
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-gray-600" />
                  <div className="font-medium">Add Text</div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Create a knowledge source from text content like FAQs, policies, or documentation
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Create Text Corpus
                </button>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Test Your Assistant</h2>
              <p className="text-gray-600">Try out your assistant before going live</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="text-center py-8">
                <Mic className="w-12 h-12 text-primary mx-auto mb-4" />
                <div className="font-medium mb-2 text-foreground">Browser Voice Testing</div>
                <div className="text-sm text-muted-foreground mb-4">
                  Test your assistant with voice conversations directly in your browser
                </div>
                <button 
                  onClick={handleTestAssistant}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center gap-2 mx-auto transition-colors"
                >
                  <TestTube className="w-5 h-5" />
                  Start Voice Test
                </button>
              </div>
            </div>

          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Connect Channels</h2>
              <p className="text-gray-600">Where will customers interact with your assistant?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'phone', icon: Phone, label: 'Phone calls', description: formData.phoneNumber ? `Assigned: ${formData.phoneNumber.number}` : 'Purchase a phone number for your assistant', emoji: '📞' },
                { id: 'sms', icon: MessageSquare, label: 'SMS messages', description: 'Respond to text messages automatically', emoji: '💬' },
                { id: 'website', icon: Globe, label: 'Website chat', description: 'Add a chat widget to your website', emoji: '🌐' }
              ].map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelToggle(channel.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all text-center ${
                    formData.channels[channel.id as keyof typeof formData.channels]
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  }`}
                  style={{ height: '120px' }}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-2xl mb-2">{channel.emoji}</div>
                    <div className="text-sm font-medium text-center leading-tight mb-1">{channel.label}</div>
                    <div className="text-xs text-gray-500 text-center leading-tight">{channel.description}</div>
                    {formData.channels[channel.id as keyof typeof formData.channels] && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-2">
                        <div className="text-white text-xs">✓</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              {/* Check if any communication channels are connected */}
              {(formData.channels.phone || formData.channels.sms || formData.channels.website) ? (
                <>
                  <div className="font-medium mb-4">Assistant Ready for Testing & Deployment</div>
                  <div className="flex justify-between gap-3">
                    <button
                      onClick={handleSaveDraft}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save as Draft
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleTestAssistant}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-2"
                      >
                        <TestTube className="w-4 h-4" />
                        Test Assistant
                      </button>
                      <button
                        onClick={handleDeploy}
                        className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium flex items-center gap-2"
                      >
                        <Rocket className="w-4 h-4" />
                        Deploy & Go Live
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-medium mb-4">Ready to deploy?</div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeploy}
                      className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium flex items-center gap-2"
                    >
                      <Rocket className="w-4 h-4" />
                      Create Assistant
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save as Draft
                    </button>
                  </div>
                </>
              )}
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
          <div className="flex justify-between p-6 border-t border-gray-200">
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
      <BrowserVoiceTest
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assistant={{
          id: "draft",
          name: formData.name || "Draft Assistant",
          type: formData.type || "Unified",
          industry: formData.industry || "technology",
          useCase: formData.useCase || "customer-support"
        } as BaseAssistant}
      />
    </div>
  );
};

export default AssistantCreationFlow;