import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  CheckCircle,
  Lightbulb,
  HelpCircle
} from 'lucide-react';

interface GuideStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface InteractiveGuideProps {
  steps: GuideStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
}

const InteractiveGuide: React.FC<InteractiveGuideProps> = ({
  steps,
  isActive,
  onComplete,
  onSkip,
  autoStart = false
}) => {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && autoStart) {
      startGuide();
    }
  }, [isActive, autoStart]);

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      highlightElement(steps[currentStep].target);
    }
  }, [currentStep, isActive]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        onSkip();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isActive, onSkip]);

  const startGuide = () => {
    setCurrentStep(0);
    if (steps.length > 0) {
      highlightElement(steps[0].target);
    }
  };

  const highlightElement = (selector: string) => {
    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('guide-highlight');
    }

    // Find and highlight new element
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.classList.add('guide-highlight');
      setHighlightedElement(element);
      
      // Calculate tooltip position
      const rect = element.getBoundingClientRect();
      const step = steps[currentStep];
      
      let top = 0;
      let left = 0;
      
      switch (step.position) {
        case 'top':
          top = rect.top - 10;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - 10;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + 10;
          break;
        case 'center':
          top = window.innerHeight / 2;
          left = window.innerWidth / 2;
          break;
      }
      
      setTooltipPosition({ top, left });
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeGuide = () => {
    // Remove highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('guide-highlight');
    }
    setHighlightedElement(null);
    onComplete();
  };

  const skipGuide = () => {
    // Remove highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('guide-highlight');
    }
    setHighlightedElement(null);
    onSkip();
  };

  if (!isActive || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 pointer-events-none" />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 max-w-sm animate-scale-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          transform: currentStepData.position === 'center' 
            ? 'translate(-50%, -50%)' 
            : currentStepData.position === 'top'
              ? 'translate(-50%, -100%)'
              : currentStepData.position === 'bottom'
                ? 'translate(-50%, 0)'
                : currentStepData.position === 'left'
                  ? 'translate(-100%, -50%)'
                  : 'translate(0, -50%)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Target className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-600">
              {currentStep + 1} {language === 'en' ? 'of' : '/'} {steps.length}
            </span>
          </div>
          <button
            onClick={skipGuide}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={language === 'en' ? 'Skip guide' : 'လမ်းညွှန်မှု ကျော်ရန်'}
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 id="guide-title" className="text-lg font-semibold text-gray-900 mb-2">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Action button */}
        {currentStepData.action && (
          <div className="mb-4">
            <button
              onClick={currentStepData.action.onClick}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {currentStepData.action.label}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {language === 'en' ? 'Previous' : 'နောက်သို့'}
          </button>

          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                {language === 'en' ? 'Finish' : 'ပြီးဆုံး'}
              </>
            ) : (
              <>
                {language === 'en' ? 'Next' : 'ရှေ့သို့'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default InteractiveGuide;