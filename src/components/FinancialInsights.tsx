
import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, PiggyBank, ChevronRight, Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress";
import { FinancialSummary } from '@/api/chatService';

interface FinancialInsightsProps {
  onClose: () => void;
  data?: FinancialSummary;
}

const FinancialInsights = ({ onClose, data }: FinancialInsightsProps) => {
  const [expanded, setExpanded] = React.useState(false);
  
  // Default placeholder data when no data is provided
  const defaultInsights = [
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
  
  const insights = React.useMemo(() => {
    if (!data) return defaultInsights;
    
    return [
      ...data.spendingPatterns.map(pattern => ({
        title: `${pattern.category} Spending`,
        description: `${pattern.trend === 'up' ? 'Up' : pattern.trend === 'down' ? 'Down' : 'Stable'} from last month (${pattern.percentage}%)`,
        icon: TrendingUp,
        color: pattern.trend === 'up' ? "text-red-500" : pattern.trend === 'down' ? "text-green-500" : "text-blue-500",
        bgColor: pattern.trend === 'up' ? "bg-red-100" : pattern.trend === 'down' ? "bg-green-100" : "bg-blue-100",
        amount: `$${pattern.amount}`,
        data: pattern
      })),
      ...data.savingOpportunities.map(opportunity => ({
        title: `${opportunity.type} Savings`,
        description: opportunity.description,
        icon: PiggyBank,
        color: "text-green-500",
        bgColor: "bg-green-100",
        amount: `$${opportunity.amount}`,
        data: opportunity
      })),
      ...data.upcomingPayments.map(payment => ({
        title: `${payment.description}`,
        description: `Due in ${payment.dueIn} days`,
        icon: Clock,
        color: payment.dueIn <= 3 ? "text-red-500" : payment.dueIn <= 7 ? "text-amber-500" : "text-blue-500",
        bgColor: payment.dueIn <= 3 ? "bg-red-100" : payment.dueIn <= 7 ? "bg-amber-100" : "bg-blue-100",
        amount: `$${payment.amount}`,
        data: payment
      }))
    ];
  }, [data]);

  return (
    <motion.div
      className={`absolute bottom-4 left-4 ${expanded ? 'w-[90%] max-w-lg' : 'w-72'} bg-white rounded-lg shadow-lg border border-blue-200 overflow-hidden`}
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
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setExpanded(!expanded)}
            className="h-6 w-6 text-white hover:bg-blue-600 mr-1"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="h-6 w-6 text-white hover:bg-blue-600"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-2">
        {insights.slice(0, expanded ? undefined : 3).map((insight, index) => (
          <div 
            key={index}
            className="p-2 mb-2 rounded-md hover:bg-gray-50 cursor-pointer flex items-center"
          >
            <div className={`p-2 rounded-full ${insight.bgColor} mr-3 flex-shrink-0`}>
              <insight.icon className={`h-4 w-4 ${insight.color}`} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium truncate">{insight.title}</h4>
                {insight.amount && (
                  <span className={`text-sm font-semibold ${insight.color}`}>{insight.amount}</span>
                )}
              </div>
              <p className="text-xs text-gray-600 truncate">{insight.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 ml-1 flex-shrink-0" />
          </div>
        ))}
        
        {expanded && data && (
          <>
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-700 mb-1">Monthly Overview</h4>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Total Spending</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium">${data.monthlyTrends.totalSpending}</span>
                  {data.monthlyTrends.difference < 0 ? (
                    <span className="text-xs text-green-500 ml-1 flex items-center">
                      <ChevronDown className="h-3 w-3" />
                      ${Math.abs(data.monthlyTrends.difference)}
                    </span>
                  ) : data.monthlyTrends.difference > 0 ? (
                    <span className="text-xs text-red-500 ml-1 flex items-center">
                      <ChevronUp className="h-3 w-3" />
                      ${data.monthlyTrends.difference}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 ml-1">No change</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Top Category</span>
                <span className="text-xs font-medium">{data.monthlyTrends.topCategory}</span>
              </div>
            </div>
            
            {data.goalProgress && (
              <div className="mt-3 p-3 bg-amber-50 rounded-md">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-amber-700">{data.goalProgress.name}</h4>
                  <span className="text-xs text-amber-700">{data.goalProgress.percentage}%</span>
                </div>
                <Progress value={data.goalProgress.percentage} className="h-2 mb-1" />
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${data.goalProgress.current}</span>
                  <span>${data.goalProgress.target}</span>
                </div>
              </div>
            )}
            
            {data.healthImpact && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <h4 className="text-sm font-medium text-green-700 mb-1">Health Impact</h4>
                <p className="text-xs text-gray-700">{data.healthImpact}</p>
              </div>
            )}
          </>
        )}
        
        <div className="mt-2 p-2">
          <Button 
            variant="outline"
            size="sm"
            className="w-full text-blue-500 border-blue-200 hover:bg-blue-50"
            onClick={() => {/* Future: full financial report */}}
          >
            View Full Report
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default FinancialInsights;
