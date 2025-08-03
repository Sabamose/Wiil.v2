import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface AssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

const AssistantCreationFlow = ({ isOpen, onClose }: AssistantCreationFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    firstMessage: "",
    systemPrompt: "",
    channels: {
      phone: false,
      sms: false,
      website: false,
      whatsapp: false
    },
    knowledge: []
  });

  const totalSteps = 5;

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

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
  };

  const handleChannelToggle = (channel: string) => {
    setFormData({
      ...formData,
      channels: {
        ...formData.channels,
        [channel]: !formData.channels[channel as keyof typeof formData.channels]
      }
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
    alert(`🚀 Deploying ${formData.name}...\n\nAssistant created successfully!\nChannels: ${Object.entries(formData.channels).filter(([_, enabled]) => enabled).map(([channel]) => channel).join(', ')}`);
    onClose();
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
              <h2 className="text-2xl font-semibold mb-2">Create New Assistant</h2>
              <p className="text-gray-600">Let's start with the basics</p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose assistant type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'voice', label: 'Voice Assistant', description: 'Handles phone calls and voice interactions' },
                    { id: 'chat', label: 'Chat Assistant', description: 'Responds to text messages and website chat' },
                    { id: 'unified', label: 'Unified Assistant', description: 'Handles both voice and text across all channels' }
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.type === type.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.type === type.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.type === type.id && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Quick start with a template:</p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleTemplateSelect('customer-support')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    📞 Customer Support
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('sales')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    💼 Sales Assistant
                  </button>
                  <button
                    onClick={() => handleTemplateSelect('technical')}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    🔧 Technical Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Connect Channels</h2>
              <p className="text-gray-600">Where will customers interact with your assistant?</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 'phone', icon: '📞', label: 'Phone calls', description: 'Customers can call and speak with your assistant' },
                { id: 'sms', icon: '💬', label: 'SMS messages', description: 'Respond to text messages automatically' },
                { id: 'website', icon: '🌐', label: 'Website chat', description: 'Add a chat widget to your website' },
                { id: 'whatsapp', icon: '📱', label: 'WhatsApp', description: 'Connect your WhatsApp Business account' }
              ].map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => handleChannelToggle(channel.id)}
                  className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className={`w-5 h-5 border-2 rounded ${
                    formData.channels[channel.id as keyof typeof formData.channels]
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.channels[channel.id as keyof typeof formData.channels] && (
                      <div className="text-white text-xs flex items-center justify-center h-full">✓</div>
                    )}
                  </div>
                  <div className="text-2xl">{channel.icon}</div>
                  <div>
                    <div className="font-medium">{channel.label}</div>
                    <div className="text-sm text-gray-500">{channel.description}</div>
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
              <h2 className="text-2xl font-semibold mb-2">Add Knowledge</h2>
              <p className="text-gray-600">Help your assistant answer questions about your business</p>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📁</div>
                <div className="font-medium mb-2">Upload documents</div>
                <div className="text-sm text-gray-500 mb-4">
                  PDFs, Word docs, or text files with your business information
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  Choose Files
                </button>
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xl">🔗</div>
                  <div className="font-medium">Add website URLs</div>
                </div>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-xl">🌐</div>
                  <div className="font-medium">Crawl website content</div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Automatically extract information from your website
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  Start Crawling
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Test Your Assistant</h2>
              <p className="text-gray-600">Try out your assistant before going live</p>
            </div>

            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🧪</div>
                <div className="font-medium mb-2">Test Interface</div>
                <div className="text-sm text-gray-500 mb-4">
                  This would show an embedded chat or phone testing interface
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  🧪 Start Test
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="font-medium mb-4">Ready to deploy?</div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeploy}
                  className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
                >
                  🚀 Deploy Assistant
                </button>
                <button
                  onClick={handleSaveDraft}
                  className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
                >
                  💾 Save as Draft
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
            <div className="text-sm text-gray-500">
              Step {currentStep} of {totalSteps}
            </div>
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
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        {currentStep < totalSteps && (
          <div className="flex justify-end p-6 border-t border-gray-200">
            <button
              onClick={handleNext}
              disabled={currentStep === 1 && (!formData.name || !formData.type)}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantCreationFlow;