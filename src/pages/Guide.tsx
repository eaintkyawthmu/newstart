import React from 'react';
import StepProgress from '../components/StepProgress';
import StepContent from '../components/StepContent';

const Guide = () => {
  return (
    <div>
      <StepProgress />
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6 md:p-8">
        <StepContent />
      </div>
    </div>
  );
};

export default Guide;