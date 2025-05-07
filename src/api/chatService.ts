
import { toast } from "@/hooks/use-toast";

export interface ChatResponse {
  reply: string;
  error?: string;
}

export interface ReceiptAnalysisResult {
  merchantName: string;
  date: string;
  totalAmount: string;
  items?: Array<{item: string, price: number}>;
  category: string;
  savings?: string;
  paymentMethod?: string;
  spendingInsight: string;
  savingTip: string;
  healthInsight: string;
}

export interface FinancialSummary {
  spendingPatterns: Array<{
    category: string;
    amount: number;
    trend: "up" | "down" | "stable";
    percentage: number;
  }>;
  savingOpportunities: Array<{
    type: string;
    description: string;
    amount: number;
  }>;
  upcomingPayments: Array<{
    description: string;
    amount: number;
    dueIn: number;
  }>;
  monthlyTrends: {
    totalSpending: number;
    previousMonth: number;
    difference: number;
    topCategory: string;
  };
  healthImpact: string;
  goalProgress: {
    name: string;
    current: number;
    target: number;
    percentage: number;
  };
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

export const analyzeReceipt = async (imageData: string): Promise<ReceiptAnalysisResult> => {
  try {
    const response = await fetch(`${API_URL}/analyze-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze receipt');
    }

    return await response.json();
  } catch (error) {
    console.error('Receipt analysis error:', error);
    toast({
      title: "Receipt Analysis Failed",
      description: "Unable to analyze the receipt. Please try again with a clearer image.",
      variant: "destructive"
    });
    throw error;
  }
};

export const getFinancialSummary = async (userData?: any): Promise<FinancialSummary> => {
  try {
    const response = await fetch(`${API_URL}/financial-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get financial summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Financial summary error:', error);
    toast({
      title: "Financial Analysis Error",
      description: "Unable to generate your financial insights right now. Please try again.",
      variant: "destructive"
    });
    throw error;
  }
};

// Function to store receipt data in local storage for offline use
export const storeReceiptData = (receiptData: ReceiptAnalysisResult): void => {
  try {
    // Get existing receipt data
    const storedDataString = localStorage.getItem('savvyBee_receipts');
    let receipts: ReceiptAnalysisResult[] = [];
    
    if (storedDataString) {
      receipts = JSON.parse(storedDataString);
    }
    
    // Add new receipt with timestamp
    const receiptWithId = {
      ...receiptData,
      id: Date.now().toString()
    };
    
    // Add to beginning of array (most recent first)
    receipts.unshift(receiptWithId);
    
    // Store back in localStorage
    localStorage.setItem('savvyBee_receipts', JSON.stringify(receipts));
  } catch (error) {
    console.error('Error storing receipt data:', error);
  }
};

// Function to retrieve stored receipts
export const getStoredReceipts = (): ReceiptAnalysisResult[] => {
  try {
    const storedDataString = localStorage.getItem('savvyBee_receipts');
    if (storedDataString) {
      return JSON.parse(storedDataString);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving stored receipts:', error);
    return [];
  }
};
