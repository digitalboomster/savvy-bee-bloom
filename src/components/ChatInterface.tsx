
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Activity, Upload, Plus, X, MessageSquare, Sparkles } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickPrompts from './QuickPrompts';
import BeeCounselor from './BeeCounselor';
import FinancialInsights from './FinancialInsights';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

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
  const [showFinancialInsights, setShowFinancialInsights] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);

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
    
    // Show typing indicator
    setTypingIndicator(true);
    
    // Simulate bot response after a short delay
    setTimeout(() => {
      setTypingIndicator(false);
      
      // Sample responses based on common financial queries
      if (message.toLowerCase().includes('budget') || message.toLowerCase().includes('spend')) {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "I noticed you're thinking about your spending. Would you like me to analyze your financial patterns?", 
            isBot: true, 
            type: 'analyse',
            timestamp: botTimestamp 
          }
        ]);
        
        // Show financial insights after a delay
        setTimeout(() => {
          setShowFinancialInsights(true);
        }, 800);
        
        setTimeout(() => {
          const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setMessages(prev => [
            ...prev, 
            { 
              text: "Money concerns can sometimes feel overwhelming. Would you like to try a quick mindfulness exercise to help reduce financial stress?", 
              isBot: true, 
              type: 'heal',
              timestamp: botTimestamp 
            }
          ]);
        }, 1500);
      } else if (message.toLowerCase().includes('stress') || message.toLowerCase().includes('worry') || message.toLowerCase().includes('anxious')) {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "I notice you're feeling stressed. That's completely understandable! Financial concerns affect our wellbeing. Let's take a moment to check in with how you're feeling.", 
            isBot: true, 
            type: 'heal',
            timestamp: botTimestamp 
          }
        ]);
        
        setTimeout(() => {
          setShowBeeCounselor(true);
        }, 800);
      } else {
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "I'd love to help you with that! To give you more personalized guidance, I can analyze your spending patterns or offer relaxation techniques if you're feeling stressed about finances. What would you prefer?", 
            isBot: true, 
            type: 'default',
            timestamp: botTimestamp 
          }
        ]);
      }
    }, 1500);
  };

  const handleToolSelect = (toolType: string) => {
    setIsToolsOpen(false);
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    if (toolType === 'heal') {
      setShowBeeCounselor(true);
      setMessages(prev => [
        ...prev,
        {
          text: "Let's take a moment for your wellbeing. How are you feeling right now?",
          isBot: true,
          type: 'heal',
          timestamp
        }
      ]);
    } else if (toolType === 'analyse') {
      setShowFinancialInsights(true);
      setMessages(prev => [
        ...prev,
        {
          text: "I'd be happy to analyze your financial patterns. Here are some insights based on your recent activities:",
          isBot: true,
          type: 'analyse',
          timestamp
        }
      ]);
    } else if (toolType === 'upload') {
      setUploadDialogOpen(true);
    } else if (toolType === 'smart') {
      toast({
        title: "Smart Assistant Activated",
        description: "I'll now proactively suggest financial wellness tips based on your conversations.",
      });
      setMessages(prev => [
        ...prev,
        {
          text: "Smart Assistant activated! I'll now provide proactive financial insights and wellness suggestions tailored to your needs. Just chat normally, and I'll offer helpful tips when relevant.",
          isBot: true,
          type: 'default',
          timestamp
        }
      ]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Handle file upload logic here
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsProcessingUpload(true);
      const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      // Simulate processing
      setTimeout(() => {
        setIsProcessingUpload(false);
        setUploadDialogOpen(false);
        
        setMessages(prev => [
          ...prev,
          {
            text: `I've received your file: ${files[0].name}. Let me analyze this for you...`,
            isBot: true,
            type: 'analyse',
            timestamp
          }
        ]);
        
        // Simulate analysis completion
        setTimeout(() => {
          const analysisTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setMessages(prev => [
            ...prev,
            {
              text: "I've analyzed your statement and found several interesting patterns. Would you like to see a detailed breakdown?",
              isBot: true,
              type: 'analyse',
              timestamp: analysisTimestamp
            }
          ]);
          
          setShowFinancialInsights(true);
        }, 3000);
      }, 2000);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border shadow-md">
      <motion.div 
        className="bg-amber-500 text-white p-4 flex items-center justify-between"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          <motion.div 
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center mr-2"
            animate={{ 
              rotate: [0, 10, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 5
            }}
          >
            <span className="text-amber-500 font-bold text-sm">🐝</span>
          </motion.div>
          <h2 className="text-lg font-medium">Savvy Bee</h2>
        </div>
        <div className="text-xs opacity-80">
          {new Date().toLocaleDateString()}
        </div>
      </motion.div>
      
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
        
        {typingIndicator && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
              <span className="text-amber-900 font-bold text-xs">🐝</span>
            </div>
            <div className="bg-amber-50 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <motion.div 
                  className="w-2 h-2 bg-amber-300 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.1 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-amber-300 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
                />
                <motion.div 
                  className="w-2 h-2 bg-amber-300 rounded-full" 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
                />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        <AnimatePresence>
          {showBeeCounselor && (
            <BeeCounselor onClose={() => setShowBeeCounselor(false)} />
          )}
          
          {showFinancialInsights && (
            <FinancialInsights onClose={() => setShowFinancialInsights(false)} />
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
                <Button 
                  onClick={() => handleToolSelect('smart')} 
                  variant="outline" 
                  className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                >
                  <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                  <span>Smart Assistant</span>
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
                {isProcessingUpload ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mb-4"
                  >
                    <Upload className="w-8 h-8 text-amber-500" />
                  </motion.div>
                ) : (
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  {isProcessingUpload ? "Processing..." : <span className="font-semibold">Click to upload</span>}
                </p>
                {!isProcessingUpload && <p className="text-xs text-gray-500">PDF or JPG (High quality)</p>}
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept=".pdf,.jpg,.jpeg" 
                onChange={handleFileUpload}
                disabled={isProcessingUpload}
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
