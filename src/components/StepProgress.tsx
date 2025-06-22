import React from 'react';
import { useStep } from '../contexts/StepContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, Circle, BookOpen } from 'lucide-react';

const StepProgress = () => {
  const { currentStep, setStep, isCompleted } = useStep();
  const { t } = useLanguage();

  const steps = [
    { id: 1, title: t('step.1.title') },
    { id: 2, title: t('step.2.title') },
    { id: 3, title: t('step.3.title') },
    { id: 4, title: t('step.4.title') },
    { id: 5, title: t('step.5.title') },
  ];

  const isLibraryView = currentStep === 6;

  if (isLibraryView) {
    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setStep(1)}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Circle className="w-5 h-5 mr-2" />
          {t('button.back')}
        </button>
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <BookOpen className="w-6 h-6 mr-2 text-teal-600" />
          {t('library.title')}
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div 
              className={`flex flex-col items-center cursor-pointer group ${
                currentStep === step.id ? 'text-teal-600' : 'text-gray-500'
              }`}
              onClick={() => setStep(step.id as 1 | 2 | 3 | 4 | 5)}
            >
              <div className="flex items-center justify-center">
                {isCompleted(step.id as 1 | 2 | 3 | 4 | 5) ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : currentStep === step.id ? (
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center">
                    {step.id}
                  </div>
                ) : (
                  <Circle className="w-8 h-8 text-gray-300 group-hover:text-gray-400" />
                )}
              </div>
              <p className="mt-2 text-sm font-medium">
                {step.title}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.id || isCompleted(step.id as 1 | 2 | 3 | 4 | 5) ? 'bg-teal-500' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Mobile view */}
      <div className="flex md:hidden items-center justify-between px-4">
        <span className="text-sm font-medium text-gray-700">
          {t('step')} {currentStep} {t('of')} 5
        </span>
        <span className="text-sm font-medium text-teal-600">
          {steps.find(step => step.id === currentStep)?.title}
        </span>
      </div>
      <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden md:hidden">
        <div 
          className="h-full bg-teal-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default StepProgress;