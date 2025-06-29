import React from 'react';
import { BookOpen, PlayCircle, FileText, Lightbulb, Target } from 'lucide-react';
import { LessonPage } from '../types/lessonTypes';
import { useLanguage } from '../../../contexts/LanguageContext';

interface LessonNavigationProps {
  availablePages: LessonPage[];
  currentPage: LessonPage;
  goToPage: (page: LessonPage) => void;
  isDesktop?: boolean;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({ 
  availablePages, 
  currentPage, 
  goToPage,
  isDesktop = false
}) => {
  const { language } = useLanguage();
  
  if (isDesktop) {
    return (
      <div className="flex justify-center w-full">
        {availablePages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-4 py-3 font-medium text-sm border-b-2 ${
              currentPage === page
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {page === 'intro' && (language === 'en' ? 'Introduction' : 'မိတ်ဆက်')}
            {page === 'content' && (language === 'en' ? 'Lesson Content' : 'သင်ခန်းစာအကြောင်းအရာ')}
            {page === 'takeaways' && (language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ')}
            {page === 'actions' && (language === 'en' ? 'Action Plan' : 'လုပ်ဆောင်ရန်အစီအစဉ်')}
            {page === 'quiz' && (language === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း')}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-30 bg-white border-b border-gray-200 overflow-x-auto hide-scrollbar whitespace-nowrap px-2 py-1">
      <div className="flex">
        {availablePages.map((page) => (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={`px-3 py-2 mx-1 rounded-md text-sm font-medium flex items-center ${
              currentPage === page
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {page === 'intro' && <BookOpen className="h-4 w-4 mr-1.5" />}
            {page === 'content' && <PlayCircle className="h-4 w-4 mr-1.5" />}
            {page === 'takeaways' && <Lightbulb className="h-4 w-4 mr-1.5" />}
            {page === 'actions' && <Target className="h-4 w-4 mr-1.5" />}
            {page === 'quiz' && <FileText className="h-4 w-4 mr-1.5" />}
            
            {page === 'intro' && (language === 'en' ? 'Intro' : 'မိတ်ဆက်')}
            {page === 'content' && (language === 'en' ? 'Content' : 'အကြောင်းအရာ')}
            {page === 'takeaways' && (language === 'en' ? 'Takeaways' : 'အချက်များ')}
            {page === 'actions' && (language === 'en' ? 'Actions' : 'လုပ်ဆောင်ရန်')}
            {page === 'quiz' && (language === 'en' ? 'Quiz' : 'မေးခွန်းတို')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LessonNavigation;