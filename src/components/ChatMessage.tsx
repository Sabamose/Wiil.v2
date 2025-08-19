import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: ChatMessage;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-brand-teal text-brand-teal-foreground' 
            : 'bg-accent text-accent-foreground'
        }`}>
          {isUser ? <User size={14} /> : <Bot size={14} />}
        </div>

        {/* Message Content */}
        <div className={`px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-brand-teal text-brand-teal-foreground rounded-br-md' 
            : 'bg-accent text-accent-foreground rounded-bl-md'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          <p className={`text-xs mt-1 opacity-60 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;