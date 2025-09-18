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
        <div className="w-full max-w-full aspect-video mb-4 animate-fade-in">
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
        <div className="w-full max-w-full aspect-video mb-4 animate-fade-in">
          <video
            src={lesson.selfHostedVideoUrl}
            controls
            className="w-full h-full rounded-lg shadow-sm"
            preload="metadata"
            poster=""
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
      <div className="w-full max-w-full aspect-video mb-4 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 animate-fade-in">
        <div className="text-center p-4">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-600 font-medium text-sm">
            {language === 'en' 
              ? 'Video content will be available here' 
              : 'ဗီဒီယိုအကြောင်းအရာ ဤနေရာတွင် ရရှိနိုင်ပါမည်'}
          </p>
        </div>
      </div>
    );
  };

  if (!lesson || !lesson.content) {
    return (
      <div className="w-full max-w-full px-2 py-4">
        <p className="text-gray-600 text-sm">
          {language === 'en' ? 'Loading lesson content...' : 'စာသင်ခန်းအကြောင်းအရာ ဖွင့်နေသည်...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-visible">
      {/* Video Content */}
      {renderVideoContent()}
      
      {/* Main Content */}
      <div className="w-full max-w-full overflow-x-visible mobile-lesson-content">
        <div className="prose prose-sm max-w-none w-full overflow-x-visible mobile-prose-lesson">
          <PortableText 
            value={lesson.content} 
            components={{
              block: {
                normal: ({ children }) => (
                  <p className="mb-3 text-sm leading-6 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </p>
                ),
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold mb-3 text-gray-900 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-base font-semibold mb-2 text-gray-900 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-medium mb-2 text-gray-900 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </h3>
                ),
              },
              marks: {
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-800">{children}</em>
                ),
              },
              list: {
                bullet: ({ children }) => (
                  <ul className="list-disc pl-4 mb-3 space-y-1 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </ul>
                ),
                number: ({ children }) => (
                  <ol className="list-decimal pl-4 mb-3 space-y-1 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </ol>
                ),
              },
              listItem: {
                bullet: ({ children }) => (
                  <li className="text-sm leading-6 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </li>
                ),
                number: ({ children }) => (
                  <li className="text-sm leading-6 w-full max-w-full overflow-x-visible mobile-text-full">
                    {children}
                  </li>
                ),
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LessonMainContent;