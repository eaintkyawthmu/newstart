import React from 'react';
import { useStep } from '../contexts/StepContext';
import { 
  WelcomeChecklist, 
  BudgetPlanner, 
  CreditBuilderTips, 
  TaxBasics, 
  PersonalFinance 
} from '../features/guide-content';
import KnowledgeLibrary from './KnowledgeLibrary';
import StepNavigation from './StepNavigation';

const StepContent = () => {
  const { currentStep } = useStep();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeChecklist />;
      case 2:
        return <BudgetPlanner />;
      case 3:
        return <CreditBuilderTips />;
      case 4:
        return <TaxBasics />;
      case 5:
        return <PersonalFinance />;
      case 6:
        return <KnowledgeLibrary />;
      default:
        return <WelcomeChecklist />;
    }
  };

  return (
    <div className="animate-fadeIn">
      {renderStep()}
      <StepNavigation />
    </div>
  );
};

export default StepContent;