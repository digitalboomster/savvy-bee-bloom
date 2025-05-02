
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isRecording) {
      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Request microphone permissions
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          // In a real app, we'd use this stream for recording
          toast({
            title: "Recording started",
            description: "Speak clearly into your microphone.",
          });
        })
        .catch(err => {
          toast({
            title: "Microphone access denied",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive"
          });
          setIsRecording(false);
        });
    } else {
      // Clear timer when recording stops
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingTime(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const toggleRecording = () => {
    // If currently recording, stop and process
    if (isRecording) {
      setIsRecording(false);
      
      // Simulate transcription completion after a short delay
      setTimeout(() => {
        toast({
          title: "Voice processed",
          description: "Transcription complete!",
        });
        setMessage(prev => prev + "I'm wondering about my budget. ");
      }, 700);
    } else {
      // Start new recording
      setIsRecording(true);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

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
            isInputFocused ? "bg-white ring-2 ring-amber-200" : "bg-gray-50",
            isRecording && "pl-16"
          )}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          autoComplete="off"
        />
        
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div 
                className="absolute inset-y-0 left-0 pl-3 flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-xs font-medium text-gray-500">
                  {formatRecordingTime(recordingTime)}
                </span>
              </motion.div>
            </>
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

export default ChatInput;
