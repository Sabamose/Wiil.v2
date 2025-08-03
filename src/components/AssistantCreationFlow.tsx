import React, { useState } from 'react';
import { X, ChevronLeft, User, Building, Target, MessageSquare, TestTube, Rocket, Save, Phone, Globe, Smartphone, Upload, Brain, FileText } from 'lucide-react';

interface AssistantCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantCreationFlow: React.FC<AssistantCreationFlowProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    industry: '',
    useCase: '',
    name: '',
    type: 'Voice',
    channels: {
      phone: false,
      website: false,
      sms: false,
      whatsapp: false
    },
    behavior: '',
    knowledge: []
  });

  if (!isOpen) return null;

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
    handleNext();
  };

  const handleUseCaseSelect = (useCase: string) => {
    setFormData({ ...formData, useCase });
    handleNext();
  };

  const handleAssistantTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
    handleNext();
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

  const handleDeploy = () => {
    // Handle deployment logic
    console.log('Deploying assistant:', formData);
    onClose();
  };

  const handleSaveDraft = () => {
    // Handle save draft logic
    console.log('Saving draft:', formData);
    onClose();
  };

  const applyTemplate = (template: any) => {
    setFormData({
      ...formData,
      name: template.name,
      behavior: template.behavior
    });
    handleNext();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Select Industry</h2>
              <p className="text-gray-600">What industry will your assistant serve?</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'retail', name: 'Retail & E-commerce', icon: '🛍️' },
                { id: 'healthcare', name: 'Healthcare & Medical', icon: '🏥' },
                { id: 'finance', name: 'Finance & Banking', icon: '💰' },
                { id: 'real-estate', name: 'Real Estate', icon: '🏠' },
                { id: 'education', name: 'Education & Training', icon: '🎓' },
                { id: 'hospitality', name: 'Hospitality & Travel', icon: '🏨' },
                { id: 'automotive', name: 'Automotive', icon: '🚗' },
                { id: 'professional', name: 'Professional Services', icon: '💼' },
                { id: 'technology', name: 'Technology & Software', icon: '💻' },
                { id: 'government', name: 'Government & Public', icon: '🏛️' },
                { id: 'food', name: 'Food & Beverage', icon: '🍽️' },
                { id: 'other', name: 'Other', icon: '📋' }
              ].map((industry) => (
                <button
                  key={industry.id}
                  onClick={() => handleIndustrySelect(industry.id)}
                  className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
                >
                  <div className="text-2xl mb-2">{industry.icon}</div>
                  <div className="font-medium">{industry.name}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Primary Use Case</h2>
              <p className="text-gray-600">What will your assistant primarily help with?</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: 'customer-support', name: 'Customer Support', description: 'Handle inquiries, complaints, and support tickets' },
                { id: 'outbound-sales', name: 'Outbound Sales', description: 'Make sales calls and follow up with prospects' },
                { id: 'learning', name: 'Learning and Development', description: 'Training and educational assistance' },
                { id: 'scheduling', name: 'Scheduling', description: 'Appointment booking and calendar management' },
                { id: 'lead-qualification', name: 'Lead Qualification', description: 'Qualify and route potential customers' },
                { id: 'answering-service', name: 'Answering Service', description: 'Professional call answering and message taking' },
                { id: 'other', name: 'Other', description: 'Custom use case' }
              ].map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => handleUseCaseSelect(useCase.id)}
                  className="p-4 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-left"
                >
                  <div className="font-medium mb-1">{useCase.name}</div>
                  <div className="text-sm text-gray-500">{useCase.description}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Assistant Details</h2>
              <p className="text-gray-600">Provide basic information about your assistant</p>
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
                  placeholder="e.g., Customer Support Bot"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assistant Type
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Voice', name: 'Voice Only', description: 'Phone calls only', icon: Phone },
                    { id: 'Chat', name: 'Chat Only', description: 'Text-based only', icon: MessageSquare },
                    { id: 'Unified', name: 'Unified', description: 'Voice + chat combined', icon: Globe }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleAssistantTypeSelect(type.id)}
                      className={`p-4 border rounded-lg text-center ${
                        formData.type === type.id
                          ? 'border-black bg-gray-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <type.icon className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-gray-500">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleNext}
                disabled={!formData.name}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Choose Template</h2>
              <p className="text-gray-600">Start with a pre-built template or create from scratch</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleNext()}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-center"
              >
                <div className="text-gray-600 mb-2">✨</div>
                <div className="font-medium">Start from Scratch</div>
                <div className="text-sm text-gray-500">Build your assistant completely custom</div>
              </button>

              {[
                { id: 1, name: 'Customer Support Agent', behavior: 'Friendly and helpful customer service agent', category: 'Support' },
                { id: 2, name: 'Sales Development Rep', behavior: 'Professional sales representative', category: 'Sales' },
                { id: 3, name: 'Appointment Scheduler', behavior: 'Efficient scheduling assistant', category: 'Scheduling' }
              ].map((template) => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-4 border border-gray-300 rounded-lg hover:border-gray-400 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{template.behavior}</div>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">{template.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Define Behavior</h2>
              <p className="text-gray-600">Describe how your assistant should behave and respond</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Behavior Description
                </label>
                <textarea
                  value={formData.behavior}
                  onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
                  placeholder="Describe how your assistant should behave, its personality, tone, and approach to conversations..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="font-medium mb-2">Personality Traits</div>
                  <div className="space-y-2">
                    {['Friendly', 'Professional', 'Helpful', 'Patient'].map((trait) => (
                      <label key={trait} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{trait}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg">
                  <div className="font-medium mb-2">Communication Style</div>
                  <div className="space-y-2">
                    {['Formal', 'Casual', 'Empathetic', 'Direct'].map((style) => (
                      <label key={style} className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm">{style}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
              >
                Continue
              </button>
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
                <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="font-medium mb-2">Test Interface</div>
                <div className="text-sm text-gray-500 mb-4">
                  This would show an embedded chat or phone testing interface
                </div>
                <button className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 flex items-center gap-2 mx-auto">
                  <TestTube className="w-4 h-4" />
                  Start Test
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  Skip for Now
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

            <div className="space-y-4">
              {[
                { id: 'phone', icon: Phone, label: 'Phone calls', description: 'Purchase a phone number for your assistant' },
                { id: 'sms', icon: MessageSquare, label: 'SMS messages', description: 'Respond to text messages automatically' },
                { id: 'website', icon: Globe, label: 'Website chat', description: 'Add a chat widget to your website' },
                { id: 'whatsapp', icon: Smartphone, label: 'WhatsApp', description: 'Connect your WhatsApp Business account' }
              ].map((channel) => (
                <div key={channel.id}>
                  <div
                    onClick={() => handleChannelToggle(channel.id)}
                    className="flex items-center gap-4 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <div className={`w-5 h-5 border-2 rounded ${
                      formData.channels[channel.id as keyof typeof formData.channels]
                        ? 'border-gray-800 bg-gray-800'
                        : 'border-gray-300'
                    }`}>
                      {formData.channels[channel.id as keyof typeof formData.channels] && (
                        <div className="text-white text-xs flex items-center justify-center h-full">✓</div>
                      )}
                    </div>
                    <channel.icon className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">{channel.label}</div>
                      <div className="text-sm text-gray-500">{channel.description}</div>
                    </div>
                  </div>
                  {channel.id === 'phone' && formData.channels.phone && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-sm text-blue-800">
                        💡 Phone number can be purchased after assistant creation
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t pt-6">
              <div className="font-medium mb-4">Ready to create your assistant?</div>
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
            className="h-full bg-black transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};