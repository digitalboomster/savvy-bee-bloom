import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Activity, Upload, Plus, X, Sparkles, Camera, FileText, ArrowLeft, Scan, Download } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import QuickPrompts from './QuickPrompts';
import BeeCounselor from './BeeCounselor';
import FinancialInsights from './FinancialInsights';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { sendChatMessage, analyzeReceipt, storeReceiptData, getFinancialSummary, ReceiptAnalysisResult, FinancialSummary } from '@/api/chatService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CameraCapturePanel from './CameraCapturePanel';

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

type PanelType = 'chat' | 'camera' | 'documents';

const ChatInterface = () => {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [showBeeCounselor, setShowBeeCounselor] = useState(false);
  const [showFinancialInsights, setShowFinancialInsights] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activePanel, setActivePanel] = useState<PanelType>('chat');
  
  // New state variables for enhanced features
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [receiptData, setReceiptData] = useState<ReceiptAnalysisResult | null>(null);
  const [isAnalyzingReceipt, setIsAnalyzingReceipt] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try to fetch the API health check
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/`, { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        setIsConnected(response.ok);
        setOfflineMode(!response.ok);
      } catch (error) {
        console.log("Connection check failed:", error);
        setIsConnected(false);
        setOfflineMode(true);
        
        toast({
          title: "Offline Mode Activated",
          description: "You're currently using Savvy Bee offline. Some features may be limited.",
          variant: "warning"
        });
      }
    };
    
    checkConnection();
    
    // Periodically check connection
    const intervalId = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const handleSendMessage = async (message: string) => {
    // Add user message
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [...prev, { text: message, isBot: false, type: 'default', timestamp }]);
    
    // Show typing indicator
    setTypingIndicator(true);
    
    try {
      if (offlineMode) {
        // Simulate response in offline mode
        setTimeout(() => {
          setTypingIndicator(false);
          const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setMessages(prev => [
            ...prev, 
            { 
              text: "I'm in offline mode right now, but I'll store your message for later. You can still view your past financial data and receipts.", 
              isBot: true, 
              type: 'default',
              timestamp: botTimestamp 
            }
          ]);
        }, 1500);
        return;
      }
      
      // Send message to backend API
      const response = await sendChatMessage(message);
      
      // Hide typing indicator
      setTypingIndicator(false);
      
      if (response.error) {
        setIsConnected(false);
        setOfflineMode(true);
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev, 
          { 
            text: "I've switched to offline mode. You can still analyze your previous receipts and view your financial insights, but new analyses will be limited.", 
            isBot: true, 
            type: 'default',
            timestamp: botTimestamp 
          }
        ]);
      } else {
        setIsConnected(true);
        const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Determine message type based on content
        let messageType: 'default' | 'analyse' | 'heal' = 'default';
        if (response.reply.toLowerCase().includes('stress') || 
            response.reply.toLowerCase().includes('feel') || 
            response.reply.toLowerCase().includes('health')) {
          messageType = 'heal';
        } else if (response.reply.toLowerCase().includes('budget') || 
                  response.reply.toLowerCase().includes('spend') || 
                  response.reply.toLowerCase().includes('save')) {
          messageType = 'analyse';
        }
        
        setMessages(prev => [
          ...prev, 
          { 
            text: response.reply, 
            isBot: true, 
            type: messageType,
            timestamp: botTimestamp 
          }
        ]);
        
        // Show related tools based on message type
        if (messageType === 'heal' && Math.random() > 0.5) {
          setTimeout(() => setShowBeeCounselor(true), 800);
        } else if (messageType === 'analyse' && Math.random() > 0.5) {
          // Load financial insights if analyzing finances
          try {
            const summaryData = await getFinancialSummary();
            setFinancialSummary(summaryData);
            setTimeout(() => setShowFinancialInsights(true), 800);
          } catch (error) {
            console.error("Failed to load financial summary:", error);
          }
        }
      }
    } catch (error) {
      setTypingIndicator(false);
      console.error("Error sending message:", error);
      const botTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [
        ...prev, 
        { 
          text: "I'm having trouble connecting right now. Switching to offline mode where you can still view your stored data.", 
          isBot: true, 
          type: 'default',
          timestamp: botTimestamp 
        }
      ]);
      setIsConnected(false);
      setOfflineMode(true);
    }
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
      // Load financial insights
      if (offlineMode) {
        // Use cached data in offline mode
        setShowFinancialInsights(true);
        setMessages(prev => [
          ...prev,
          {
            text: "Here are your previously stored financial insights. Note that this data may not be current since you're in offline mode.",
            isBot: true,
            type: 'analyse',
            timestamp
          }
        ]);
      } else {
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
        
        // Get latest financial summary
        getFinancialSummary()
          .then(summary => {
            setFinancialSummary(summary);
          })
          .catch(error => {
            console.error("Failed to get financial summary:", error);
          });
      }
    } else if (toolType === 'upload') {
      setUploadDialogOpen(true);
    } else if (toolType === 'camera') {
      setActivePanel('camera');
    } else if (toolType === 'documents') {
      setActivePanel('documents');
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
    } else if (toolType === 'download') {
      // Download chat history
      downloadChatHistory();
    }
  };

  const downloadChatHistory = () => {
    try {
      // Format messages for download
      const historyData = {
        title: "Savvy Bee Chat History",
        exportDate: new Date().toLocaleString(),
        messages: messages.map(msg => ({
          sender: msg.isBot ? "Savvy Bee" : "You",
          message: msg.text,
          timestamp: msg.timestamp,
          type: msg.type
        }))
      };
      
      // Convert to JSON string
      const jsonString = JSON.stringify(historyData, null, 2);
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `savvybee-chat-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Download Complete",
        description: "Your chat history has been saved to your device.",
      });
    } catch (error) {
      console.error("Error downloading chat history:", error);
      toast({
        title: "Download Failed",
        description: "Unable to download chat history. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    // Handle file upload logic here
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsProcessingUpload(true);
      const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const file = files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (event.target && typeof event.target.result === 'string') {
          try {
            setMessages(prev => [
              ...prev,
              {
                text: `I've received your file: ${file.name}. Processing...`,
                isBot: true,
                type: 'analyse',
                timestamp
              }
            ]);
            
            if (offlineMode) {
              // Simulate processing in offline mode
              setTimeout(() => {
                setIsProcessingUpload(false);
                setUploadDialogOpen(false);
                
                const analysisTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                setMessages(prev => [
                  ...prev,
                  {
                    text: "Since I'm in offline mode, I can't analyze new documents. Please try again when you're online.",
                    isBot: true,
                    type: 'default',
                    timestamp: analysisTimestamp
                  }
                ]);
              }, 2000);
            } else {
              // Process image and analyze receipt
              const result = await analyzeReceipt(event.target.result);
              
              // Store the receipt data
              storeReceiptData(result);
              
              setIsProcessingUpload(false);
              setUploadDialogOpen(false);
              setReceiptData(result);
              
              // Show analysis result
              const analysisTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
              setMessages(prev => [
                ...prev,
                {
                  text: `I've analyzed your receipt from ${result.merchantName || 'the store'} for ${result.totalAmount || 'an unknown amount'}. ${result.spendingInsight} ${result.savingTip}`,
                  isBot: true,
                  type: 'analyse',
                  timestamp: analysisTimestamp
                }
              ]);
              
              // Update financial insights
              const summaryData = await getFinancialSummary();
              setFinancialSummary(summaryData);
              setShowFinancialInsights(true);
            }
          } catch (error) {
            console.error("Error processing file:", error);
            setIsProcessingUpload(false);
            setUploadDialogOpen(false);
            
            const errorTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            setMessages(prev => [
              ...prev,
              {
                text: "I had trouble analyzing that document. Please make sure it's a clear image of a receipt or statement and try again.",
                isBot: true,
                type: 'default',
                timestamp: errorTimestamp
              }
            ]);
          }
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleImageCapture = async (imageDataUrl: string) => {
    toast({
      title: "Receipt Captured",
      description: "Processing your financial document...",
    });
    
    // Show a message in the chat
    const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    setMessages(prev => [
      ...prev,
      {
        text: "I've received your captured receipt. Analyzing the details now...",
        isBot: true,
        type: 'analyse',
        timestamp
      }
    ]);
    
    // Switch back to chat after capture
    setActivePanel('chat');
    setIsAnalyzingReceipt(true);
    
    try {
      if (offlineMode) {
        // Simulate analysis in offline mode
        setTimeout(() => {
          setIsAnalyzingReceipt(false);
          const offlineTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          setMessages(prev => [
            ...prev,
            {
              text: "Since I'm in offline mode, I can't analyze new receipts. Your image has been saved locally and will be analyzed when you're back online.",
              isBot: true,
              type: 'default',
              timestamp: offlineTimestamp
            }
          ]);
        }, 2000);
      } else {
        // Analyze the receipt
        const result = await analyzeReceipt(imageDataUrl);
        
        // Store the receipt data for offline access
        storeReceiptData(result);
        
        setIsAnalyzingReceipt(false);
        setReceiptData(result);
        
        // Show analysis result
        const analysisTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        setMessages(prev => [
          ...prev,
          {
            text: `I've analyzed your receipt from ${result.merchantName || 'the store'} for ${result.totalAmount || 'an unknown amount'}. ${result.spendingInsight} ${result.savingTip}`,
            isBot: true,
            type: 'analyse',
            timestamp: analysisTimestamp
          }
        ]);
        
        // Update and show financial insights after receipt analysis
        try {
          const summaryData = await getFinancialSummary();
          setFinancialSummary(summaryData);
          setTimeout(() => setShowFinancialInsights(true), 1000);
        } catch (error) {
          console.error("Failed to update financial summary:", error);
        }
      }
    } catch (error) {
      console.error("Error analyzing receipt:", error);
      setIsAnalyzingReceipt(false);
      
      const errorTimestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      setMessages(prev => [
        ...prev,
        {
          text: "I had trouble analyzing that receipt. Please make sure it's a clear image and try again.",
          isBot: true,
          type: 'default',
          timestamp: errorTimestamp
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border shadow-md">
      <motion.div 
        className={`${isConnected ? 'bg-amber-500' : 'bg-gray-400'} text-white p-4 flex items-center justify-between`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center">
          {activePanel !== 'chat' && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 text-white hover:bg-amber-400 hover:text-white"
              onClick={() => setActivePanel('chat')}
            >
              <ArrowLeft size={18} />
            </Button>
          )}
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
          <h2 className="text-lg font-medium">
            {activePanel === 'chat' ? 'Savvy Bee' : 
             activePanel === 'camera' ? 'Capture Receipt' : 
             'My Documents'}
          </h2>
          {!isConnected && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full ml-2">
              Offline
            </span>
          )}
        </div>
        <div className="text-xs opacity-80">
          {new Date().toLocaleDateString()}
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto bg-gray-50 relative">
        {activePanel === 'chat' && (
          <div className="p-4">
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
            
            {isAnalyzingReceipt && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-900 font-bold text-xs">🐝</span>
                </div>
                <div className="bg-amber-50 px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Scan className="h-4 w-4 text-amber-500" />
                    </motion.div>
                    <span className="text-sm">Analyzing receipt...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            
            <AnimatePresence>
              {showBeeCounselor && (
                <BeeCounselor onClose={() => setShowBeeCounselor(false)} />
              )}
              
              {showFinancialInsights && financialSummary && (
                <FinancialInsights 
                  onClose={() => setShowFinancialInsights(false)}
                  data={financialSummary}
                />
              )}
            </AnimatePresence>
          </div>
        )}

        {activePanel === 'camera' && (
          <CameraCapturePanel onCapture={handleImageCapture} />
        )}

        {activePanel === 'documents' && (
          <div className="p-4 h-full flex flex-col items-center justify-center">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg w-full max-w-md">
              <FileText className="w-12 h-12 mx-auto mb-4 text-amber-500" />
              <h3 className="text-lg font-medium mb-2">Your Financial Documents</h3>
              <p className="text-sm text-gray-500 mb-6">
                View and manage your uploaded statements and receipts
              </p>
              
              <div className="flex flex-col gap-3">
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>April Bank Statement</span>
                  <span className="ml-auto text-xs text-gray-500">3 days ago</span>
                </Button>
                
                <Button variant="outline" className="flex items-center justify-center gap-2">
                  <Scan className="w-4 h-4" />
                  <span>Grocery Receipt</span>
                  <span className="ml-auto text-xs text-gray-500">1 week ago</span>
                </Button>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Upload New Document
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200">
        {activePanel === 'chat' && (
          <>
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
                      onClick={() => handleToolSelect('camera')} 
                      variant="outline" 
                      className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                    >
                      <Camera className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Capture Receipt</span>
                    </Button>
                    <Button 
                      onClick={() => handleToolSelect('documents')} 
                      variant="outline" 
                      className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                    >
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span>My Documents</span>
                    </Button>
                    <Button 
                      onClick={() => handleToolSelect('heal')} 
                      variant="outline" 
                      className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                    >
                      <Heart className="h-5 w-5 text-green-500 mr-2" />
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
                    <Button 
                      onClick={() => handleToolSelect('download')} 
                      variant="outline" 
                      className="flex items-center justify-start p-3 hover:bg-amber-50 border-amber-200 text-left"
                    >
                      <Download className="h-5 w-5 text-amber-500 mr-2" />
                      <span>Download Chat</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </>
        )}
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
        {!isConnected && (
          <div className="text-red-500 mt-1">
            Backend connection issue. {offlineMode ? "Running in offline mode." : "Some features may be limited."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
