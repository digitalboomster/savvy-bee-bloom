
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

const initialMessages = [
  { 
    text: "Hi there! I'm Savvy Bee 🐝, your financial wellness buddy. How can I help you today?", 
    isBot: true, 
    type: 'default' 
  }
];

const ChatInterface = () => {
  const [messages, setMessages] = useState(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages(prev => [...prev, { text: message, isBot: false, type: 'default' }]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      // Sample responses based on common financial queries
      if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('spend')) {
        setMessages(prev => [
          ...prev, 
          { 
            text: "Analyse Mode: Based on your message, I can see you're thinking about your spending. Without your actual data, I can't provide specific insights yet, but I'd be happy to help track your budget once you share some information!", 
            isBot: true, 
            type: 'analyse' 
          }
        ]);
        
        setTimeout(() => {
          setMessages(prev => [
            ...prev, 
            { 
              text: "Heal Mode: Thinking about money can sometimes feel overwhelming. Remember to take a deep breath and celebrate that you're taking positive steps by just asking about it! Would you like to try a quick 30-second breathing exercise?", 
              isBot: true, 
              type: 'heal' 
            }
          ]);
        }, 1000);
      } else if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('worry') || message.toLowerCase().includes('anxious')) {
        setMessages(prev => [
          ...prev, 
          { 
            text: "Heal Mode: I notice you're feeling a bit stressed. That's completely understandable! Financial concerns affect our mental wellbeing. Let's take a moment - try this: close your eyes, take 3 slow breaths, and imagine your worries floating away on a gentle breeze.", 
            isBot: true, 
            type: 'heal' 
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            text: "I'd love to help you with that! To give you more specific guidance about your finances or wellbeing, could you share a bit more about what's on your mind? Or perhaps you'd like some general tips on saving?", 
            isBot: true, 
            type: 'default' 
          }
        ]);
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border shadow-sm">
      <div className="bg-amber-500 text-white p-4 flex items-center">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
          <span className="text-amber-500 font-bold text-sm">🐝</span>
        </div>
        <h2 className="text-lg font-medium">Savvy Bee</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index}
            message={msg.text}
            isBot={msg.isBot}
            type={msg.type as any}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} />
      
      <div className="px-4 py-2 bg-gray-100 text-xs text-center text-gray-500">
        This chatbot is for guidance only; seek professional help when needed.
      </div>
    </div>
  );
};

export default ChatInterface;
