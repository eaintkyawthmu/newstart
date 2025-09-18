import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // Hide the indicator after 3 seconds when back online
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!showIndicator) return null;

  return (
    <div 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline 
          ? 'bg-green-500 text-white animate-slide-down' 
          : 'bg-red-500 text-white animate-bounce'
      }`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center space-x-3">
        {isOnline ? (
          <Wifi className="h-5 w-5" aria-hidden="true" />
        ) : (
          <WifiOff className="h-5 w-5" aria-hidden="true" />
        )}
        
        <span className="font-medium text-sm">
          {isOnline 
            ? (language === 'en' ? 'Back online' : 'အွန်လိုင်းပြန်ရောက်ပြီ')
            : (language === 'en' ? 'You\'re offline' : 'သင် အော့ဖ်လိုင်းဖြစ်နေသည်')}
        </span>
        
        {!isOnline && (
          <button
            onClick={handleRetry}
            className="ml-2 p-1 rounded hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={language === 'en' ? 'Retry connection' : 'ချိတ်ဆက်မှု ပြန်လည်ကြိုးစားရန်'}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;