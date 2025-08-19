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
    <div className="fixed left-0 top-0 h-full w-96 bg-background border-r border-border z-40 flex flex-col animate-slide-in-right">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-brand-teal text-brand-teal-foreground relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-teal-foreground/10 flex items-center justify-center">
            <MessageCircle size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Will Assistant</h3>
            <p className="text-xs opacity-80">AI-powered conversation</p>
          </div>
        </div>
        
        {/* Close Button - Well positioned and visible */}
        <button
          onClick={closeChat}
          className="flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white text-brand-teal hover:text-brand-teal-hover rounded-full shadow-sm transition-all hover:scale-105 border border-white/50 z-50 relative"
          aria-label="Close chat"
          title="Close chat"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-teal-50/50 to-background">
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