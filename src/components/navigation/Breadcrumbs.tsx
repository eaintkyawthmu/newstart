import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface BreadcrumbsProps {
  customPaths?: Array<{
    name: string;
    path: string;
  }>;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ customPaths }) => {
  const location = useLocation();
  const { language } = useLanguage();
  
  // If custom paths are provided, use those
  if (customPaths) {
    return (
      <nav className="breadcrumbs" aria-label="breadcrumbs">
        <ol className="flex items-center">
          <li className="breadcrumb-item">
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              <Home className="h-4 w-4" />
            </Link>
          </li>
          {customPaths.map((item, index) => (
            <React.Fragment key={item.path}>
              <li className="breadcrumb-separator">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="breadcrumb-item">
                {index === customPaths.length - 1 ? (
                  <span className="text-gray-900 font-medium">{item.name}</span>
                ) : (
                  <Link to={item.path} className="text-gray-500 hover:text-gray-700">
                    {item.name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>
    );
  }
  
  // Otherwise, generate breadcrumbs from the current path
  const pathnames = location.pathname.split('/').filter(x => x);
  
  // Map path segments to readable names
  const getPathName = (path: string) => {
    const pathMap: Record<string, string> = {
      dashboard: language === 'en' ? 'Dashboard' : 'ဒက်ရှ်ဘုတ်',
      journey: language === 'en' ? 'Journey Hub' : 'ခရီးစဉ်စင်တာ',
      library: language === 'en' ? 'Library' : 'စာကြည့်တိုက်',
      chat: language === 'en' ? 'Chat' : 'စကားပြော',
      help: language === 'en' ? 'Help' : 'အကူအညီ',
      courses: language === 'en' ? 'Courses' : 'သင်တန်းများ',
      steps: language === 'en' ? 'Steps' : 'အဆင့်များ',
      subscription: language === 'en' ? 'Subscription' : 'အသင်းဝင်ခြင်း',
      'profile-setup': language === 'en' ? 'Profile' : 'ပရိုဖိုင်'
    };
    
    return pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
      <ol className="flex items-center">
        <li className="breadcrumb-item">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
            <Home className="h-4 w-4" />
          </Link>
        </li>
        
        {pathnames.map((path, index) => {
          // Build the accumulated path
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <React.Fragment key={path}>
              <li className="breadcrumb-separator">
                <ChevronRight className="h-4 w-4" />
              </li>
              <li className="breadcrumb-item">
                {isLast ? (
                  <span className="text-gray-900 font-medium">{getPathName(path)}</span>
                ) : (
                  <Link to={routeTo} className="text-gray-500 hover:text-gray-700">
                    {getPathName(path)}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;