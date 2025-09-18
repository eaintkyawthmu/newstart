import React from 'react';
import { Award, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LessonHeaderProps {
  title: string;
  completed: boolean;
  toggleCompletion: () => void;
  navigateBack: () => void;
}

const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  title, 
  completed, 
  toggleCompletion, 
  navigateBack 
}) => {
  const { language } = useLanguage();
  
  return (
    <header 
      className="bg-white border-b border-gray-200 px-4 flex items-center justify-between min-h-[56px] py-2"
      role="banner"
    >
      <button
        onClick={navigateBack}
        className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 press-effect min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label={language === 'en' ? 'Go back' : 'နောက်သို့ပြန်သွားရန်'}
      >
        <ArrowLeft className="h-6 w-6 text-gray-600" aria-hidden="true" />
      </button>
      
      <h1 
        className="text-base font-semibold text-gray-900 max-w-[60%] leading-tight text-center px-2 sm:truncate"
        id="lesson-title"
      >
        {title}
      </h1>
      
      <button
        onClick={toggleCompletion}
        className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 press-effect min-h-[44px] min-w-[44px] flex items-center justify-center ${
          completed
            ? 'text-green-600 hover:bg-green-50 focus:ring-green-500'
            : 'text-gray-400 hover:bg-gray-50 focus:ring-blue-500'
        }`}
        aria-label={completed 
          ? (language === 'en' ? 'Mark as incomplete' : 'မပြီးဆုံးသေးသည်ဟု မှတ်သားရန်') 
          : (language === 'en' ? 'Mark as complete' : 'ပြီးဆုံးအဖြစ် မှတ်သားရန်')}
        aria-pressed={completed}
      >
        <Award className="h-6 w-6" aria-hidden="true" />
      </button>
    </header>
  );
};

export default LessonHeader;