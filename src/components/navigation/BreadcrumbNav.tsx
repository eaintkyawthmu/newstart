import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbNavProps {
  customPaths?: { name: string; path: string }[];
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ customPaths }) => {
  const location = useLocation();
  const { language } = useLanguage();
  
  // If custom paths are provided, use them
  if (customPaths) {
    return (
      <nav className="hidden md:flex items-center text-sm text-gray-500 mb-4">
        <Link to="/dashboard" className="hover:text-gray-700">
          {language === 'en' ? 'Home' : 'ပင်မ'}
        </Link>
        {customPaths.map((item, index) => (
          <React.Fragment key={item.path}>
            <ChevronRight className="h-4 w-4 mx-2" />
            {index === customPaths.length - 1 ? (
              <span className="text-gray-900 font-medium">{item.name}</span>
            ) : (
              <Link to={item.path} className="hover:text-gray-700">
                {item.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Otherwise, generate breadcrumbs from the current path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Map path segments to readable names
  const getPathName = (path: string): string => {
    const pathMap: Record<string, string> = {
      'dashboard': language === 'en' ? 'Dashboard' : 'ဒက်ရှ်ဘုတ်',
      'journey': language === 'en' ? 'Journey Hub' : 'ခရီးစဉ်စင်တာ',
      'library': language === 'en' ? 'Library' : 'စာကြည့်တိုက်',
      'chat': language === 'en' ? 'Chat' : 'စကားပြော',
      'courses': language === 'en' ? 'Courses' : 'သင်တန်းများ',
      'steps': language === 'en' ? 'Steps' : 'အဆင့်များ',
      'profile-setup': language === 'en' ? 'Profile Setup' : 'ပရိုဖိုင်စီစဉ်ခြင်း',
      'subscription': language === 'en' ? 'Subscription' : 'အသင်းဝင်ခြင်း',
      'help': language === 'en' ? 'Help' : 'အကူအညီ',
      'consultation': language === 'en' ? 'Consultation' : 'တိုင်ပင်ဆွေးနွေးခြင်း'
    };
    
    return pathMap[path] || path;
  };

  return (
    <nav className="hidden md:flex items-center text-sm text-gray-500 mb-4">
      <Link to="/dashboard" className="hover:text-gray-700">
        {language === 'en' ? 'Home' : 'ပင်မ'}
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        
        return (
          <React.Fragment key={to}>
            <ChevronRight className="h-4 w-4 mx-2" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{getPathName(value)}</span>
            ) : (
              <Link to={to} className="hover:text-gray-700">
                {getPathName(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;