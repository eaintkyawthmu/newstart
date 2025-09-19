import React, { useState, useEffect } from 'react';
import { useUserType } from '../../hooks/useUserType';
import { useAuth } from '../../contexts/AuthContext';
import { fetchJourneyPaths } from '../../lib/sanityClient';
import { UserType } from '../../types/user';
import { JourneyPath } from '../../types/journey';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  User,
  Users,
  Globe
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

const ContentValidationTest: React.FC = () => {
  const { userType } = useUserType();
  const { user, loading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);

  const testUserTypeChange = async (newUserType: UserType) => {
    // This would typically update the user's profile in the database
    console.log(`Testing user type change to: ${newUserType}`);
    // For testing purposes, we'll just run validation tests
    await runValidationTests();
  };

  const runValidationTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Test 1: User Type Detection
      results.push({
        name: 'User Type Detection',
        status: userType ? 'pass' : 'fail',
        message: userType ? `User type detected: ${userType}` : 'No user type detected',
        details: { userType }
      });

      // Test 2: Content Fetching for All User Types
      const testUserTypes: (UserType | undefined)[] = ['immigrant', 'nonImmigrant', undefined];
      const contentResults: Record<string, JourneyPath[]> = {};

      for (const testType of testUserTypes) {
        try {
          const content = await fetchJourneyPaths(['new-to-america', 'build-credit'], testType);
          contentResults[testType || 'all'] = content;
          
          results.push({
            name: `Content Fetch - ${testType || 'all'}`,
            status: 'pass',
            message: `Successfully fetched ${content.length} paths`,
            details: { userType: testType, pathCount: content.length }
          });
        } catch (error) {
          results.push({
            name: `Content Fetch - ${testType || 'all'}`,
            status: 'fail',
            message: `Failed to fetch content: ${error.message}`,
            details: { userType: testType, error: error.message }
          });
        }
      }

      // Test 3: Content Filtering Validation
      const allContent = contentResults['all'] || [];
      const immigrantContent = contentResults['immigrant'] || [];
      const nonImmigrantContent = contentResults['nonImmigrant'] || [];

      if (allContent.length > 0) {
        // Check if filtering is working
        const immigrantFiltered = allContent.length !== immigrantContent.length;
        const nonImmigrantFiltered = allContent.length !== nonImmigrantContent.length;

        if (immigrantFiltered || nonImmigrantFiltered) {
          results.push({
            name: 'Content Filtering',
            status: 'pass',
            message: 'Content filtering is working correctly',
            details: {
              all: allContent.length,
              immigrant: immigrantContent.length,
              nonImmigrant: nonImmigrantContent.length
            }
          });
        } else {
          results.push({
            name: 'Content Filtering',
            status: 'warning',
            message: 'No filtering detected - all content may be marked as "all"',
            details: {
              all: allContent.length,
              immigrant: immigrantContent.length,
              nonImmigrant: nonImmigrantContent.length
            }
          });
        }
      }

      // Test 4: Target Audience Field Validation
      const pathsWithTargetAudience = allContent.filter(path => path.targetAudience);
      const pathsWithoutTargetAudience = allContent.filter(path => !path.targetAudience);

      results.push({
        name: 'Target Audience Fields',
        status: pathsWithTargetAudience.length > 0 ? 'pass' : 'warning',
        message: `${pathsWithTargetAudience.length} paths have targetAudience, ${pathsWithoutTargetAudience.length} don't`,
        details: {
          withTargetAudience: pathsWithTargetAudience.length,
          withoutTargetAudience: pathsWithoutTargetAudience.length
        }
      });

      // Test 5: Module and Lesson Filtering
      let totalModules = 0;
      let totalLessons = 0;
      let filteredModules = 0;
      let filteredLessons = 0;

      allContent.forEach(path => {
        if (path.modules) {
          totalModules += path.modules.length;
          path.modules.forEach(module => {
            if (module.lessons) {
              totalLessons += module.lessons.length;
            }
          });
        }
      });

      const currentUserContent = userType === 'immigrant' ? immigrantContent : 
                                userType === 'nonImmigrant' ? nonImmigrantContent : 
                                allContent;

      currentUserContent.forEach(path => {
        if (path.modules) {
          filteredModules += path.modules.length;
          path.modules.forEach(module => {
            if (module.lessons) {
              filteredLessons += module.lessons.length;
            }
          });
        }
      });

      results.push({
        name: 'Nested Content Filtering',
        status: 'pass',
        message: `Modules: ${filteredModules}/${totalModules}, Lessons: ${filteredLessons}/${totalLessons}`,
        details: {
          totalModules,
          filteredModules,
          totalLessons,
          filteredLessons
        }
      });

    } catch (error) {
      results.push({
        name: 'Validation Test',
        status: 'fail',
        message: `Test failed: ${error.message}`,
        details: { error: error.message }
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    if (userType && isVisible) {
      runValidationTests();
    }
  }, [userType, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <TestTube className="h-5 w-5 mr-2 text-purple-600" />
            User Type System Validation
          </h2>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-96">
          {/* Current State */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Current State</h3>
            <div className="space-y-1 text-sm">
              <div>User ID: <span className="font-mono text-xs">{user?.id}</span></div>
              <div>User Type: <span className="font-mono">{userType || 'Not set'}</span></div>
              <div>Loading: <span className="font-mono">{loading ? 'Yes' : 'No'}</span></div>
              {error && <div className="text-red-600">Error: {error}</div>}
            </div>
          </div>

          {/* Test Controls */}
          <div className="space-y-2">
            <button
              onClick={runValidationTests}
              disabled={isRunning}
              className="w-full bg-purple-600 text-white py-2 px-3 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Run Validation Tests
            </button>

            <div className="flex space-x-2">
              <button
                onClick={() => testUserTypeChange('immigrant')}
                disabled={isRunning}
                className="flex-1 bg-blue-600 text-white py-1 px-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              >
                <User className="h-3 w-3 mr-1" />
                Test Immigrant
              </button>
              <button
                onClick={() => testUserTypeChange('nonImmigrant')}
                disabled={isRunning}
                className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                <Users className="h-3 w-3 mr-1" />
                Test Non-Immigrant
              </button>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800">Test Results</h3>
              {testResults.map((result, index) => (
                <div key={index} className={`p-2 rounded border ${
                  result.status === 'pass' ? 'bg-green-50 border-green-200' :
                  result.status === 'fail' ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    {result.status === 'pass' && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                    {result.status === 'fail' && <XCircle className="h-4 w-4 text-red-500 mr-2" />}
                    {result.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />}
                    <span className="font-medium text-sm">{result.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-1">
                      <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                      <pre className="text-xs bg-gray-100 p-1 rounded mt-1 overflow-x-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Debug Data */}
          {debugData && (
            <div className="bg-gray-50 p-3 rounded">
              <h3 className="font-medium text-gray-800 mb-2">Filtering Statistics</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Total Paths: {debugData.filteringStats.totalPaths}</div>
                <div>Visible: {debugData.filteringStats.visiblePaths}</div>
                <div>Filtered Out: {debugData.filteringStats.filteredOutPaths}</div>
                <div>Effectiveness: {debugData.filteringStats.filterEffectiveness.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentValidationTest;