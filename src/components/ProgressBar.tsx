import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

type ProgressBarProps = {
  progress: number;
  showLabel?: boolean;
};

const ProgressBar = ({ progress, showLabel = true }: ProgressBarProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="w-full bg-gray-200 rounded-full h-4">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-gray-600">
          {language === 'en' 
            ? `${progress}% Complete`
            : `${progress}% ပြီးစီး`}
        </p>
      )}
    </div>
  );
};

export default ProgressBar;