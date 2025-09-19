import React from 'react';
import { useUserType } from '../../hooks/useUserType';
import { JourneyPath } from '../../types/journey';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import JourneyCardList from './JourneyCardList';

interface FilteredContentDisplayProps {
  journeyPaths: JourneyPath[];
  loading?: boolean;
  error?: string | null;
}

export const FilteredContentDisplay: React.FC<FilteredContentDisplayProps> = ({
  journeyPaths,
  loading = false,
  error = null
}) => {
  const { userType, loading: userTypeLoading, error: userTypeError } = useUserType();

  // Show loading state while fetching user type or content
  if (loading || userTypeLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if there's an error
  if (error || userTypeError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">
          {error || userTypeError || 'An error occurred while loading content'}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Filter content based on user type
  const filteredPaths = journeyPaths.filter(path => {
    if (!path.targetAudience) return true; // Show if no target audience specified
    return path.targetAudience === 'all' || path.targetAudience === userType;
  });

  // Show empty state if no content matches user type
  if (filteredPaths.length === 0) {
    return (
      <EmptyState
        title="No content available"
        description={`No journey paths are currently available for ${userType || 'your'} user type.`}
      />
    );
  }

  // Show debug information in development
  const isDebug = process.env.NODE_ENV === 'development';

  return (
    <div className="space-y-6">
      {isDebug && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2 text-blue-800 flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Content Filtering Debug
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-blue-700">
            <div>
              <div className="font-medium">User Type</div>
              <div className="text-xs">{userType || 'Not set'}</div>
            </div>
            <div>
              <div className="font-medium">Total Paths</div>
              <div className="text-xs">{journeyPaths.length}</div>
            </div>
            <div>
              <div className="font-medium">Visible Paths</div>
              <div className="text-xs">{filteredPaths.length}</div>
            </div>
            <div>
              <div className="font-medium">Filter Rate</div>
              <div className="text-xs">
                {journeyPaths.length > 0 
                  ? `${(((journeyPaths.length - filteredPaths.length) / journeyPaths.length) * 100).toFixed(1)}%`
                  : '0%'
                }
              </div>
            </div>
          </div>
          
          {filteredPaths.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="font-medium text-blue-800 mb-1">Visible Content:</div>
              <div className="flex flex-wrap gap-1">
                {filteredPaths.map((path, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {path.title} ({path.targetAudience || 'all'})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <JourneyCardList journeyPaths={filteredPaths} />
    </div>
  );
};

export default FilteredContentDisplay