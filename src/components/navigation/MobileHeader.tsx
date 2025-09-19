import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePremiumAccess } from '../../hooks/usePremiumAccess';
import { useStripe } from '../../hooks/useStripe';
import { supabase } from '../../lib/supabaseClient';
import ProfileMenu from '../../components/ProfileMenu';
import SearchBar from '../../components/ui/SearchBar';
import NotificationCenter from '../../components/ui/NotificationCenter';
import OfflineIndicator from '../../components/ui/OfflineIndicator';
import AccessibilityMenu from '../../components/ui/AccessibilityMenu';
import {
  LayoutDashboard,
  BookOpen,
  LifeBuoy,
  ChevronRight,
  ChevronLeft,
  Map,
  Users,
  MessageSquare,
  Crown,
  Settings,
  CreditCard,
  Globe,
  RotateCcw,
  Download,
  Award,
  Heart,
  Bell,
  Search,
  Eye
} from 'lucide-react';
import { BottomNavBar, MobileHeader, MobileMenu } from '../../components/navigation';

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();
  const { hasPremiumAccess, premiumTier } = usePremiumAccess();
  const { subscribeToPlan } = useStripe();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  const baseMenuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: language === 'en' ? 'Dashboard' : 'ဒက်ရှ်ဘုတ်'
    },
    {
      path: '/journey',
      icon: Map,
      label: language === 'en' ? 'Journey Hub' : 'ခရီးစဉ်စင်တာ'
    },
    {
      path: '/library',
      icon: BookOpen,
      label: language === 'en' ? 'Library' : 'စာကြည့်တိုက်'
    },
    {
      path: '/chat',
      icon: MessageSquare,
      label: language === 'en' ? 'Chat with Mini Angel' : 'Mini Angel နှင့် စကားပြောရန်'
    },
    {
      path: '/reflections',
      icon: Heart,
      label: language === 'en' ? 'Reflections' : 'ရောင်ပြန်ဟပ်မှုများ'
    },
    {
      path: '/consultation',
      icon: Users,
      label: language === 'en' ? 'Community' : 'အသိုင်းအဝိုင်း'
    },
    {
      path: '/help',
      icon: LifeBuoy,
      label: language === 'en' ? 'Help' : 'အကူအညီ'
    },
    // Add debug menu item in development
    ...(process.env.NODE_ENV === 'development' ? [{
      path: '/user-type-test',
      icon: Settings,
      label: 'Debug User Types'
    }] : [])
  ];

  // Add admin menu item conditionally
  const menuItems = isAdmin
    ? [...baseMenuItems, {
        path: '/admin',
        icon: Settings,
        label: 'Admin Dashboard'
      }]
    : baseMenuItems;

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          return;
        }

        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Set initial collapsed state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Determine if we should show back button instead of menu toggle
  const showBackButton = () => {
    const pathsWithBackButton = [
      '/courses/',
      '/steps/',
      '/profile-setup',
      '/subscription',
      '/admin/users/'
    ];

    return pathsWithBackButton.some(path => location.pathname.includes(path));
  };

  // Determine back button destination
  const getBackPath = () => {
    if (location.pathname.includes('/courses/')) {
      return '/journey';
    }
    if (location.pathname.includes('/steps/')) {
      return '/journey';
    }
    if (location.pathname.startsWith('/admin/users/')) {
      return '/admin';
    }
    return '/dashboard';
  };

  // Get custom right content for specific pages
  const getRightContent = () => {
    if (location.pathname === '/chat') {
      return (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAccessibilityOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={language === 'en' ? 'Accessibility settings' : 'အသုံးပြုနိုင်မှု ဆက်တင်များ'}
          >
            <Eye className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              // Clear conversation functionality would go here
              window.dispatchEvent(new CustomEvent('clear-chat'));
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={language === 'en' ? 'Clear conversation' : 'စကားပြောမှုကို ရှင်းလင်းရန်'}
          >
            <RotateCcw className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              // Export conversation functionality would go here
              window.dispatchEvent(new CustomEvent('export-chat'));
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={language === 'en' ? 'Export conversation' : 'စကားပြောမှုကို ထုတ်ယူရန်'}
          >
            <Download className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      );
    }
    
    // For courses and lessons, we might want to add a completion button
    if (location.pathname.includes('/courses/') && location.pathname.includes('/lessons/')) {
      return (
        <button
          onClick={() => {
            // Toggle completion functionality would go here
            window.dispatchEvent(new CustomEvent('toggle-lesson-completion'));
          }}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {/* This would be a dynamic icon based on completion status */}
        </button>
      );
    }
    
    // Default is just the language toggle
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={language === 'en' ? 'Search' : 'ရှာဖွေရန်'}
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>
        
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={language === 'en' ? 'Notifications' : 'အကြောင်းကြားချက်များ'}
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        