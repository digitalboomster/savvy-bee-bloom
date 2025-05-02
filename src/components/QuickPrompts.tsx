
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickPromptsProps {
  onSelectPrompt: (prompt: string) => void;
}

const QuickPrompts = ({ onSelectPrompt }: QuickPromptsProps) => {
  const prompts = [
    "How can I start saving money?",
    "I'm feeling stressed about my finances",
    "Help me create a budget",
    "I want to track my spending"
  ];

  return (
    <div className="p-2 overflow-x-auto whitespace-nowrap flex gap-2 bg-gray-50 border-t border-b border-gray-200">
      {prompts.map((prompt, index) => (
        <Button
          key={index}
          variant="outline"
          className="bg-white border-amber-200 text-sm whitespace-nowrap hover:bg-amber-50 flex-shrink-0"
          onClick={() => onSelectPrompt(prompt)}
        >
          {prompt}
        </Button>
      ))}
    </div>
  );
};

export default QuickPrompts;
