import { useState } from "react";
import { ArrowLeft, TestTube, Copy, MoreHorizontal } from "lucide-react";
import { BaseAssistant } from "@/types/assistant";

interface AssistantSettingsProps {
  assistant: BaseAssistant;
  onBack: () => void;
}

const AssistantSettings = ({ assistant, onBack }: AssistantSettingsProps) => {
  const [activeTab, setActiveTab] = useState("Agent");
  const [formData, setFormData] = useState({
    type: assistant.type,
    industry: assistant.industry,
    useCase: assistant.useCase
  });

  const tabs = ["Agent", "Settings", "Role", "Integration", "Knowledge Base"];

  const industries = [
    { id: 'retail', label: 'Retail & E-commerce' },
    { id: 'healthcare', label: 'Healthcare & Medical' },
    { id: 'finance', label: 'Finance & Banking' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'education', label: 'Education & Training' },
    { id: 'hospitality', label: 'Hospitality & Travel' },
    { id: 'automotive', label: 'Automotive' },
    { id: 'professional', label: 'Professional Services' },
    { id: 'technology', label: 'Technology & Software' },
    { id: 'government', label: 'Government & Public' },
    { id: 'food', label: 'Food & Beverage' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'fitness', label: 'Fitness & Wellness' },
    { id: 'legal', label: 'Legal Services' },
    { id: 'nonprofit', label: 'Non-Profit' },
    { id: 'media', label: 'Media & Entertainment' },
    { id: 'other', label: 'Other' }
  ];

  const useCases = [
    { id: 'customer-support', label: 'Customer Support' },
    { id: 'outbound-sales', label: 'Outbound Sales' },
    { id: 'learning', label: 'Learning and Development' },
    { id: 'scheduling', label: 'Scheduling' },
    { id: 'lead-qualification', label: 'Lead Qualification' },
    { id: 'answering-service', label: 'Answering Service' },
    { id: 'consultation', label: 'Consultation Scheduling' },
    { id: 'case-intake', label: 'Case Intake' },
    { id: 'legal-resources', label: 'Legal Resources' },
    { id: 'billing', label: 'Billing Inquiries' },
    { id: 'document-prep', label: 'Document Preparation' },
    { id: 'case-updates', label: 'Case Updates' },
    { id: 'other', label: 'Other' }
  ];

  const assistantTypes = [
    { id: 'Voice', label: 'Voice Assistant' },
    { id: 'Chat', label: 'Chat Assistant' },
    { id: 'Unified', label: 'Unified Assistant' }
  ];

  const handleTestAssistant = () => {
    alert(`🎙️ Testing ${assistant.name}...`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://app.example.com/assistant/${assistant.id}`);
    alert(`📋 Link copied to clipboard!`);
  };

  const renderAgentTab = () => (
    <div className="max-w-lg space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assistant Type
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as "Voice" | "Chat" | "Unified" })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          {assistantTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industry
        </label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          {industries.map((industry) => (
            <option key={industry.id} value={industry.id}>
              {industry.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Use Case
        </label>
        <select
          value={formData.useCase}
          onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          {useCases.map((useCase) => (
            <option key={useCase.id} value={useCase.id}>
              {useCase.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Agent":
        return renderAgentTab();
      case "Settings":
        return <div className="text-gray-500">Settings tab content will be implemented here</div>;
      case "Role":
        return <div className="text-gray-500">Role tab content will be implemented here</div>;
      case "Integration":
        return <div className="text-gray-500">Integration tab content will be implemented here</div>;
      case "Knowledge Base":
        return <div className="text-gray-500">Knowledge Base tab content will be implemented here</div>;
      default:
        return null;
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
            <button
              onClick={handleTestAssistant}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test Assistant
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-md">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Assistant Info Bar */}
      <div className="bg-gray-50 px-8 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4 text-gray-600">
          <span>Public</span>
          <span>assistant_abc123def456</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AssistantSettings;