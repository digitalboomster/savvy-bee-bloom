
import { toast } from "@/hooks/use-toast";

export interface ChatResponse {
  reply: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const sendChatMessage = async (message: string): Promise<ChatResponse> => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    console.error('Chat API error:', error);
    toast({
      title: "Connection error",
      description: "Couldn't connect to Savvy Bee's brain. Please try again.",
      variant: "destructive"
    });
    return { 
      reply: "I'm having trouble connecting right now. Please try again in a moment.",
      error: error instanceof Error ? error.message : String(error) 
    };
  }
};

