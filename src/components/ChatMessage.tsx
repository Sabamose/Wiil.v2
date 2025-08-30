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
      <div className={`max-w-[80%] relative`}>
        {/* Small logo icon for assistant messages */}
        {!isUser && (
          <div className="absolute -top-1 -left-1 flex items-center gap-1 z-10">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/lovable-uploads/4193c744-eea1-483c-8ffa-ae648bbabc98.png" alt="Will" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-brand-teal bg-white/90 px-1.5 py-0.5 rounded-full shadow-sm">Will</span>
          </div>
        )}
        
        {/* Message Content */}
        <div className={`px-4 py-2 rounded-2xl ${
          isUser 
            ? 'bg-teal-600/20 text-teal-800 rounded-br-md border border-teal-600/30' 
            : 'bg-white/40 text-gray-700 rounded-bl-md border border-white/50 backdrop-blur-sm'
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