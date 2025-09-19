import React from 'react';
import { ChevronLeft, Menu } from 'lucide-react';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  showBackButton?: boolean;
  backPath?: string;
  rightContent?: React.ReactNode;
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onMenuToggle,
  showBackButton = false,
  backPath,
  rightContent,
  title
}) => {
  const handleBackClick = () => {
    if (backPath) {
      window.history.pushState(null, '', backPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.history.back();
    }
  };

  return (
    <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton ? (
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
        ) : (
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
        )}
        {title && (
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h1>
        )}
      </div>
      
      {rightContent && (
        <div className="flex items-center space-x-2">
          {rightContent}
        </div>
      )}
    </header>
  );
};

export default MobileHeader;