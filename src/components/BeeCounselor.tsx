
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeeCounselorProps {
  onClose: () => void;
}

const BeeCounselor = ({ onClose }: BeeCounselorProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [mood, setMood] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const exercises = [
    {
      title: "How are you feeling?",
      content: "Take a moment to check in with yourself...",
      isChoice: true,
    },
    {
      title: "Deep Breathing",
      content: "Let's take a few deep breaths together. Click the bee to begin.",
      isBreathing: true,
    },
    {
      title: "Quick Reflection",
      content: "What's one small financial win you've had recently?",
    },
    {
      title: "Gratitude",
      content: "Think of something you're grateful for today, no matter how small.",
    }
  ];

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (breathCount >= 5) {
          setCurrentStep(currentStep + 1);
          setBreathCount(0);
        } else {
          setBreathCount(breathCount + 1);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, breathCount, currentStep]);

  const handleNextStep = () => {
    if (currentStep < exercises.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBreathingAnimation = () => {
    if (!isAnimating) {
      setIsAnimating(true);
    }
  };

  const selectMood = (selectedMood: string) => {
    setMood(selectedMood);
    setTimeout(() => handleNextStep(), 500);
  };

  return (
    <motion.div 
      className="absolute bottom-4 right-4 w-72 bg-white rounded-lg shadow-lg border border-amber-200 overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-amber-500 text-white p-3 flex items-center justify-between">
        <div className="flex items-center">
          <motion.div 
            className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2"
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <span className="text-amber-500 font-bold text-xs">🐝</span>
          </motion.div>
          <h3 className="text-sm font-medium">Bee Counselor</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white hover:bg-amber-600">
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="p-4">
        <h4 className="font-medium mb-3">{exercises[currentStep].title}</h4>
        <p className="text-sm mb-4">{exercises[currentStep].content}</p>
        
        {exercises[currentStep].isChoice && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button 
              variant="outline" 
              onClick={() => selectMood('good')}
              className="flex flex-col items-center p-3 hover:bg-green-50 border-green-200"
            >
              <span className="text-xl mb-1">😊</span>
              <span className="text-xs">Good</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => selectMood('okay')}
              className="flex flex-col items-center p-3 hover:bg-blue-50 border-blue-200"
            >
              <span className="text-xl mb-1">😐</span>
              <span className="text-xs">Okay</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => selectMood('stressed')}
              className="flex flex-col items-center p-3 hover:bg-amber-50 border-amber-200"
            >
              <span className="text-xl mb-1">😓</span>
              <span className="text-xs">Stressed</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => selectMood('anxious')}
              className="flex flex-col items-center p-3 hover:bg-red-50 border-red-200"
            >
              <span className="text-xl mb-1">😰</span>
              <span className="text-xs">Anxious</span>
            </Button>
          </div>
        )}
        
        {exercises[currentStep].isBreathing && (
          <div className="flex flex-col items-center mb-4">
            <motion.div
              className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-3"
              animate={
                isAnimating 
                  ? { 
                      scale: [1, 1.5, 1], 
                      backgroundColor: ['rgb(254 243 199)', 'rgb(251 207 232)', 'rgb(254 243 199)']
                    }
                  : {} 
              }
              transition={{ duration: 3, ease: "easeInOut" }}
              onClick={handleBreathingAnimation}
            >
              <motion.div
                animate={isAnimating ? { rotate: 360 } : {}}
                transition={{ duration: 3, ease: "linear" }}
              >
                <span className="text-3xl">🐝</span>
              </motion.div>
            </motion.div>
            <p className="text-sm font-medium text-amber-600">
              {isAnimating ? (breathCount % 2 === 0 ? "Inhale deeply..." : "Exhale slowly...") : "Tap the bee to breathe"}
            </p>
            <div className="w-full bg-gray-200 h-1 mt-3 rounded-full">
              <motion.div 
                className="h-1 bg-amber-500 rounded-full" 
                initial={{ width: "0%" }} 
                animate={{ width: `${(breathCount / 6) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-2 text-gray-500">{breathCount}/6 breaths</p>
          </div>
        )}
        
        {!exercises[currentStep].isChoice && !exercises[currentStep].isBreathing && (
          <div className="flex justify-end">
            <Button 
              onClick={handleNextStep}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm"
              size="sm"
            >
              {currentStep === exercises.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BeeCounselor;
