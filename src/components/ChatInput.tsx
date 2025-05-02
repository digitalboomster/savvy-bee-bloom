
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleRecording = () => {
    // In a real app, this would integrate with Web Speech API
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate speech-to-text after 2 seconds
      setTimeout(() => {
        setMessage(prev => prev + "I'm wondering about my budget ");
        setIsRecording(false);
      }, 2000);
    }
  };

  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask Savvy Bee something..."
          className={cn(
            "flex-1 pr-10 transition-all duration-300 border-gray-200",
            isInputFocused ? "bg-white ring-2 ring-amber-200" : "bg-gray-50"
          )}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          autoComplete="off"
        />
        
        <AnimatePresence>
          {isRecording && (
            <motion.div 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <motion.div 
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Button 
        type="button" 
        size="icon" 
        variant="ghost"
        onClick={toggleRecording}
        className={cn(
          "shrink-0",
          isRecording ? "text-red-500 bg-red-50" : "text-gray-500"
        )}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      <Button type="submit" size="icon" className="bg-amber-500 hover:bg-amber-600 shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

import { cn } from "@/lib/utils";
export default ChatInput;
