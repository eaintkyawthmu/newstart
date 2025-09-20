import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import ProfileMenu from '../components/ProfileMenu';
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

type DashboardLayoutProps = {
  children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { hasPremiumAccess, premiumTier } = usePremiumAccess();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const baseMenuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard'
      label: 'Dashboard'
    {
      path: '/guide',
      icon: Map,
      label: 'Guide'
    },
    {
      path: '/library',
      icon: BookOpen,
      label: 'Library'
    },
    {
      path: '/chat',
      icon: MessageSquare,
      label: 'Chat with Mini Angel'
    },
    {
      path: '/reflections',
      icon: Heart,
      label: 'Reflections'
    },
    {
      path: '/consultation',
      icon: Users,
      label: 'Community'
    },
    {
      path: '/help',
      icon: LifeBuoy,
      label: 'Help'
    }
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
    if (location.pathname.includes('/guide/')) {
      return '/guide';
    }
    if (location.pathname.includes('/steps/')) {
      return '/guide';
    }
    if (location.pathname.startsWith('/admin/users/')) {
      return '/admin';
    }
    return '/dashboard';
  };

  // Get custom right content for specific pages
  const getRightContent = () => {
    return (
      <div className="flex items-center space-x-2">
        {/* Simplified header content */}
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
        {/* Desktop Header (Visible only on desktop ) */}
        <div className="hidden md:flex items-center justify-end h-16 px-8 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {getRightContent()}
          </div>
        </div>

        {/* Page Content */}
        <main 
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pt-0 md:pt-6"
          role="main"
          aria-label="Main content"
        >
          <div className="w-full min-w-0 max-w-7xl mx-auto">
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
      </div>
    </div>
  );
};

export default DashboardLayout;