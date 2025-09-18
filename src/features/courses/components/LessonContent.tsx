import React from 'react';
import { BookOpen, PlayCircle, FileText, Lightbulb, Target } from 'lucide-react';
import { LessonPage } from '../types/lessonTypes';
import { useLanguage } from '../../../contexts/LanguageContext';
import LessonIntroContent from './content/LessonIntroContent';
import LessonMainContent from './content/LessonMainContent';
import LessonTakeawaysContent from './content/LessonTakeawaysContent';
import LessonActionsContent from './content/LessonActionsContent';
import LessonQuizContent from './content/LessonQuizContent';

interface LessonContentProps {
  lesson: any;
  currentPage: LessonPage;
  completedTasks: string[];
  handleTaskCompletion: (taskKey: string, isCompleted: boolean) => void;
  userAnswers: any[];
  setUserAnswers: React.Dispatch<React.SetStateAction<any[]>>;
  quizSubmitted: boolean;
  setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  quizResults: any[];
  setQuizResults: React.Dispatch<React.SetStateAction<any[]>>;
  totalScore: number;
  setTotalScore: React.Dispatch<React.SetStateAction<number>>;
  language: string;
  trackEvent: (eventName: string, properties?: any) => void;
  startTime: Date;
  toggleCompletion: () => void;
}

const LessonContent: React.FC<LessonContentProps> = ({
  lesson,
  currentPage,
  completedTasks,
  handleTaskCompletion,
  userAnswers,
  setUserAnswers,
  quizSubmitted,
  setQuizSubmitted,
  quizResults,
  setQuizResults,
  totalScore,
  setTotalScore,
  language,
  trackEvent,
  startTime,
  toggleCompletion
}) => {
  const { language: contextLanguage } = useLanguage();
  
  // Get page title
  const getPageTitle = (): string => {
    switch (currentPage) {
      case 'intro':
        return contextLanguage === 'en' ? 'Introduction' : 'မိတ်ဆက်';
      case 'content':
        return contextLanguage === 'en' ? 'Lesson Content' : 'သင်ခန်းစာအကြောင်းအရာ';
      case 'takeaways':
        return contextLanguage === 'en' ? 'Key Takeaways' : 'အဓိကအချက်များ';
      case 'actions':
        return contextLanguage === 'en' ? 'Action Plan' : 'လုပ်ဆောင်ရန်အစီအစဉ်';
      case 'quiz':
        return contextLanguage === 'en' ? 'Knowledge Check' : 'အသိပညာ စစ်ဆေးခြင်း';
      default:
        return '';
    }
  };

  // Get page icon
  const getPageIcon = () => {
    switch (currentPage) {
      case 'intro':
        return <BookOpen className="h-5 w-5 text-blue-600" />;
      case 'content':
        return lesson?.type === 'video' 
          ? <PlayCircle className="h-5 w-5 text-blue-600" /> 
          : <FileText className="h-5 w-5 text-blue-600" />;
      case 'takeaways':
        return <Lightbulb className="h-5 w-5 text-green-600" />;
      case 'actions':
        return <Target className="h-5 w-5 text-purple-600" />;
      case 'quiz':
        return <FileText className="h-5 w-5 text-amber-600" />;
      default:
        return null;
    }
  };

  // Render the current page content
  const renderPageContent = () => {
    switch (currentPage) {
      case 'intro':
        return (
          <LessonIntroContent 
            lesson={lesson}
            completedTasks={completedTasks}
            handleTaskCompletion={handleTaskCompletion}
          />
        );
      
      case 'content':
        return (
          <LessonMainContent 
            lesson={lesson}
          />
        );
      
      case 'takeaways':
        return (
          <LessonTakeawaysContent 
            lesson={lesson}
          />
        );
      
      case 'actions':
        return (
          <LessonActionsContent 
            lesson={lesson}
            completedTasks={completedTasks}
            handleTaskCompletion={handleTaskCompletion}
            language={language}
          />
        );
      
      case 'quiz':
        return (
          <LessonQuizContent 
            lesson={lesson}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            quizSubmitted={quizSubmitted}
            setQuizSubmitted={setQuizSubmitted}
            quizResults={quizResults}
            setQuizResults={setQuizResults}
            totalScore={totalScore}
            setTotalScore={setTotalScore}
            language={language}
            trackEvent={trackEvent}
            startTime={startTime}
            toggleCompletion={toggleCompletion}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {/* Current Page Title - Mobile Only */}
      <div className="md:hidden flex items-center mb-3">
        {getPageIcon()}
        <h2 className="ml-2 text-base font-semibold text-gray-800">{getPageTitle()}</h2>
      </div>

      {/* Page Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-5 shadow-sm overflow-y-auto max-h-[calc(100vh-200px)]">
        {renderPageContent()}
      </div>
    </>
  );
};

export default LessonContent;