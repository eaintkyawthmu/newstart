import React from 'react';
import { useStep } from '../contexts/StepContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const StepNavigation = () => {
  const { currentStep, nextStep, prevStep, markCompleted } = useStep();
  const { t } = useLanguage();

  const handleNext = () => {
    markCompleted(currentStep);
    nextStep();
  };

  return (
    <div className="mt-10 flex justify-between">
      <button
        onClick={prevStep}
        className={`flex items-center px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200 ${
          currentStep === 1 ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
        }`}
        disabled={currentStep === 1}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('button.previous')}
      </button>
      
      <button
        onClick={handleNext}
        className={`flex items-center px-6 py-2 rounded-lg text-white transition-colors duration-200 ${
          currentStep === 5
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-teal-600 hover:bg-teal-700'
        }`}
      >
        {currentStep === 5 ? (
          <>
            {t('button.finish')}
            <Check className="w-4 h-4 ml-2" />
          </>
        ) : (
          <>
            {t('button.next')}
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </button>
    </div>
  );
};

export default StepNavigation;