import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useUserType } from '../../hooks/useUserType';
import { AlertCircle, Users, Globe, Filter } from 'lucide-react';

interface ContentFilterProps {
  children: React.ReactNode;
  requiredUserType?: 'immigrant' | 'nonImmigrant' | 'all';
  fallbackMessage?: string;
  showDebugInfo?: boolean;
}

/**
 * ContentFilter component that conditionally renders content based on user type
 * This is useful for showing/hiding specific UI elements based on user classification
 */
const ContentFilter: React.FC<ContentFilterProps> = ({
  children,
  requiredUserType = 'all',
  fallbackMessage,
  showDebugInfo = false
}) => {
  const { language } = useLanguage();
  const { userType, loading } = useUserType();

  // Show loading state while determining user type
  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Check if content should be shown
  const shouldShowContent = () => {
    if (requiredUserType === 'all') return true;
    if (!userType) return false;
    return userType === requiredUserType;
  };

  // Debug information for development
  if (showDebugInfo && process.env.NODE_ENV === 'development') {
    return (
      <div className="border border-dashed border-gray-300 p-4 rounded-lg mb-4">
        <div className="flex items-center mb-2">
          <Filter className="h-4 w-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Content Filter Debug</span>
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          <p>User Type: {userType || 'Not set'}</p>
          <p>Required Type: {requiredUserType}</p>
          <p>Should Show: {shouldShowContent() ? 'Yes' : 'No'}</p>
        </div>
        {shouldShowContent() && (
          <div className="mt-3 border-t border-gray-200 pt-3">
            {children}
          </div>
        )}
      </div>
    );
  }

  // Don't render anything if user type doesn't match
  if (!shouldShowContent()) {
    if (fallbackMessage) {
      return (
        <div className="text-center py-8 px-4">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 text-sm">{fallbackMessage}</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};

export default ContentFilter;