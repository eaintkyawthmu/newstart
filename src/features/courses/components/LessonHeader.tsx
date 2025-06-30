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
    <div className="bg-white border-b border-gray-200 px-4 flex items-center justify-between h-14">
      <button
        onClick={navigateBack}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={language === 'en' ? 'Go back' : 'နောက်သို့ပြန်သွားရန်'}
      >
        <ArrowLeft className="h-6 w-6 text-gray-600" />
      </button>
      
      <h1 className="text-base font-semibold text-gray-900 truncate max-w-[60%]">
        {title}
      </h1>
      
      <button
        onClick={toggleCompletion}
        className={`p-2 rounded-lg transition-colors ${
          completed
            ? 'text-green-600'
            : 'text-gray-400'
        }`}
        aria-label={completed 
          ? (language === 'en' ? 'Mark as incomplete' : 'မပြီးဆုံးသေးသည်ဟု မှတ်သားရန်') 
          : (language === 'en' ? 'Mark as complete' : 'ပြီးဆုံးအဖြစ် မှတ်သားရန်')}
      >
        <Award className="h-6 w-6" />
      </button>
    </div>
  );
};

export default LessonHeader;