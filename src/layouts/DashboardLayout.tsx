import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { usePremiumAccess } from '../hooks/usePremiumAccess';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabaseClient';
import ProfileMenu from '../components/ProfileMenu';
import SearchBar from '../components/ui/SearchBar';
import NotificationCenter from '../components/ui/NotificationCenter';
import OfflineIndicator from '../components/ui/OfflineIndicator';
import AccessibilityMenu from '../components/ui/AccessibilityMenu';
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
  Bell,
  Search,
  Eye
} from 'lucide-react';
import { BottomNavBar, MobileHeader, MobileMenu } from '../components/navigation';

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
        </button>
        
        <button
          onClick={() => setIsAccessibilityOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={language === 'en' ? 'Accessibility settings' : 'အသုံးပြုနိုင်မှု ဆက်တင်များ'}
        >
          <Eye className="h-5 w-5 text-gray-600" />
        </button>
        
        <button
          onClick={toggleLanguage}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label={language === 'en' ? 'Switch to Burmese' : 'Switch to English'}
        >
          <Globe className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Visible only on md and larger screens */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-center">
          {isCollapsed ? (
            <img src="/icons/logo.svg" alt="MyNewStart" className="h-8 w-8" />
          ) : (
            <img src="/icons/logo.svg" alt="MyNewStart" className="h-8" />
          )}
        </div>

        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-16 -right-3 bg-white border border-gray-200 rounded-full p-1 shadow-soft-sm"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 min-h-0 overflow-y-auto hide-scrollbar">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (location.pathname.startsWith(`${item.path}/`) && item.path !== '/') ||
                (item.path === '/journey' && location.pathname.startsWith('/courses'));
                
              return (
                <button
                  key={item.path}
                  onClick={() => handleMenuItemClick(item.path)}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : ''} px-3 py-3 rounded-md transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Premium Upgrade Button */}
          {!isCollapsed && !hasPremiumAccess && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => subscribeToPlan('monthly')}
                className="w-full flex items-center px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                <Crown className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">
                  {language === 'en' ? 'Upgrade to Premium' : 'Premium သို့ အဆင့်မြှင့်ရန်'}
                </span>
              </button>
            </div>
          )}
        </nav>

        {/* Sidebar Footer with Profile */}
        <div className="mt-auto border-t border-gray-200 p-4">
          <ProfileMenu
            isOpen={isProfileMenuOpen}
            onToggle={toggleProfileMenu}
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>

      {/* Overlay for mobile - only visible when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen min-w-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Mobile Header (Visible only on mobile ) */}
        {!location.pathname.includes('/lessons/') && (
        <div className="md:hidden">
          <MobileHeader
            onMenuToggle={toggleMobileMenu}
            showBackButton={showBackButton()}
            backPath={getBackPath()}
            rightContent={getRightContent()}
          />
        </div>
      )}

        {/* Mobile Menu (Controlled by isMobileMenuOpen, visible only on mobile) */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          menuItems={menuItems}
        />

        {/* Desktop Header (Visible only on desktop ) */}
        <div className={`hidden md:flex items-center justify-end h-16 px-8 bg-white border-b border-gray-200 ${
          location.pathname.includes('/lessons/') ? 'md:hidden' : ''
        }`}>
          <div className="flex items-center space-x-4">
            {getRightContent()}
          </div>
        </div>

        {/* Page Content */}
        <main 
          id="main-content"
          className={`flex-1 min-w-0 overflow-y-scroll md:overflow-auto overflow-x-hidden hide-scrollbar [scrollbar-gutter:stable] ${
            location.pathname.includes('/lessons/') 
              ? 'p-0 pt-0' 
              : 'p-4 md:p-6 lg:p-8 pb-safe pt-0 md:pt-6'
          }`}
          role="main"
          aria-label="Main content"
        >
          <div className={`w-full min-w-0 ${location.pathname.includes('/lessons/') ? '' : 'max-w-7xl mx-auto'}`}>
            {/* Main Content */}
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 border-t border-gray-200 mt-auto hidden md:block">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} My New Start. 
          </div>
        </footer>

        {/* Mobile Bottom Navigation  (Visible only on mobile) */}
        <BottomNavBar />
      </div>
      
      {/* Global UI Components */}
      <OfflineIndicator />
      
      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-4">
              <SearchBar 
                autoFocus={true}
                onResultClick={() => setIsSearchOpen(false)}
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="mt-4 w-full text-center text-gray-600 hover:text-gray-800 py-2"
              >
                {language === 'en' ? 'Close' : 'ပိတ်ရန်'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications */}
      <NotificationCenter 
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
      
      {/* Accessibility Menu */}
      <AccessibilityMenu 
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;