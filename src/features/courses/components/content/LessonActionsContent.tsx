import React from 'react';
import { PortableText } from '@portabletext/react';
import { Download, ExternalLink, Target } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LessonActionsContentProps {
  lesson: any;
  completedTasks: string[];
  handleTaskCompletion: (taskKey: string, isCompleted: boolean) => void;
  language: string;
}

const LessonActionsContent: React.FC<LessonActionsContentProps> = ({
  lesson,
  completedTasks,
  handleTaskCompletion,
  language
}) => {
  return (
    <div className="w-full max-w-full overflow-x-visible space-y-4 mobile-lesson-content">
      {lesson.actionableTasks && lesson.actionableTasks.length > 0 && (
        <div className="w-full max-w-full overflow-x-visible bg-purple-50 border border-purple-100 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift">
          <h2 className="font-semibold text-purple-800 mb-3 text-sm sm:text-base flex items-center">
            <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" aria-hidden="true" />
            {language === 'en' ? 'Your Action Plan' : 'သင့်လုပ်ဆောင်ရန် အစီအစဉ်'}
          </h2>
          <div className="w-full max-w-full overflow-x-visible space-y-2">
            {lesson.actionableTasks.map((task: any) => (
              <label 
                key={task._key} 
                className="w-full max-w-full overflow-x-visible flex items-start space-x-2 cursor-pointer hover:bg-purple-100 p-1 sm:p-2 rounded-md transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  checked={completedTasks.includes(task._key)}
                  onChange={(e) => handleTaskCompletion(task._key, e.target.checked)}
                  className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 flex-shrink-0 mt-1 transition-all duration-200"
                />
                <div className={`w-full max-w-full overflow-x-visible text-gray-700 text-sm transition-all duration-200 mobile-text-full ${
                  completedTasks.includes(task._key) ? 'line-through text-gray-500' : ''
                }`}>
                  <div className="w-full max-w-full overflow-x-visible mobile-prose-lesson">
                    <div className="prose prose-sm max-w-none w-full overflow-x-visible">
                      <PortableText value={Array.isArray(task.description) ? task.description : [task.description]} />
                    </div>
                  </div>
                </div>
                {!task.isOptional && (
                  <span className="ml-auto px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                    {language === 'en' ? 'Required' : 'လိုအပ်သည်'}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      {lesson.lessonResources && lesson.lessonResources.length > 0 && (
        <div className="w-full max-w-full overflow-x-visible border border-gray-200 rounded-lg p-2 sm:p-4 animate-slide-up hover-lift">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">
            {language === 'en' ? 'Additional Resources' : 'ထပ်ဆောင်းအရင်းအမြစ်များ'}
          </h2>
          <div className="w-full max-w-full overflow-x-visible space-y-2">
            {lesson.lessonResources.map((resource: any, index: number) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full max-w-full overflow-x-visible flex items-center p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 hover-lift press-effect focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={`Open ${resource.title} in new tab`}
              >
                {resource.type === 'download' || resource.resourceType === 'pdf' ? (
                  <Download className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" aria-hidden="true" />
                ) : (
                  <ExternalLink className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" aria-hidden="true" />
                )}
                <div className="w-full max-w-full overflow-x-visible mobile-text-full">
                  <p className="font-medium text-gray-800 text-sm">{resource.title}</p>
                  {resource.description && (
                    <p className="text-xs text-gray-600 mobile-text-full">{resource.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonActionsContent;