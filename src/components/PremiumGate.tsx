import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePremiumAccess } from '../hooks/usePremiumAccess';
import { useNavigate } from 'react-router-dom';
import { Lock, Star, Crown } from 'lucide-react';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const PremiumGate: React.FC<PremiumGateProps> = ({ 
  children, 
  feature, 
  fallback,
  showUpgradePrompt = true 
}) => {
  const { language } = useLanguage();
  const { hasPremiumAccess, loading } = usePremiumAccess();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasPremiumAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Crown className="h-8 w-8 text-purple-600" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {language === 'en' ? 'Premium Feature' : 'Premium အင်္ဂါရပ်'}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {language === 'en'
          ? 'Upgrade to Premium to unlock this feature and get access to all premium content.'
          : 'ဤအင်္ဂါရပ်ကို ဖွင့်လှစ်ရန်နှင့် premium အကြောင်းအရာအားလုံးကို ရယူရန် Premium သို့ အဆင့်မြှင့်ပါ။'}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button 
          onClick={() => navigate('/subscription')}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
        >
          <Star className="h-5 w-5 mr-2" />
          {language === 'en' ? 'Upgrade to Premium' : 'Premium သို့ အဆင့်မြှင့်ရန်'}
        </button>
        
        <button 
          onClick={() => navigate('/dashboard')}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          {language === 'en' ? 'Learn More' : 'ပိုမိုလေ့လာရန်'}
        </button>
      </div>
    </div>
  );
};

export default PremiumGate;