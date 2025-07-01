import React from 'react';
import { PortableText } from '@portabletext/react';
import { PlayCircle } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';

interface LessonMainContentProps {
  lesson: any;
}

const LessonMainContent: React.FC<LessonMainContentProps> = ({ lesson }) => {
  const { language } = useLanguage();
  
  const renderVideoContent = () => {
    if (!lesson) return null;

    // Handle YouTube videos with proper embed configuration
    if (lesson.videoType === 'youtube' && lesson.youtubeVideoId) {
      return (
        <div className="aspect-video w-full mb-5">
          <iframe
            src={`https://www.youtube.com/embed/${lesson.youtubeVideoId}?rel=0&modestbranding=1&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&controls=1&showinfo=0`}
            title={lesson.title}
            className="w-full h-full rounded-lg shadow-sm border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      );
    }

    // Handle self-hosted videos
    if (lesson.videoType === 'selfhosted' && lesson.selfHostedVideoUrl) {
      return (
        <div className="aspect-video w-full mb-5">
          <video
            src={lesson.selfHostedVideoUrl}
            controls
            className="w-full h-full rounded-lg shadow-sm"
            preload="metadata"
            poster="" // You can add a poster image URL here if available
          >
            <p className="text-gray-600 p-4">
              {language === 'en' 
                ? 'Your browser does not support the video tag.' 
                : 'သင့်ဘရောက်ဇာသည် ဗီဒီယိုကို ပံ့ပိုးမပေးပါ။'}
            </p>
          </video>
        </div>
      );
    }

    // Fallback for video lessons without proper video configuration
    return (
      <div className="aspect-video w-full mb-5 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
        <div className="text-center p-5">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">
            {language === 'en' ? 'Video content not available' : 'ဗီဒီယိုအကြောင်းအရာ မရရှိနိုင်ပါ'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {language === 'en' 
              ? 'Please check back later or contact support' 
              : 'နောက်မှ ပြန်စစ်ဆေးပါ သို့မဟုတ် အကူအညီဌာနသို့ ဆက်သွယ်ပါ'}
          </p>
        </div>
      </div>
    );
  };

  // Render exercise content if this is an exercise lesson
  const renderExerciseContent = () => {
    if (!lesson.associatedExercise) return null;
    
    const exercise = lesson.associatedExercise;
    
    return (
      <div className="space-y-6">
        <div className="prose max-w-none">
          <PortableText value={Array.isArray(exercise.description) ? exercise.description : [exercise.description]} />
        </div>
        
        {exercise.steps && exercise.steps.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {language === 'en' ? 'Exercise Steps' : 'လေ့ကျင့်ခန်းအဆင့်များ'}
            </h3>
            
            {exercise.steps.map((step: any, index: number) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">
                  {language === 'en' ? `Step ${index + 1}` : `အဆင့် ${index + 1}`}
                </h4>
                <div className="prose max-w-none text-gray-700">
                  <PortableText value={Array.isArray(step.instruction) ? step.instruction : [step.instruction]} />
                </div>
                
                {step.expectedOutcome && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>{language === 'en' ? 'Expected Outcome:' : 'မျှော်မှန်းရလဒ်:'}</strong> {step.expectedOutcome}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {exercise.estimatedTime && (
          <div className="flex items-center text-sm text-gray-600 mt-4">
            <span className="mr-2">⏱️</span>
            <span>
              {language === 'en' 
                ? `Estimated time: ${exercise.estimatedTime}` 
                : `ခန့်မှန်းအချိန်: ${exercise.estimatedTime}`}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (lesson.type === 'video') {
    return (
      <div className="space-y-5">
        {renderVideoContent()}
        
        {lesson.content && (
          <div className="prose prose-sm md:prose-base max-w-none overflow-visible">
            <PortableText value={Array.isArray(lesson.content) ? lesson.content : [lesson.content]} />
          </div>
        )}
      </div>
    );
  } else if (lesson.type === 'exercise') {
    return renderExerciseContent();
  } else {
    return (
      <div className="prose prose-sm md:prose-base max-w-none overflow-visible">
        <PortableText value={Array.isArray(lesson.content) ? lesson.content : [lesson.content]} />
      </div>
    );
  }
};

export default LessonMainContent;