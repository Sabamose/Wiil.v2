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
      <div className="flex items-center justify-between p-4 border-b border-border bg-brand-teal text-brand-teal-foreground">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-teal-foreground/10 flex items-center justify-center">
            <MessageCircle size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Will Assistant</h3>
            <p className="text-xs opacity-80">AI-powered conversation</p>
          </div>
        </div>
        <button
          onClick={closeChat}
          className="p-2 hover:bg-brand-teal-foreground/20 rounded-lg transition-colors bg-brand-teal-foreground/10 border border-brand-teal-foreground/20"
          aria-label="Close chat"
        >
          <X size={18} className="font-bold" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-teal-50/50 to-background relative">
        {/* Floating Close Button */}
        <button
          onClick={closeChat}
          className="absolute top-2 right-2 z-10 p-2 bg-background/80 hover:bg-background border border-border rounded-full shadow-sm transition-all hover:scale-105"
          aria-label="Close chat"
        >
          <X size={16} className="text-muted-foreground hover:text-foreground" />
        </button>
        
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="text-brand-teal" size={20} />
            </div>
            <p className="text-muted-foreground text-sm">
              Start a conversation with Will
            </p>
            <p className="text-xs text-muted-foreground/60 mt-2">
              Click the × to close this chat
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