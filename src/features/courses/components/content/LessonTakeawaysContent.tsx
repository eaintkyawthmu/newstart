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
    <div className="space-y-5">
      {lesson.keyTakeaways && (
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <h2 className="font-semibold text-green-800 mb-2 text-sm md:text-base flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            {language === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ'}
          </h2>
          <div className="text-green-700 text-sm overflow-x-auto">
            <PortableText value={Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [lesson.keyTakeaways]} />
          </div>
        </div>
      )}

      {lesson.reflectionPrompts && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mt-5">
          <h2 className="font-semibold text-amber-800 mb-2 text-sm md:text-base">
            {language === 'en' ? 'Reflect & Grow' : 'ပြန်လည်သုံးသပ်ပြီး တိုးတက်ပါ'}
          </h2>
          <div className="text-amber-700 text-sm overflow-x-auto">
            <PortableText value={Array.isArray(lesson.reflectionPrompts) ? lesson.reflectionPrompts : [lesson.reflectionPrompts]} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonTakeawaysContent;