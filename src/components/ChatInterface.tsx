
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Activity, Upload, Plus, Search, X, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickPrompts from './QuickPrompts';
import BeeCounselor from './BeeCounselor';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialMessages = [
  { 
    text: "Hi there! I'm Savvy Bee 🐝, your financial wellness buddy. How can I help you today?", 
    isBot: true, 
    type: 'default' as const,
    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
  }
];

type MessageType = {
  text: string;
  isBot: boolean;
  type: 'default' | 'analyse' | 'heal';
  timestamp: string;
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [showBeeCounselor, setShowBeeCounselor] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message: string) => {
    // Add user message
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { text: message, isBot: false, type: 'default', timestamp }]);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      // Sample responses based on common financial queries
      if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('spend')) {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "Analyse Mode: Based on your message, I can see you're thinking about your spending. Without your actual data, I can't provide specific insights yet, but I'd be happy to help track your budget once you share some information!", 
            isBot: true, 
            type: 'analyse',
            timestamp: botTimestamp 
          }
        ]);
        
        setTimeout(() => {
          const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setMessages(prev => [
            ...prev, 
            { 
              text: "Heal Mode: Thinking about money can sometimes feel overwhelming. Remember to take a deep breath and celebrate that you're taking positive steps by just asking about it! Would you like to try a quick 30-second breathing exercise?", 
              isBot: true, 
              type: 'heal',
              timestamp: botTimestamp 
            }
          ]);
        }, 1000);
      } else if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('worry') || message.toLowerCase().includes('anxious')) {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "Heal Mode: I notice you're feeling a bit stressed. That's completely understandable! Financial concerns affect our mental wellbeing. Let's take a moment - try this: close your eyes, take 3 slow breaths, and imagine your worries floating away on a gentle breeze.", 
            isBot: true, 
            type: 'heal',
            timestamp: botTimestamp 
          }
        ]);
      } else {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "I'd love to help you with that! To give you more specific guidance about your finances or wellbeing, could you share a bit more about what's on your mind? Or perhaps you'd like some general tips on saving?", 
            isBot: true, 
            type: 'default',
            timestamp: botTimestamp 
          }
        ]);
      }
    }, 1000);
  };

  const handleToolSelect = (toolType: string) => {
    setIsToolsOpen(false);
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (toolType === 'heal') {
      setShowBeeCounselor(true);
      setMessages(prev => [
        ...prev,
        {
          text: "Heal Mode: Let's take a moment for your wellbeing. How are you feeling right now? I can guide you through a quick mindfulness exercise or we can talk about what's on your mind.",
          isBot: true,
          type: 'heal',
          timestamp
        }
      ]);
    } else if (toolType === 'analyse') {
      setMessages(prev => [
        ...prev,
        {
          text: "Analyse Mode: I'd be happy to look at your financial patterns. What specifically would you like me to help with? Your spending habits, saving goals, or something else?",
          isBot: true,
          type: 'analyse',
          timestamp
        }
      ]);
    } else if (toolType === 'upload') {
      setUploadDialogOpen(true);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Handle file upload logic here
    const files = e.target.files;
    if (files && files.length > 0) {
      const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [
        ...prev,
        {
          text: `I've received your file: ${files[0].name}. I'll analyze it and get back to you shortly.`,
          isBot: true,
          type: 'analyse',
          timestamp
        }
      ]);
      setUploadDialogOpen(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border shadow-md">
      <div className="bg-amber-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2">
            <span className="text-amber-500 font-bold text-sm">🐝</span>
          </div>
          <h2 className="text-lg font-medium">Savvy Bee</h2>
        </div>
        <div className="text-xs opacity-80">
          {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 relative">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index}
            message={msg.text}
            isBot={msg.isBot}
            type={msg.type}
            timestamp={msg.timestamp}
          />
        ))}
        <div ref={messagesEndRef} />
        
        <AnimatePresence>
          {showBeeCounselor && (
            <BeeCounselor onClose={() => setShowBeeCounselor(false)} />
          )}
        </AnimatePresence>
      </div>
      
      <div className="border-t border-gray-200">
        <QuickPrompts onSelectPrompt={handlePromptSelect} />
        
        <div className="flex items-center gap-2 p-4 bg-white relative">
          <Popover open={isToolsOpen} onOpenChange={setIsToolsOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {isToolsOpen ? <X size={18} /> : <Plus size={18} />}
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-2 bg-white shadow-lg rounded-lg border-amber-100" 
              align="start" 
              sideOffset={10}
            >
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  onClick={() => handleToolSelect('heal')} 
                  variant="outline" 
                  className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                >
                  <Heart className="h-5 w-5 text-amber-500 mr-2" />
                  <span>Heal Me</span>
                </Button>
                <Button 
                  onClick={() => handleToolSelect('analyse')} 
                  variant="outline" 
                  className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                >
                  <Activity className="h-5 w-5 text-blue-500 mr-2" />
                  <span>Analyse Me</span>
                </Button>
                <Button 
                  onClick={() => handleToolSelect('upload')} 
                  variant="outline" 
                  className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                >
                  <Upload className="h-5 w-5 text-green-500 mr-2" />
                  <span>Upload</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Your Statement</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Upload your bank statement to get personalized financial insights.
              We accept PDF and high-quality JPG files.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF or JPG (High quality)</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg" 
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="px-4 py-2 bg-gray-100 text-xs text-center text-gray-500">
        This chatbot is for guidance only; seek professional help when needed.
      </div>
    </div>
  );
};

export default ChatInterface;
