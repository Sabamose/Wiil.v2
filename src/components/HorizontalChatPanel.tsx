import React, { useEffect, useRef } from 'react';
import { X, MessageCircle, Send } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const HorizontalChatPanel: React.FC = () => {
  const { isOpen, messages, isTyping, closeChat, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  return (
    <div className="fixed left-0 top-0 h-full w-96 bg-gradient-to-t from-teal-600/20 via-transparent to-white/95 border-r border-border z-[60] flex flex-col animate-slide-in-right">
      {/* Close Button Only */}
      <div className="absolute top-4 right-4 z-[70]">
        <button
          onClick={closeChat}
          className="flex items-center justify-center w-8 h-8 bg-white/60 hover:bg-white/80 text-teal-600 hover:text-teal-700 rounded-full shadow-sm transition-all hover:scale-105 border border-white/30 z-[80] relative"
          aria-label="Close chat"
          title="Close chat"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-2 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="text-brand-teal" size={20} />
            </div>
            <p className="text-muted-foreground text-sm">
              Start a conversation with Will
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Click the × in the header to close this chat
            </p>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-xs bg-accent rounded-2xl px-4 py-2">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-brand-teal rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-brand-teal rounded-full animate-bounce animation-delay-75"></div>
                  <div className="w-2 h-2 bg-brand-teal rounded-full animate-bounce animation-delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
};

export default HorizontalChatPanel;