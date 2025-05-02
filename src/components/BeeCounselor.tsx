
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeeCounselorProps {
  onClose: () => void;
}

const BeeCounselor = ({ onClose }: BeeCounselorProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  
  const exercises = [
    {
      title: "Deep Breathing",
      content: "Let's take a few deep breaths together. Inhale... hold... exhale...",
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

  const handleNextStep = () => {
    if (currentStep < exercises.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleBreathingAnimation = () => {
    if (breathCount < 3) {
      setBreathCount(breathCount + 1);
    } else {
      handleNextStep();
    }
  };

  return (
    <motion.div 
      className="absolute bottom-4 right-4 w-64 bg-white rounded-lg shadow-lg border border-amber-200 overflow-hidden"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="bg-amber-500 text-white p-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mr-2">
            <span className="text-amber-500 font-bold text-xs">🐝</span>
          </div>
          <h3 className="text-sm font-medium">Bee Counselor</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-white hover:bg-amber-600">
          <X className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="p-4">
        <h4 className="font-medium mb-2">{exercises[currentStep].title}</h4>
        <p className="text-sm mb-4">{exercises[currentStep].content}</p>
        
        {currentStep === 0 && (
          <div className="flex flex-col items-center mb-4">
            <motion.div
              className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-2"
              animate={
                breathCount % 2 === 0 
                  ? { scale: [1, 1.5, 1], transition: { duration: 4 } }
                  : { opacity: 1 }
              }
              onClick={handleBreathingAnimation}
            >
              <span className="text-2xl">🐝</span>
            </motion.div>
            <p className="text-xs text-gray-500">
              {breathCount % 2 === 0 ? "Inhale..." : "Exhale..."}
            </p>
            <p className="text-xs mt-2">Tap the bee to continue ({breathCount}/6)</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button 
            onClick={currentStep === 0 ? handleBreathingAnimation : handleNextStep}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm"
            size="sm"
          >
            {currentStep === exercises.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default BeeCounselor;
