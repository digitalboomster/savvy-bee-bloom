
import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, PiggyBank, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinancialInsightsProps {
  onClose: () => void;
}

const FinancialInsights = ({ onClose }: FinancialInsightsProps) => {
  // Simulated financial data - in a real app this would come from analysis
  const insights = [
    {
      title: "Spending Patterns",
      description: "Your food expenses are 15% higher than last month",
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      title: "Saving Opportunity",
      description: "You could save $120/month by reducing subscription services",
      icon: PiggyBank,
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      title: "Upcoming Payment",
      description: "Rent payment of $950 due in 3 days",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-100"
    }
  ];

  return (
    <motion.div
      className="absolute bottom-4 left-4 w-72 bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-blue-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2">
            <TrendingUp className="h-3 w-3 text-blue-500" />
          </div>
          <h3 className="text-sm font-medium">Financial Insights</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white hover:bg-blue-600">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="p-2">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="p-2 mb-2 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full ${insight.bgColor} mr-3`}>
                <insight.icon className={`h-4 w-4 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium">{insight.title}</h4>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
            </div>
          </div>
        ))}
        
        <div className="mt-2 p-2">
          <Button 
            variant="outline"
            size="sm"
            className="w-full text-blue-500 border-blue-200 hover:bg-blue-50"
            onClick={() => {/* Future: full financial report */}}
          >
            View Full Report
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialInsights;
