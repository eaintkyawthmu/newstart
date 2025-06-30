import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, ArrowLeft, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileHeaderProps {
  title?: string;
  onMenuToggle: () => void;
  showBackButton?: boolean;
  backPath?: string;
  rightContent?: React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuToggle,
  showBackButton = false,
  backPath = '/dashboard',
  rightContent
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();

  // Determine title based on current path if not provided
  const getPageTitle = () => {
    if (title) return title;
    
    const path = location.pathname;
    if (path === '/dashboard') return language === 'en' ? 'Dashboard' : 'ဒက်ရှ်ဘုတ်';
    if (path === '/journey') return language === 'en' ? 'Journey Hub' : 'ခရီးစဉ်စင်တာ';
    if (path === '/library') return language === 'en' ? 'Library' : 'စာကြည့်တိုက်';
    if (path === '/chat') return language === 'en' ? 'Chat' : 'စကားပြော';
    if (path === '/help') return language === 'en' ? 'Help' : 'အကူအညီ';
    if (path.startsWith('/courses')) return language === 'en' ? 'Courses' : 'သင်တန်းများ';
    
    return 'My New Start';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 flex items-center justify-between h-14">
      {showBackButton ? (
        <button
          onClick={() => navigate(backPath)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={language === 'en' ? 'Go back' : 'နောက်သို့ပြန်သွားရန်'}
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
      ) : (
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={language === 'en' ? 'Open menu' : 'မီနူးဖွင့်ရန်'}
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      )}
      
      <div className="flex items-center">
        <img src="/icons/icon-96x96.png" alt="MyNewStart" className="h-8 w-8 mr-2" />
        <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">{getPageTitle()}</h1>
      </div>
      
      {rightContent ? (
        rightContent
      ) : (
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={language === 'en' ? 'Switch to Burmese' : 'Switch to English'}
        >
          <Globe className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </header>
  );
};

export default MobileHeader;