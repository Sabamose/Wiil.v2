import React, { useState, useEffect, useRef } from 'react';
import { X, User, Bot, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSimulationProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const ChatSimulation: React.FC<ChatSimulationProps> = ({ 
  isOpen, 
  onClose, 
  initialMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && initialMessage) {
      handleSendMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const simulateAssistantResponse = (userMessage: string): string => {
    const responses = [
      "I'd be happy to help you with that! Let me provide you with some detailed information about AI assistants and how they can benefit your business.",
      "That's an excellent question! Our AI assistants are designed to handle complex conversations and can be customized for various industries and use cases.",
      "Great choice! I can walk you through the process of creating your first AI assistant. It's quite straightforward and you'll be up and running in no time.",
      "Absolutely! Our platform offers comprehensive analytics and reporting features so you can track performance, conversation quality, and ROI.",
      "Perfect timing for that question! Let me explain how our pricing works and show you which plan would be the best fit for your needs.",
      "I love that you're thinking about this! Voice AI can significantly improve customer experience while reducing operational costs. Let me break this down for you.",
    ];

    // Simple keyword-based responses
    if (userMessage.toLowerCase().includes('price') || userMessage.toLowerCase().includes('cost')) {
      return "Our pricing is designed to be flexible and scale with your business. We offer usage-based pricing starting at $0.10 per minute for voice interactions, with volume discounts available. Would you like me to show you a detailed pricing breakdown?";
    }
    
    if (userMessage.toLowerCase().includes('demo') || userMessage.toLowerCase().includes('show')) {
      return "I'd love to give you a personalized demo! You can create your first assistant right here in just a few minutes. Should we start with a customer support assistant or would you prefer a different type?";
    }

    if (userMessage.toLowerCase().includes('assistant') || userMessage.toLowerCase().includes('create')) {
      return "Creating an AI assistant is really straightforward! You can choose from pre-built templates for common use cases like customer support, sales, or booking, or create a completely custom assistant. What type of business are you looking to automate?";
    }

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: simulateAssistantResponse(content),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      {/* Chat Panel */}
      <div className={`fixed left-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-140px)]">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-1">Welcome!</h4>
                <p className="text-sm text-gray-500">I'm here to help you with AI assistants. Ask me anything!</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600' 
                    : 'bg-teal-600'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[280px] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block p-3 rounded-lg text-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}>
                    {message.content}
                  </div>
                  <div className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 bg-gray-100 rounded-lg rounded-bl-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="resize-none min-h-[40px] max-h-[100px] pr-10"
                rows={1}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isTyping}
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white p-2 h-10 w-10"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Backdrop */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  );
};

export default ChatSimulation;