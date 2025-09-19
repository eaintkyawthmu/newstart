import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Map, 
  MessageSquare,
  Award,
  Heart
} from 'lucide-react';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const navItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: language === 'en' ? 'Dashboard' : 'ဒက်ရှ်ဘုတ်'
    },
    {
      path: '/journey',
      icon: Map,
      label: language === 'en' ? 'Journey' : 'ခရီးစဉ်'
    },
    {
      path: '/library',
      icon: BookOpen,
      label: language === 'en' ? 'Library' : 'စာကြည့်တိုက်'
    },
    {
      path: '/reflections',
      icon: Heart,
      label: language === 'en' ? 'Reflect' : 'သုံးသပ်ရန်'
    },
    {
      path: '/chat',
      icon: MessageSquare,
      label: language === 'en' ? 'Chat' : 'စကားပြော'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/journey' && location.pathname.startsWith('/courses')) {
      return true;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-bottom backdrop-blur-sm bg-white/95"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full min-w-[64px] min-h-[56px] focus-ring rounded-lg transition-all duration-200 press-effect ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label={item.label}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <item.icon 
              className={`h-6 w-6 transition-all duration-200 ${
                isActive(item.path) ? 'text-blue-600 scale-110' : 'text-gray-500'
              }`} 
              aria-hidden="true"
            />
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;