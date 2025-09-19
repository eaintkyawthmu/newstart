import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, UserCircle, Settings, LogOut, Crown } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePremiumAccess } from '../../hooks/usePremiumAccess';
import { useStripe } from '../../hooks/useStripe';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: Array<{
    path: string;
    icon: React.ElementType;
    label: string;
  }>;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, menuItems }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const { hasPremiumAccess } = usePremiumAccess();
  const { subscribeToPlan } = useStripe();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Prevent body scrolling when menu is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Menu */}
      <div 
        ref={menuRef}
        className={`fixed inset-0 flex flex-col bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!isOpen}
        id="mobile-menu"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <img src="/icons//newstart-logotext.svg" alt="MyNewStart" className="h-20" />
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={language === 'en' ? 'Close menu' : 'မီနူးပိတ်ရန်'}
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Profile */}
          <div className="flex items-center p-4 mb-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500">
                {hasPremiumAccess ? (
                  <span className="flex items-center text-purple-600">
                    <Crown className="h-4 w-4 mr-1" />
                    {language === 'en' ? 'Premium' : 'ပရီမီယံ'}
                  </span>
                ) : (
                  <span>{language === 'en' ? 'Free Plan' : 'အခမဲ့အစီအစဉ်'}</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Navigation Items */}
          <nav className="mb-6">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors touch-target"
                  >
                    <item.icon className="h-5 w-5 text-gray-500 mr-3" />
                    <span className="text-gray-700">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-6"></div>
          
          {/* Settings & Logout */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavigation('/profile-setup')}
              className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors touch-target"
            >
              <Settings className="h-5 w-5 text-gray-500 mr-3" />
              <span className="text-gray-700">
                {language === 'en' ? 'Settings' : 'ဆက်တင်များ'}
              </span>
            </button>
            
            {!hasPremiumAccess && (
              <button
                onClick={() => {
                  subscribeToPlan('monthly');
                  onClose();
                }}
                className="w-full flex items-center p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors touch-target"
              >
                <Crown className="h-5 w-5 text-purple-600 mr-3" />
                <span className="text-purple-700">
                  {language === 'en' ? 'Upgrade to Premium' : 'ပရီမီယံသို့ အဆင့်မြှင့်ရန်'}
                </span>
              </button>
            )}
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 rounded-lg hover:bg-red-50 transition-colors touch-target"
            >
              <LogOut className="h-5 w-5 text-red-500 mr-3" />
              <span className="text-red-600">
                {language === 'en' ? 'Sign Out' : 'ထွက်မည်'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;