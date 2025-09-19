import React from 'react';
import { useUserType } from '../../hooks/useUserType';
import { JourneyPath } from '../../types/journey';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { JourneyCardList } from './JourneyCardList';

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
        <div className="bg-gray-100 p-4 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>User Type: {userType || 'Not set'}</p>
          <p>Total Paths: {journeyPaths.length}</p>
          <p>Filtered Paths: {filteredPaths.length}</p>
        </div>
      )}
      
      <JourneyCardList journeyPaths={filteredPaths} />
    </div>
  );
};

export default FilteredContentDisplay