import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Map, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const BottomNav: React.FC = () => {
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
      path: '/chat',
      icon: MessageSquare,
      label: language === 'en' ? 'Chat' : 'စကားပြော'
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`bottom-nav-item ${isActive(item.path) ? 'active' : ''}`}
          aria-label={item.label}
        >
          <item.icon className="bottom-nav-icon" />
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;