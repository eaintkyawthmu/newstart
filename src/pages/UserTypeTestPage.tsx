import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserType } from '../hooks/useUserType';
import { useContentValidation } from '../hooks/useContentValidation';
import { UserType } from '../types/user';
import { 
  ArrowLeft, 
  TestTube, 
  User, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Play,
  Database,
  Globe,
  Settings
} from 'lucide-react';

const UserTypeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { userType, updateUserType, loading } = useUserType();
  const { validationResult, isValidating, runValidation, testUserType } = useContentValidation();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [runningTest, setRunningTest] = useState<string | null>(null);

  const runComprehensiveTest = async () => {
    setRunningTest('comprehensive');
    setTestResults([]);
    
    try {
      const results = [];
      
      // Test both user types
      for (const type of ['immigrant', 'nonImmigrant'] as UserType[]) {
        console.log(`Testing user type: ${type}`);
        
        const result = await testUserType(type);
        results.push({
          userType: type,
          ...result
        });
      }
      
      setTestResults(results);
    } catch (error) {
      console.error('Comprehensive test failed:', error);
    } finally {
      setRunningTest(null);
    }
  };

  const switchUserType = async (newType: UserType) => {
    setRunningTest(`switch-${newType}`);
    try {
      await updateUserType(newType);
      await runValidation();
    } catch (error) {
      console.error('Failed to switch user type:', error);
    } finally {
      setRunningTest(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center mb-6">
          <TestTube className="h-8 w-8 text-purple-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">User Type System Testing</h1>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="font-semibold text-blue-800 mb-3 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Current System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">User Type:</span>
              <div className={`mt-1 px-2 py-1 rounded text-xs font-medium ${
                userType === 'immigrant' ? 'bg-blue-100 text-blue-800' :
                userType === 'nonImmigrant' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {userType || 'Not Set'}
              </div>
            </div>
            <div>
              <span className="text-blue-700">Loading State:</span>
              <div className={`mt-1 px-2 py-1 rounded text-xs ${
                loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
              }`}>
                {loading ? 'Loading' : 'Ready'}
              </div>
            </div>
            <div>
              <span className="text-blue-700">Validation:</span>
              <div className={`mt-1 px-2 py-1 rounded text-xs ${
                validationResult?.isValid ? 'bg-green-100 text-green-800' :
                validationResult?.isValid === false ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {validationResult?.isValid ? 'Valid' : 
                 validationResult?.isValid === false ? 'Invalid' : 'Not Tested'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runComprehensiveTest}
              disabled={runningTest === 'comprehensive'}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
            >
              {runningTest === 'comprehensive' ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Run Comprehensive Test
            </button>

            <button
              onClick={runValidation}
              disabled={isValidating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isValidating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Validate Current State
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => switchUserType('immigrant')}
              disabled={runningTest === 'switch-immigrant' || userType === 'immigrant'}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {runningTest === 'switch-immigrant' ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <User className="h-4 w-4 mr-2" />
              )}
              Switch to Immigrant
            </button>
            <button
              onClick={() => switchUserType('nonImmigrant')}
              disabled={runningTest === 'switch-nonImmigrant' || userType === 'nonImmigrant'}
              className="flex-1 bg-green-600 text-white py-2 px-3 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {runningTest === 'switch-nonImmigrant' ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Switch to Non-Immigrant
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Current Validation Results</h3>
            
            {validationResult.errors.length > 0 && (
              <div className="mb-3">
                <h4 className="text-red-800 font-medium mb-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  Errors ({validationResult.errors.length})
                </h4>
                <ul className="space-y-1">
                  {validationResult.errors.map((error, index) => (
                    <li key={index} className="text-red-700 text-sm">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div className="mb-3">
                <h4 className="text-yellow-800 font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Warnings ({validationResult.warnings.length})
                </h4>
                <ul className="space-y-1">
                  {validationResult.warnings.map((warning, index) => (
                    <li key={index} className="text-yellow-700 text-sm">• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800">{validationResult.stats.totalContent}</div>
                <div className="text-gray-600">Total Content</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{validationResult.stats.filteredContent}</div>
                <div className="text-gray-600">Visible Content</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{validationResult.stats.filterEffectiveness.toFixed(1)}%</div>
                <div className="text-gray-600">Filter Effectiveness</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Comprehensive Test Results</h3>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 flex items-center">
                      {result.userType === 'immigrant' ? (
                        <User className="h-4 w-4 mr-2 text-blue-600" />
                      ) : (
                        <Users className="h-4 w-4 mr-2 text-green-600" />
                      )}
                      {result.userType} User Test
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isValid ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>Total: {result.stats.totalContent}</div>
                    <div>Filtered: {result.stats.filteredContent}</div>
                    <div>Effectiveness: {result.stats.filterEffectiveness.toFixed(1)}%</div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-red-600 text-xs font-medium">Errors:</div>
                      <ul className="text-red-600 text-xs">
                        {result.errors.map((error: string, i: number) => (
                          <li key={i}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.warnings.length > 0 && (
                    <div className="mt-2">
                      <div className="text-yellow-600 text-xs font-medium">Warnings:</div>
                      <ul className="text-yellow-600 text-xs">
                        {result.warnings.map((warning: string, i: number) => (
                          <li key={i}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Testing Instructions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <Database className="h-4 w-4 mr-2 text-blue-600" />
              1. Database Testing
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-6">
              <li>• Switch between user types using the buttons above</li>
              <li>• Verify that the database updates correctly</li>
              <li>• Check that the UI reflects the changes immediately</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-green-600" />
              2. Content Filtering Testing
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-6">
              <li>• Run the comprehensive test to check both user types</li>
              <li>• Navigate to /journey to see filtered content in action</li>
              <li>• Verify that different content appears for different user types</li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-800 mb-2 flex items-center">
              <TestTube className="h-4 w-4 mr-2 text-purple-600" />
              3. Manual Testing
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 ml-6">
              <li>• Create test users with different types during onboarding</li>
              <li>• Check that Sanity content has proper targetAudience fields</li>
              <li>• Verify that modules and lessons are filtered correctly</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Expected Results</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• <strong>Immigrant users</strong> should see content marked as "immigrant" or "all"</div>
            <div>• <strong>Non-immigrant users</strong> should see content marked as "nonImmigrant" or "all"</div>
            <div>• <strong>Content filtering</strong> should work at path, module, and lesson levels</div>
            <div>• <strong>User type changes</strong> should immediately update visible content</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeTestPage;