import React, { useState } from 'react';
import { ArrowRight, Paperclip } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ChatSimulation from './ChatSimulation';

interface ChatInterfaceProps {
  className?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ className = '' }) => {
  const [inputValue, setInputValue] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastSentMessage, setLastSentMessage] = useState('');

  const handleSend = () => {
    const message = inputValue.trim();
    if (!message) return;
    
    setLastSentMessage(message);
    setInputValue('');
    setIsChatOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "What can I build with AI assistants?",
    "Show me pricing options",
    "How do I create my first assistant?",
    "What industries do you support?",
    "Can I see a quick demo?"
  ];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputValue(suggestion)}
            className="px-3 py-1.5 rounded-full border border-teal-200 text-sm bg-white hover:bg-teal-50 transition-colors text-teal-700"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Main chat input */}
      <div className="relative">
        <div className="rounded-3xl border border-teal-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <div className="p-4">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about AI assistants..."
              className="border-0 bg-transparent resize-none focus:ring-0 focus-visible:ring-0 text-base min-h-[60px]"
              rows={2}
            />
            
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-teal-600 hover:bg-teal-50"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Attach
              </Button>
              
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6"
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Simulation Modal */}
      <ChatSimulation
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        initialMessage={lastSentMessage}
      />
    </div>
  );
};

export default ChatInterface;