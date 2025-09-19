import React, { useState } from 'react';
import { useUserType } from '../../hooks/useUserType';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { fetchJourneyPaths } from '../../lib/sanityClient';
import { UserType } from '../../types/user';
import { 
  Bug, 
  User, 
  Database, 
  Globe, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';

interface DebugData {
  userProfile: any;
  sanityContent: any[];
  filteredContent: any[];
  filteringStats: {
    totalPaths: number;
    visiblePaths: number;
    filteredOutPaths: number;
    filterEffectiveness: number;
  };
}

const UserTypeDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { userType, userProfile, loading, error, updateUserType } = useUserType();
  const [isVisible, setIsVisible] = useState(false);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [testing, setTesting] = useState(false);

  const runDebugTest = async () => {
    if (!user) return;
    
    setTesting(true);
    try {
      // 1. Fetch user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // 2. Test content fetching for both user types
      const immigrantContent = await fetchJourneyPaths(['new-to-america', 'build-credit', 'housing-utilities'], 'immigrant');
      const nonImmigrantContent = await fetchJourneyPaths(['new-to-america', 'build-credit', 'housing-utilities'], 'nonImmigrant');
      const allContent = await fetchJourneyPaths(['new-to-america', 'build-credit', 'housing-utilities'], undefined);

      // 3. Calculate filtering effectiveness
      const currentContent = userType === 'immigrant' ? immigrantContent : 
                           userType === 'nonImmigrant' ? nonImmigrantContent : 
                           allContent;

      const stats = {
        totalPaths: allContent.length,
        visiblePaths: currentContent.length,
        filteredOutPaths: allContent.length - currentContent.length,
        filterEffectiveness: allContent.length > 0 ? 
          ((allContent.length - currentContent.length) / allContent.length) * 100 : 0
      };

      setDebugData({
        userProfile: profile,
        sanityContent: allContent,
        filteredContent: currentContent,
        filteringStats: stats
      });

    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const testUserTypeChange = async (newType: UserType) => {
    try {
      await updateUserType(newType);
      await runDebugTest();
    } catch (error) {
      console.error('Failed to update user type:', error);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="User Type Debug Panel"
      >
        {isVisible ? <EyeOff className="h-5 w-5" /> : <Bug className="h-5 w-5" />}
      </button>

      {isVisible && (
        <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              User Type Debug Panel
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="h-4 w-4" />
            </button>
          </div>

          {/* Current Status */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">User Type:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                userType === 'immigrant' ? 'bg-blue-100 text-blue-800' :
                userType === 'nonImmigrant' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userType || 'Not Set'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Loading:</span>
              <span className={`px-2 py-1 rounded text-xs ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'Yes' : 'No'}
              </span>
            </div>

            {error && (
              <div className="flex items-start">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                <span className="text-xs text-red-600">{error}</span>
              </div>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-2 mb-4">
            <button
              onClick={runDebugTest}
              disabled={testing || !user}
              className="w-full bg-purple-600 text-white py-2 px-3 rounded text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
            >
              {testing ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Run Debug Test
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => testUserTypeChange('immigrant')}
                disabled={testing || userType === 'immigrant'}
                className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              >
                Test Immigrant
              </button>
              <button
                onClick={() => testUserTypeChange('nonImmigrant')}
                disabled={testing || userType === 'nonImmigrant'}
                className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 disabled:opacity-50"
              >
                Test Non-Immigrant
              </button>
            </div>
          </div>

          {/* Debug Results */}
          {debugData && (
            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Database className="h-4 w-4 mr-1" />
                  Database Profile
                </h4>
                <div className="space-y-1">
                  <div>User Type: <span className="font-mono">{debugData.userProfile?.user_type}</span></div>
                  <div>Name: <span className="font-mono">{debugData.userProfile?.first_name} {debugData.userProfile?.last_name}</span></div>
                  <div>Country: <span className="font-mono">{debugData.userProfile?.country_of_origin}</span></div>
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  Content Filtering
                </h4>
                <div className="space-y-1">
                  <div>Total Paths: <span className="font-mono">{debugData.filteringStats.totalPaths}</span></div>
                  <div>Visible Paths: <span className="font-mono">{debugData.filteringStats.visiblePaths}</span></div>
                  <div>Filtered Out: <span className="font-mono">{debugData.filteringStats.filteredOutPaths}</span></div>
                  <div>Effectiveness: <span className="font-mono">{debugData.filteringStats.filterEffectiveness.toFixed(1)}%</span></div>
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded">
                <h4 className="font-medium text-gray-800 mb-2">Content Details</h4>
                <div className="space-y-1">
                  {debugData.filteredContent.map((path, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                      <span className="truncate">{path.title}</span>
                      <span className="ml-auto text-gray-500">
                        ({path.targetAudience || 'all'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserTypeDebugPanel;