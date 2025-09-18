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
    <div className="space-y-3 sm:space-y-5 animate-fade-in w-full max-w-full break-words overflow-x-visible px-2 sm:px-4">
      {lesson.keyTakeaways && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift w-full max-w-full break-words overflow-x-visible">
          <h2 className="font-semibold text-green-800 mb-2 text-sm md:text-base flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" aria-hidden="true" />
            {language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ'}
          </h2>
          <div className="text-green-700 text-sm prose prose-sm max-w-none w-full break-words overflow-x-visible mobile-prose-override">
            <PortableText value={Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [lesson.keyTakeaways]} />
          </div>
        </div>
      )}

      {lesson.reflectionPrompts && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift w-full max-w-full break-words overflow-x-visible">
          <h2 className="font-semibold text-amber-800 mb-2 text-sm md:text-base">
            {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
          </h2>
          <div className="text-amber-700 text-sm prose prose-sm max-w-none w-full break-words overflow-x-visible mobile-prose-override">
            <PortableText value={Array.isArray(lesson.reflectionPrompts) ? lesson.reflectionPrompts : [lesson.reflectionPrompts]} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonTakeawaysContent;