
import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask Savvy Bee something..."
        className="flex-1 bg-gray-50 focus:ring-amber-300 border-gray-200"
        autoComplete="off"
      />
      <Button type="submit" size="icon" className="bg-amber-500 hover:bg-amber-600 shrink-0">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
