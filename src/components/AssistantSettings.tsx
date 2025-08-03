import { useState } from "react";
import { ArrowLeft, TestTube, Copy, MoreHorizontal, Phone, MessageCircle, Globe, FileText, Plus, Settings2 } from "lucide-react";
import { BaseAssistant } from "@/types/assistant";
import TestAssistantModal from "./TestAssistantModal";

interface AssistantSettingsProps {
  assistant: BaseAssistant;
  onBack: () => void;
}

const AssistantSettings = ({ assistant, onBack }: AssistantSettingsProps) => {
  const [activeTab, setActiveTab] = useState("Agent");
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: assistant.type,
    industry: assistant.industry,
    useCase: assistant.useCase,
    language: "English",
    voice: "Professional Voice",
    firstMessage: "Hi, thanks for calling! How can I help you with your reservation today?",
    systemPrompt: "Describe the desired assistant (e.g., a customer support assistant for ElevenLabs)"
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
    setIsTestModalOpen(true);
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

  const renderSettingsTab = () => (
    <div className="max-w-lg space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assistant Language
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Choose the default language the assistant will communicate in.
        </p>
        <select
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option value="English">🇺🇸 English</option>
          <option value="Spanish">🇪🇸 Spanish</option>
          <option value="French">🇫🇷 French</option>
          <option value="German">🇩🇪 German</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Languages
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Specify additional languages which callers can choose from.
        </p>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option>Add additional languages</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Voice Settings
        </label>
        <p className="text-sm text-gray-600 mb-3">
          Configure the voice characteristics for your assistant.
        </p>
        <select
          value={formData.voice}
          onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        >
          <option value="Professional Voice">Professional Voice</option>
          <option value="Friendly Voice">Friendly Voice</option>
          <option value="Formal Voice">Formal Voice</option>
        </select>
      </div>
    </div>
  );

  const renderRoleTab = () => (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Message
        </label>
        <p className="text-sm text-gray-600 mb-3">
          The first message the assistant will say. If empty, the assistant will wait for the user to start the conversation.
        </p>
        <textarea
          value={formData.firstMessage}
          onChange={(e) => setFormData({ ...formData, firstMessage: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          System Prompt
        </label>
        <p className="text-sm text-gray-600 mb-3">
          The system prompt is used to determine the persona of the assistant and the context of the conversation.
        </p>
        <textarea
          value={formData.systemPrompt}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2"># Personality</h3>
        <p className="text-sm text-gray-700 mb-1">
          You are a reservation management assistant for the food and beverage industry.
        </p>
        <p className="text-sm text-gray-700">
          You are efficient, polite, and detail-oriented.
        </p>
      </div>
    </div>
  );

  const renderIntegrationTab = () => (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Connected Channels</h3>
        
        {/* Phone Channel */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Phone className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Phone</h4>
                <p className="text-sm text-gray-600">Connected and active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                Active
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Channel */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Chat</h4>
                <p className="text-sm text-gray-600">Connected and active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                Active
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Web Channel */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Web</h4>
                <p className="text-sm text-gray-600">Connected and active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-medium">
                Active
              </span>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus className="w-4 h-4" />
          Add Channel
        </button>
      </div>
    </div>
  );

  const renderKnowledgeBaseTab = () => (
    <div className="max-w-lg space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Knowledge Sources</h3>
        <p className="text-sm text-gray-600 mb-6">
          Connect knowledge sources to help your assistant answer questions about your business.
        </p>
        
        {/* Existing Knowledge Source */}
        <div className="border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Company Policies</h4>
                <p className="text-sm text-gray-600">Document • 3.7k chars</p>
              </div>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus className="w-4 h-4" />
          Add Knowledge Source
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "Agent":
        return renderAgentTab();
      case "Settings":
        return renderSettingsTab();
      case "Role":
        return renderRoleTab();
      case "Integration":
        return renderIntegrationTab();
      case "Knowledge Base":
        return renderKnowledgeBaseTab();
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

      {/* Test Assistant Modal */}
      <TestAssistantModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        assistant={assistant}
      />
    </div>
  );
};

export default AssistantSettings;