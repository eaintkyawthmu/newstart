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
    <div className="w-full max-w-full overflow-x-visible space-y-4 mobile-lesson-content">
      {/* Introduction */}
      {lesson.introduction && (
        <div className="w-full max-w-full overflow-x-visible mobile-prose-lesson">
          <div className="prose prose-sm max-w-none w-full overflow-x-visible">
            <PortableText value={Array.isArray(lesson.introduction) ? lesson.introduction : [lesson.introduction]} />
          </div>
        </div>
      )}
      
      {/* Measurable Deliverables */}
      {lesson.measurableDeliverables && lesson.measurableDeliverables.length > 0 && (
        <div className="w-full max-w-full overflow-x-visible bg-blue-50 border border-blue-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift">
          <h2 className="font-semibold text-blue-800 mb-3 flex items-center text-sm sm:text-base">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
            {language === 'en' ? 'What You\'ll Achieve' : 'သင်ရရှိမည့်အရာများ'}
          </h2>
          <div className="w-full max-w-full overflow-x-visible space-y-2">
            {lesson.measurableDeliverables.map((deliverable: any) => (
              <label 
                key={deliverable._key} 
                className="w-full max-w-full overflow-x-visible flex items-start space-x-2 cursor-pointer hover:bg-blue-100 p-1 sm:p-2 rounded-md transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={completedTasks.includes(deliverable._key)}
                  onChange={(e) => handleTaskCompletion(deliverable._key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 flex-shrink-0 mt-1 transition-all duration-200"
                  aria-describedby={`task-${deliverable._key}-description`}
                />
                <div 
                  id={`task-${deliverable._key}-description`}
                  className={`w-full max-w-full overflow-x-visible text-sm text-gray-700 transition-all duration-200 mobile-text-full ${
                    completedTasks.includes(deliverable._key) ? 'line-through text-gray-500' : ''
                  }`}
                >
                  <div className="w-full max-w-full overflow-x-visible mobile-prose-lesson">
                    <PortableText value={Array.isArray(deliverable.description) ? deliverable.description : [deliverable.description]} />
                  </div>
                </div>
                {!deliverable.isOptional && (
                  <span className="ml-auto px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
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