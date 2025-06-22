import React, { createContext, useState, useContext, ReactNode } from 'react';

export type StepType = 1 | 2 | 3 | 4 | 5 | 6;

type StepContextType = {
  currentStep: StepType;
  setStep: (step: StepType) => void;
  nextStep: () => void;
  prevStep: () => void;
  isCompleted: (step: StepType) => boolean;
  markCompleted: (step: StepType) => void;
};

const StepContext = createContext<StepContextType | undefined>(undefined);

export const useStep = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useStep must be used within a StepProvider');
  }
  return context;
};

type StepProviderProps = {
  children: ReactNode;
};

export const StepProvider = ({ children }: StepProviderProps) => {
  const [currentStep, setCurrentStep] = useState<StepType>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<StepType>>(new Set());

  const setStep = (step: StepType) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as StepType);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepType);
    }
  };

  const isCompleted = (step: StepType): boolean => {
    return completedSteps.has(step);
  };

  const markCompleted = (step: StepType) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      newSet.add(step);
      return newSet;
    });
  };

  return (
    <StepContext.Provider value={{ 
      currentStep, 
      setStep, 
      nextStep, 
      prevStep,
      isCompleted,
      markCompleted
    }}>
      {children}
    </StepContext.Provider>
  );
};