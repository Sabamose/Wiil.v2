import React, { useState } from 'react';
import { ArrowRight, Paperclip } from 'lucide-react';

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
    <div className="px-6 pt-6 pb-0 bg-background">
      <style>{`
        @keyframes shine { 0%{ transform: translateX(-120%) rotate(12deg)} 100%{ transform: translateX(120%) rotate(12deg)} }
      `}</style>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Will anything..."
            className="w-full resize-none rounded-2xl border border-input bg-background/50 px-4 py-4 pr-20 pb-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-all"
            rows={4}
            style={{ minHeight: '120px', maxHeight: '200px' }}
          />
          
          {/* Send button - positioned inside the textarea */}
          <button
            type="submit"
            disabled={!message.trim()}
            style={{
              position: "absolute",
              bottom: "8px",
              right: "8px",
              padding: "8px 12px", 
              borderRadius: 16, 
              color: "#fff", 
              fontWeight: 600,
              background: "linear-gradient(180deg, #0ea5a6 0%, #0d9488 100%)",
              border: 0, 
              cursor: "pointer", 
              boxShadow: "0 8px 18px rgba(13,148,136,.15)",
              zIndex: 10
            }}
            aria-label="Send"
          >
            <span style={{ 
              position: "absolute", 
              inset: 0, 
              overflow: "hidden", 
              borderRadius: 16, 
              pointerEvents: "none" 
            }}>
              <span style={{ 
                position: "absolute", 
                top: 0, 
                left: "-50%", 
                width: "50%", 
                height: "100%", 
                background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)", 
                filter: "blur(4px)", 
                animation: "shine 2.6s linear infinite" 
              }} />
            </span>
            <ArrowRight size={16} />
          </button>
          
          {/* Attach button - positioned inside the textarea */}
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