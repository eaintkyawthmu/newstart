import React from 'react';
import { PortableText } from '@portabletext/react';
import { Target } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LessonIntroContentProps {
  lesson: any;
  completedTasks: string[];
  handleTaskCompletion: (taskKey: string, isCompleted: boolean) => void;
}

const LessonIntroContent: React.FC<LessonIntroContentProps> = ({
  lesson,
  completedTasks,
  handleTaskCompletion
}) => {
  const { language } = useLanguage();
  
  return (
    <div className="space-y-6">
      {/* Introduction */}
      {lesson.introduction && (
        <div className="prose max-w-none overflow-visible">
          <PortableText value={Array.isArray(lesson.introduction) ? lesson.introduction : [lesson.introduction]} />
        </div>
      )}
      
      {/* Measurable Deliverables */}
      {lesson.measurableDeliverables && lesson.measurableDeliverables.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
          <h2 className="font-semibold text-blue-800 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            {language === 'en' ? 'What You\'ll Achieve' : 'သင်ရရှိမည့်အရာများ'}
          </h2>
          <div className="space-y-3">
            {lesson.measurableDeliverables.map((deliverable: any) => (
              <label key={deliverable._key} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={completedTasks.includes(deliverable._key)}
                  onChange={(e) => handleTaskCompletion(deliverable._key, e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 mt-1"
                />
                <div className={`text-gray-700 ${completedTasks.includes(deliverable._key) ? 'line-through text-gray-500' : ''}`}>
                  <PortableText value={Array.isArray(deliverable.description) ? deliverable.description : [deliverable.description]} />
                </div>
                {!deliverable.isOptional && (
                  <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                    {language === 'en' ? 'Required' : 'လိုအပ်သည်'}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonIntroContent;