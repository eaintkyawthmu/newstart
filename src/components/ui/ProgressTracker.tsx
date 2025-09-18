import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { CheckCircle, Circle, Award, TrendingUp } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  current?: boolean;
  locked?: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
  className?: string;
  onStepClick?: (stepId: string) => void;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  orientation = 'horizontal',
  showDescriptions = false,
  className = '',
  onStepClick
}) => {
  const { language } = useLanguage();
  
  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Progress Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">
              {language === 'en' ? 'Progress Overview' : 'တိုးတက်မှု အကျဉ်းချုပ်'}
            </h3>
            <span className="text-sm text-gray-600">
              {completedCount}/{steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            {Math.round(progressPercentage)}% {language === 'en' ? 'Complete' : 'ပြီးဆုံး'}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {steps.map((step, index) => (
            <div key={step.id} className="relative flex items-start pb-6 last:pb-0">
              {/* Step indicator */}
              <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                step.completed 
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.current
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : step.locked
                      ? 'bg-gray-100 border-gray-300 text-gray-400'
                      : 'bg-white border-gray-300 text-gray-600'
              }`}>
                {step.completed ? (
                  <CheckCircle className="h-6 w-6" />
                ) : step.locked ? (
                  <Circle className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              
              {/* Step content */}
              <div className="ml-4 flex-1">
                <button
                  onClick={() => !step.locked && onStepClick?.(step.id)}
                  disabled={step.locked}
                  className={`text-left w-full ${
                    step.locked ? 'cursor-not-allowed' : onStepClick ? 'cursor-pointer hover:bg-gray-50' : ''
                  } p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <h4 className={`font-medium ${
                    step.completed ? 'text-green-700' :
                    step.current ? 'text-blue-700' :
                    step.locked ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {step.title}
                  </h4>
                  {showDescriptions && step.description && (
                    <p className={`text-sm mt-1 ${
                      step.locked ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {step.description}
                    </p>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={`${className}`}>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center text-center">
            <button
              onClick={() => !step.locked && onStepClick?.(step.id)}
              disabled={step.locked}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-200 ${
                step.completed 
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.current
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : step.locked
                      ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-500 cursor-pointer'
              } ${onStepClick && !step.locked ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' : ''}`}
            >
              {step.completed ? (
                <CheckCircle className="h-6 w-6" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </button>
            
            <h4 className={`text-xs font-medium max-w-20 ${
              step.completed ? 'text-green-700' :
              step.current ? 'text-blue-700' :
              step.locked ? 'text-gray-400' : 'text-gray-700'
            }`}>
              {step.title}
            </h4>
            
            {showDescriptions && step.description && (
              <p className={`text-xs mt-1 max-w-24 ${
                step.locked ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {step.description}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
            <span>{Math.round(progressPercentage)}% {language === 'en' ? 'Complete' : 'ပြီးဆုံး'}</span>
          </div>
          {completedCount === steps.length && (
            <div className="flex items-center text-green-600">
              <Award className="h-4 w-4 mr-1" />
              <span>{language === 'en' ? 'All Done!' : 'အားလုံးပြီးပါပြီ!'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;