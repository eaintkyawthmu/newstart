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
    <div className="space-y-6 animate-fade-in">
      {/* Introduction */}
      {lesson.introduction && (
        <div className="prose max-w-none overflow-x-auto animate-slide-up">
          <PortableText value={Array.isArray(lesson.introduction) ? lesson.introduction : [lesson.introduction]} />
        </div>
      )}
      
      {/* Measurable Deliverables */}
      {lesson.measurableDeliverables && lesson.measurableDeliverables.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 animate-slide-up hover-lift">
          <h2 className="font-semibold text-blue-800 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" aria-hidden="true" />
            {language === 'en' ? 'What You\'ll Achieve' : 'သင်ရရှိမည့်အရာများ'}
          </h2>
          <div className="space-y-3">
            {lesson.measurableDeliverables.map((deliverable: any) => (
              <label 
                key={deliverable._key} 
                className="flex items-start space-x-3 cursor-pointer hover:bg-blue-100 p-2 rounded-md transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={completedTasks.includes(deliverable._key)}
                  onChange={(e) => handleTaskCompletion(deliverable._key, e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 mt-1 transition-all duration-200"
                  aria-describedby={`task-${deliverable._key}-description`}
                />
                <div 
                  id={`task-${deliverable._key}-description`}
                  className={`text-gray-700 overflow-x-auto transition-all duration-200 ${
                    completedTasks.includes(deliverable._key) ? 'line-through text-gray-500' : ''
                  }`}
                >
                  <PortableText value={Array.isArray(deliverable.description) ? deliverable.description : [deliverable.description]} />
                </div>
                {!deliverable.isOptional && (
                  <span className="ml-auto px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0 animate-bounce-gentle">
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