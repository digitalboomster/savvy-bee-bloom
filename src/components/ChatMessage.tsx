
import React from 'react';
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  type?: 'analyse' | 'heal' | 'default';
}

const ChatMessage = ({ message, isBot, type = 'default' }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isBot ? "justify-start" : "justify-end"
    )}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center mr-2 flex-shrink-0">
          <span className="text-amber-900 font-bold text-xs">🐝</span>
        </div>
      )}
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2",
        isBot 
          ? "bg-amber-100 text-gray-800" 
          : "bg-amber-500 text-white",
        type === 'analyse' && isBot && "border-l-4 border-blue-400",
        type === 'heal' && isBot && "border-l-4 border-green-400"
      )}>
        <p className="text-sm">{message}</p>
        {isBot && type !== 'default' && (
          <div className="text-xs mt-1 font-semibold text-gray-600">
            {type === 'analyse' ? "Analyse Mode" : "Heal Mode"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
