import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUserType } from '../../hooks/useUserType';
import { JourneyPath } from '../../types/journey';
import { shouldShowContent, getContentStats } from '../../utils/contentFiltering';
import { AlertCircle, Users, Filter, Eye, Info } from 'lucide-react';

interface FilteredContentDisplayProps {
  paths: JourneyPath[];
  onPathClick: (path: JourneyPath) => void;
  progress: Record<string, number>;
  children: (filteredPaths: JourneyPath[]) => React.ReactNode;
  showDebugInfo?: boolean;
}

/**
 * Component that handles content filtering and displays filtered journey paths
 * Provides debug information and statistics about content filtering
 */
const FilteredContentDisplay: React.FC<FilteredContentDisplayProps> = ({
  paths,
  onPathClick,
  progress,
  children,
  showDebugInfo = false
}) => {
  const { language } = useLanguage();
  const { userType, loading } = useUserType();

  // Filter paths based on user type
  const filteredPaths = React.useMemo(() => {
    if (loading) return [];
    
    console.log('Filtering paths for user type:', userType);
    console.log('Available paths:', paths.map(p => ({ title: p.title, targetAudience: p.targetAudience })));
    
    const filtered = paths.filter(path => 
      shouldShowContent(path.targetAudience, userType)
    );
    
    console.log('Filtered paths:', filtered.map(p => ({ title: p.title, targetAudience: p.targetAudience })));
    
    return filtered;
  }, [paths, userType, loading]);

  // Get content statistics
  const contentStats = React.useMemo(() => {
    if (loading) return null;
    
    return getContentStats({
      journeyPaths: paths,
      modules: [],
      lessons: []
    }, userType);
  }, [paths, userType, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            {language === 'en' ? 'Loading personalized content...' : 'ကိုယ်ပိုင်အကြောင်းအရာများ တင်နေသည်...'}
          </p>
        </div>
      </div>
    );
  }

  // Show debug information in development
  if (showDebugInfo && process.env.NODE_ENV === 'development' && contentStats) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-800">Content Filtering Debug</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                User Profile
              </h4>
              <div className="space-y-1 text-blue-600">
                <p><strong>Type:</strong> {userType || 'Not set'}</p>
                <p><strong>Status:</strong> {
                  userType === 'immigrant' 
                    ? 'Long-term resident' 
                    : userType === 'nonImmigrant'
                      ? 'Temporary resident'
                      : 'Unspecified'
                }</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Content Visibility
              </h4>
              <div className="space-y-1 text-blue-600">
                <p><strong>Total Available:</strong> {contentStats.totalAvailable.journeyPaths}</p>
                <p><strong>Visible to User:</strong> {contentStats.visibleToUser.journeyPaths}</p>
                <p><strong>Filtered Out:</strong> {contentStats.totalAvailable.journeyPaths - contentStats.visibleToUser.journeyPaths}</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Filter Stats
              </h4>
              <div className="space-y-1 text-blue-600">
                <p><strong>Reduction:</strong> {contentStats.filterEffectiveness.percentageFiltered.toFixed(1)}%</p>
                <p><strong>Personalized:</strong> {contentStats.visibleToUser.total > 0 ? 'Yes' : 'No'}</p>
                <p><strong>Relevant:</strong> {filteredPaths.length > 0 ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-blue-200">
            <h4 className="font-medium text-blue-700 mb-2">Path Details</h4>
            <div className="space-y-1 text-xs text-blue-600">
              {paths.map(path => (
                <div key={path._id} className="flex justify-between">
                  <span>{path.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    shouldShowContent(path.targetAudience, userType)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {path.targetAudience || 'all'} | {shouldShowContent(path.targetAudience, userType) ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {children(filteredPaths)}
      </div>
    );
  }

  // Show message if no content is available for user type
  if (filteredPaths.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {language === 'en' ? 'No Relevant Content Found' : 'သက်ဆိုင်သော အကြောင်းအရာများ မတွေ့ရှိပါ'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {language === 'en'
            ? 'No journey paths are currently available for your profile type. This might be because content is still being created or your profile needs to be updated.'
            : 'သင့်ပရိုဖိုင်းအမျိုးအစားအတွက် လက်ရှိတွင် ခရီးစဉ်လမ်းကြောင်းများ မရရှိနိုင်ပါ။ အကြောင်းအရာများ ဖန်တီးနေဆဲဖြစ်နိုင်သည် သို့မဟုတ် သင့်ပရိုဖိုင်းကို အပ်ဒိတ်လုပ်ရန် လိုအပ်နိုင်သည်။'}
        </p>
        
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center mb-2">
            <Users className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              {language === 'en' ? 'Your Profile Type' : 'သင့်ပရိုဖိုင်းအမျိုးအစား'}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {userType === 'immigrant' 
              ? (language === 'en' ? 'Long-term Resident (Immigrant)' : 'ရေရှည်နေထိုင်သူ (ရွှေ့ပြောင်းအခြေချသူ)')
              : userType === 'nonImmigrant'
                ? (language === 'en' ? 'Temporary Resident (Non-Immigrant)' : 'ယာယီနေထိုင်သူ (ရွှေ့ပြောင်းအခြေချသူမဟုတ်)')
                : (language === 'en' ? 'Not specified' : 'သတ်မှတ်မထားပါ')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children(filteredPaths)}</>;
};

export default FilteredContentDisplay;