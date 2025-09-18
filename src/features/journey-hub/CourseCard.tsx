import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { JourneyPath } from '../../types/journey';
import { Lock, ChevronRight, Star, Users, Clock, FileText, CheckCircle } from 'lucide-react';
import { PortableText } from '@portabletext/react';

interface CourseCardProps {
  path: JourneyPath;
  onPathClick: (path: JourneyPath) => void;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({ path, onPathClick, progress = 0 }) => {
  const { language } = useLanguage();
  
  return (
    <div
      className={`bg-white rounded-xl border card-hover cursor-pointer ${
        path.isPremium ? 'border-purple-200' : 'border-gray-200'
      } overflow-hidden h-full flex flex-col focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2`}
      onClick={() => onPathClick(path)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPathClick(path);
        }
      }}
      aria-label={`${path.title} - ${path.isPremium ? 'Premium course' : 'Free course'}`}
    >
      {/* Image section with fixed aspect ratio */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {path.coverImage?.url ? (
          <img
            src={path.coverImage.url}
            alt={path.coverImage.alt || path.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
        )}
        {path.isPremium && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
            <Lock className="h-3 w-3" />
            <span>Premium</span>
          </div>
        )}
      </div>

      {/* Content section - flex-grow to fill remaining space */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-3 flex-grow">
          <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2 md:text-lg">{path.title}</h3>
          <div className="text-gray-600 text-sm line-clamp-2 md:text-base">
            <PortableText value={Array.isArray(path.description) ? path.description : [path.description]} />
          </div>
        </div>

        {/* Stats section */}
        <div className="flex items-center space-x-3 mb-3 text-xs text-gray-500 md:text-sm">
          <div className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1 md:h-4 md:w-4" />
            <span>{path.duration}</span>
          </div>
          {path.rating && (
            <div className="flex items-center">
              <Star className="h-3.5 w-3.5 text-yellow-400 mr-1 md:h-4 md:w-4" />
              <span>{path.rating}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mb-3">
            <div className="w-full bg-gray-200 rounded-full h-1.5 md:h-2">
              <div 
                className="bg-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 md:text-sm">
              {progress}% {language === 'en' ? 'Complete' : 'ပြီးဆုံး'}
            </p>
          </div>
        )}

        {/* Action button */}
        <button
          className={`w-full flex items-center justify-center px-3 py-2 rounded-lg font-medium text-white transition-all duration-300 text-sm md:text-base md:py-3 ${
            path.isPremium
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {path.isPremium ? (
            <>
              {language === 'en' ? 'Upgrade to Unlock' : 'အဆင့်မြှင့်ရန်'}
              <Lock className="h-3.5 w-3.5 ml-1.5 md:h-4 md:w-4" />
            </>
          ) : progress > 0 ? (
            <>
              {language === 'en' ? 'Continue Learning' : 'ဆက်လက်လေ့လာရန်'}
              <ChevronRight className="h-3.5 w-3.5 ml-1.5 md:h-4 md:w-4" />
            </>
          ) : (
            <>
              {language === 'en' ? 'Start Learning' : 'စတင်လေ့လာရန်'}
              <ChevronRight className="h-3.5 w-3.5 ml-1.5 md:h-4 md:w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;