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
        <div className="aspect-video w-full mb-3 sm:mb-5 animate-fade-in">
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
        <div className="aspect-video w-full mb-3 sm:mb-5 animate-fade-in">
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
      <div className="aspect-video w-full mb-3 sm:mb-5 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 animate-fade-in">
        <div className="text-center p-3 sm:p-5">
          <PlayCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-2 sm:mb-3" aria-hidden="true" />
          <p className="text-gray-600 font-medium text-sm sm:text-base">
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
      <div className="w-full max-w-full px-2 sm:px-4 py-4">
        <p className="text-gray-600 text-sm sm:text-base">
          {language === 'en' ? 'Loading lesson content...' : 'စာသင်ခန်းအကြောင်းအရာ ဖွင့်နေသည်...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full break-words overflow-x-visible">
      {/* Video Content */}
      {renderVideoContent()}
      
      {/* Main Content */}
      <div className="w-full max-w-full px-3 sm:px-4 break-words overflow-x-visible">
        <div className="prose prose-sm sm:prose-base max-w-none w-full break-words overflow-x-visible">
          <div className="text-sm sm:text-base leading-relaxed sm:leading-normal">
            <PortableText 
              value={lesson.content} 
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="mb-2 sm:mb-3 text-sm sm:text-base leading-6 sm:leading-7 break-words overflow-x-visible w-full max-w-full">
                      {children}
                    </p>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 break-words w-full max-w-full">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base sm:text-xl font-semibold mb-2 text-gray-900 break-words w-full max-w-full">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm sm:text-lg font-medium mb-1 sm:mb-2 text-gray-900 break-words w-full max-w-full">
                      {children}
                    </h3>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900 break-words">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-gray-800 break-words">{children}</em>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="list-disc pl-3 sm:pl-4 mb-2 sm:mb-3 space-y-1 w-full max-w-full">
                      {children}
                    </ul>
                  ),
                  number: ({ children }) => (
                    <ol className="list-decimal pl-3 sm:pl-4 mb-2 sm:mb-3 space-y-1 w-full max-w-full">
                      {children}
                    </ol>
                  ),
                },
                listItem: {
                  bullet: ({ children }) => (
                    <li className="text-sm sm:text-base leading-6 sm:leading-7 break-words w-full max-w-full">
                      {children}
                    </li>
                  ),
                  number: ({ children }) => (
                    <li className="text-sm sm:text-base leading-6 sm:leading-7 break-words w-full max-w-full">
                      {children}
                    </li>
                  ),
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonMainContent;