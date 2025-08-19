import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-6 border-t border-border/50 bg-background">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Will anything..."
            className="w-full resize-none rounded-2xl border border-input bg-background/50 px-4 py-4 pr-14 pb-12 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
            rows={3}
            style={{ minHeight: '80px', maxHeight: '160px' }}
          />
          
          {/* Send button integrated inside */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute bottom-2 right-2 p-2.5 rounded-full transition-all duration-200 hover:scale-105 shadow-sm"
            style={{
              background: 'linear-gradient(180deg, #0ea5a6 0%, #0d9488 100%)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 10px 22px rgba(13,148,136,.18)'
            }}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
          
          {/* Attach button - simplified */}
          <button
            type="button"
            className="absolute bottom-2 left-3 p-2 text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/50 rounded-lg transition-colors"
            aria-label="Attach file"
          >
            <Paperclip size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;