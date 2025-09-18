import React from 'react';
import { PortableText } from '@portabletext/react';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LessonTakeawaysContentProps {
  lesson: any;
}

const LessonTakeawaysContent: React.FC<LessonTakeawaysContentProps> = ({ lesson }) => {
  const { language } = useLanguage();
  
  return (
    <div className="w-full max-w-full overflow-x-visible space-y-4 mobile-lesson-content">
      {lesson.keyTakeaways && (
        <div className="w-full max-w-full overflow-x-visible bg-green-50 border border-green-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift">
          <h2 className="font-semibold text-green-800 mb-3 text-sm sm:text-base flex items-center">
            <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
            {language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ'}
          </h2>
          <div className="w-full max-w-full overflow-x-visible text-green-700 text-sm mobile-prose-lesson">
            <div className="prose prose-sm max-w-none w-full overflow-x-visible">
              <PortableText value={Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [lesson.keyTakeaways]} />
            </div>
          </div>
        </div>
      )}

      {lesson.reflectionPrompts && (
        <div className="w-full max-w-full overflow-x-visible bg-amber-50 border border-amber-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift">
          <h2 className="font-semibold text-amber-800 mb-3 text-sm sm:text-base">
            {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
          </h2>
          <div className="w-full max-w-full overflow-x-visible text-amber-700 text-sm mobile-prose-lesson">
            <div className="prose prose-sm max-w-none w-full overflow-x-visible">
              <PortableText value={Array.isArray(lesson.reflectionPrompts) ? lesson.reflectionPrompts : [lesson.reflectionPrompts]} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonTakeawaysContent;