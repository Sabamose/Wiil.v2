import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  openChat: (initialMessage?: string) => void;
  closeChat: () => void;
  sendMessage: (content: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const openChat = (initialMessage?: string) => {
    setIsOpen(true);
    if (initialMessage) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages([userMessage]);
      
      // Simulate assistant response
      setIsTyping(true);
      setTimeout(() => {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: getRandomResponse(initialMessage),
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const sendMessage = (content: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Simulate assistant response
    setIsTyping(true);
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getRandomResponse(content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const getRandomResponse = (userMessage: string): string => {
    const responses = [
      "That's a great question! Let me help you explore the possibilities with Will's AI assistants.",
      "I'd be happy to walk you through that. Our platform makes it easy to create powerful voice assistants for your specific needs.",
      "Excellent! With Will, you can build assistants for customer support, sales, booking, and much more. What's your use case?",
      "Great question! Our AI assistants can handle complex conversations and integrate seamlessly with your existing systems.",
      "I love that question! Let me show you how our platform can transform your business operations with intelligent voice assistants.",
      "That's exactly what Will excels at! Our assistants can work 24/7, handling multiple calls simultaneously while maintaining quality.",
      "Perfect timing to ask! Our analytics show impressive ROI across various industries. Would you like to see some specific examples?",
      "That's one of our most popular features! The setup is surprisingly quick - most businesses are up and running within hours.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <ChatContext.Provider value={{
      isOpen,
      messages,
      isTyping,
      openChat,
      closeChat,
      sendMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};