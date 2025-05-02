
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Heart, Activity, FileText } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  type?: 'analyse' | 'heal' | 'default';
  timestamp?: string;
}

const ChatMessage = ({ message, isBot, type = 'default', timestamp }: ChatMessageProps) => {
  const getIcon = () => {
    if (type === 'analyse') return <Activity className="h-3 w-3 text-blue-500" />;
    if (type === 'heal') return <Heart className="h-3 w-3 text-green-500" />;
    return null;
  };

  const getBubbleStyle = () => {
    if (isBot) {
      switch (type) {
        case 'analyse':
          return "bg-blue-50 text-gray-800 border-l-4 border-blue-400";
        case 'heal':
          return "bg-green-50 text-gray-800 border-l-4 border-green-400";
        default:
          return "bg-amber-50 text-gray-800";
      }
    } else {
      return "bg-amber-500 text-white";
    }
  };

  return (
    <motion.div 
      className={cn(
        "flex w-full mb-4 group",
        isBot ? "justify-start" : "justify-end"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
          <motion.span 
            className="text-amber-900 font-bold text-xs"
            animate={{ rotateZ: [0, 5, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
          >
            🐝
          </motion.span>
        </div>
      )}
      <div className="flex flex-col max-w-[80%]">
        <div className={cn(
          "rounded-2xl px-4 py-2 mb-1 shadow-sm",
          getBubbleStyle()
        )}>
          <p className="text-sm">{message}</p>
          {isBot && type !== 'default' && (
            <div className="flex items-center mt-1 pt-1 border-t border-gray-200 text-xs font-medium text-gray-600">
              {getIcon()}
              <span className="ml-1">{type === 'analyse' ? "Analysis" : "Wellness"}</span>
            </div>
          )}
        </div>
        
        <div className={cn(
          "text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity",
          isBot ? "ml-1" : "mr-1 text-right"
        )}>
          {timestamp || new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
