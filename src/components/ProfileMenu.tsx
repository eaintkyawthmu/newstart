import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  UserCircle,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

interface ProfileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
}

const ProfileMenu = ({ isOpen, onToggle, isCollapsed }: ProfileMenuProps) => {
  const { language } = useLanguage();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<{ first_name: string; last_name: string } | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserProfile();

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        if (isOpen) {
          onToggle();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    onToggle(); // Close the menu after clicking an item
  };

  return (
    <div className="relative" ref={profileMenuRef}>
      {/* Profile Button */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center justify-center min-w-0">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <UserCircle className="h-6 w-6" />
            </div>
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate m-0">
                {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'My Profile'}
              </p>
              <p className="text-xs text-gray-500 truncate m-0">
                {language === 'en' ? 'View profile' : 'ပရိုဖိုင်ကြည့်ရန်'}
              </p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${
          isCollapsed ? 'left-16 w-64' : 'left-0 w-64'
        }`}>
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : 'My Profile'}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleMenuItemClick(() => navigate('/profile-setup'))}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="h-4 w-4 mr-3 text-gray-400" />
              {language === 'en' ? 'Edit Profile' : 'ပရိုဖိုင်ပြင်ဆင်ရန်'}
            </button>

            <button
              onClick={() => handleMenuItemClick(() => navigate('/help'))}
              className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <HelpCircle className="h-4 w-4 mr-3 text-gray-400" />
              {language === 'en' ? 'Help & Support' : 'အကူအညီနှင့် ပံ့ပိုးမှု'}
            </button>

            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              {language === 'en' ? 'Sign Out' : 'ထွက်မည်'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;