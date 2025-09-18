import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { 
  Bell, 
  X, 
  Check, 
  Award, 
  BookOpen, 
  CreditCard, 
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'milestone' | 'lesson' | 'subscription' | 'system' | 'reminder';
  read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    try {
      // Mock notifications - in a real app, these would come from your database
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: language === 'en' ? 'Milestone Earned!' : 'မှတ်တိုင်ရရှိပြီ!',
          message: language === 'en' 
            ? 'You\'ve earned the "First Steps" milestone for completing your first lesson!'
            : 'သင့်ပထမဆုံးသင်ခန်းစာ ပြီးဆုံးခြင်းအတွက် "ပထမအဆင့်များ" မှတ်တိုင်ကို ရရှိပြီးပါပြီ!',
          type: 'milestone',
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          action_url: '/milestones',
          action_label: language === 'en' ? 'View Milestones' : 'မှတ်တိုင်များကြည့်ရန်'
        },
        {
          id: '2',
          title: language === 'en' ? 'New Lesson Available' : 'သင်ခန်းစာအသစ် ရရှိနိုင်ပါပြီ',
          message: language === 'en'
            ? 'Continue your credit building journey with "Understanding Credit Scores"'
            : '"ခရက်ဒစ်အမှတ်များကို နားလည်ခြင်း" ဖြင့် သင့်ခရက်ဒစ်တည်ဆောက်မှုခရီးစဉ်ကို ဆက်လက်လုပ်ဆောင်ပါ',
          type: 'lesson',
          read: false,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          action_url: '/courses/build-credit/lessons/understanding-credit-scores',
          action_label: language === 'en' ? 'Start Lesson' : 'သင်ခန်းစာ စတင်ရန်'
        },
        {
          id: '3',
          title: language === 'en' ? 'Weekly Progress Summary' : 'အပတ်စဉ် တိုးတက်မှုအကျဉ်းချုပ်',
          message: language === 'en'
            ? 'You completed 3 lessons this week. Keep up the great work!'
            : 'ဤအပတ်တွင် သင်ခန်းစာ ၃ ခု ပြီးဆုံးခဲ့သည်။ ကောင်းမွန်သောအလုပ်ကို ဆက်လက်လုပ်ဆောင်ပါ!',
          type: 'system',
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          id: '4',
          title: language === 'en' ? 'Payment Reminder' : 'ငွေပေးချေမှု သတိပေးချက်',
          message: language === 'en'
            ? 'Your premium subscription will renew in 3 days'
            : 'သင့် premium အသင်းဝင်ခြင်းကို ၃ ရက်အတွင်း ပြန်လည်သက်တမ်းတိုးမည်',
          type: 'subscription',
          read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          action_url: '/subscription',
          action_label: language === 'en' ? 'Manage Subscription' : 'အသင်းဝင်ခြင်း စီမံရန်'
        }
      ];

      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // In a real app, you would update the database here
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // In a real app, you would update the database here
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Award className="h-5 w-5 text-yellow-500" />;
      case 'lesson':
        return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'subscription':
        return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return language === 'en' ? `${diffInMinutes}m ago` : `${diffInMinutes} မိနစ်ကြာ`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return language === 'en' ? `${hours}h ago` : `${hours} နာရီကြာ`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return language === 'en' ? `${days}d ago` : `${days} ရက်ကြာ`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16 px-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notifications-title"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="notifications-title" className="text-lg font-semibold text-gray-900 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-blue-600" />
            {language === 'en' ? 'Notifications' : 'အကြောင်းကြားချက်များ'}
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {unreadCount}
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              >
                {language === 'en' ? 'Mark all read' : 'အားလုံး ဖတ်ပြီးအဖြစ် မှတ်သားရန်'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={language === 'en' ? 'Close notifications' : 'အကြောင်းကြားချက်များ ပိတ်ရန်'}
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-sm">
                {language === 'en' ? 'Loading notifications...' : 'အကြောင်းကြားချက်များ တင်နေသည်...'}
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {language === 'en' ? 'No notifications' : 'အကြောင်းကြားချက်များ မရှိပါ'}
              </h3>
              <p className="text-gray-500 text-sm">
                {language === 'en' 
                  ? 'You\'re all caught up! New notifications will appear here.'
                  : 'သင် အားလုံးကို လိုက်ကြည့်ပြီးပါပြီ! အကြောင်းကြားချက်အသစ်များ ဤနေရာတွင် ပေါ်လာမည်။'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          )}
                          {notification.action_url && (
                            <button
                              onClick={() => {
                                if (notification.action_url) {
                                  window.location.href = notification.action_url;
                                }
                                onClose();
                              }}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                            >
                              {notification.action_label}
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;