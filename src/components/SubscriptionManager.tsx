import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { usePremiumAccess } from '../hooks/usePremiumAccess';
import { useStripe } from '../hooks/useStripe';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { 
  Crown, 
  Check, 
  Star, 
  CreditCard, 
  Calendar,
  ExternalLink,
  Loader2,
  Shield,
  Zap,
  Users,
  Clock,
  Award
} from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

const SubscriptionManager: React.FC = () => {
  const { language } = useLanguage();
  const { hasPremiumAccess, subscriptionStatus, premiumTier, premiumAccessUntil } = usePremiumAccess();
  const { loading: stripeLoading, subscribeToPlan, createPortalSession } = useStripe();
  const { showToast } = useToast();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchSubscriptionTiers();
  }, []);

  const fetchSubscriptionTiers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setTiers(data || []);
    } catch (error) {
      console.error('Error fetching subscription tiers:', error);
      showToast('error', language === 'en' 
        ? 'Failed to load subscription options' 
        : 'အသင်းဝင်ရွေးချယ်စရာများကို တင်ရန် မအောင်မြင်ပါ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tierName: string) => {
    if (tierName === 'lifetime') {
      await subscribeToPlan('lifetime');
    } else {
      await subscribeToPlan(billingInterval);
    }
  };

  const handleManageSubscription = createPortalSession;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Define tier features based on the pricing model
  const tierFeatures = {
    free: [
      language === 'en' ? 'Core Journey Path Previews (first 1-2 modules)' : 'အခြေခံခရီးစဉ်လမ်းကြောင်း အစမ်းကြည့်ရှုခြင်း (ပထမ ၁-၂ မော်ဂျူး)',
      language === 'en' ? 'Limited Mini Angel AI (3-5 questions per day)' : 'ကန့်သတ်ထားသော Mini Angel AI (တစ်ရက်လျှင် မေးခွန်း ၃-၅ ခု)',
      language === 'en' ? 'Curated Knowledge Library (selected articles)' : 'ရွေးချယ်ထားသော ဗဟုသုတစာကြည့်တိုက် (ရွေးချယ်ထားသော ဆောင်းပါးများ)',
      language === 'en' ? 'Basic Profile & Progress Tracking' : 'အခြေခံပရိုဖိုင်နှင့် တိုးတက်မှုခြေရာခံခြင်း',
      language === 'en' ? 'Community Links' : 'အသိုင်းအဝိုင်းလင့်ခ်များ',
      language === 'en' ? 'Essential Checklists' : 'မရှိမဖြစ် စစ်ဆေးရန်စာရင်းများ'
    ],
    premium: [
      language === 'en' ? 'Full Access to All Journey Paths' : 'ခရီးစဉ်လမ်းကြောင်းအားလုံးကို အပြည့်အဝရယူခွင့်',
      language === 'en' ? 'Unlimited Mini Angel AI Support' : 'အကန့်အသတ်မရှိ Mini Angel AI ပံ့ပိုးမှု',
      language === 'en' ? 'Full Knowledge Library Access' : 'ဗဟုသုတစာကြည့်တိုက်ကို အပြည့်အဝရယူခွင့်',
      language === 'en' ? 'Advanced Progress Tracking & Analytics' : 'အဆင့်မြင့်တိုးတက်မှုခြေရာခံခြင်းနှင့် ဒေတာခွဲခြမ်းစိတ်ဖြာမှု',
      language === 'en' ? 'Premium Downloadable Resources' : 'Premium ဒေါင်းလုဒ်ရယူနိုင်သော အရင်းအမြစ်များ',
      language === 'en' ? 'Priority Email Support' : 'ဦးစားပေးအီးမေးလ်ပံ့ပိုးမှု',
      language === 'en' ? 'Early Access to New Content' : 'အကြောင်းအရာအသစ်များကို စောစီးစွာရယူခွင့်',
      language === 'en' ? 'One Free 15-min Consultation (Annual Plan)' : 'အခမဲ့ ၁၅-မိနစ် တိုင်ပင်ဆွေးနွေးမှု (နှစ်စဉ်အစီအစဉ်)'
    ],
    lifetime: [
      language === 'en' ? 'All Premium Features for 10 Years' : 'Premium အင်္ဂါရပ်အားလုံး ၁၀ နှစ်စာ',
      language === 'en' ? 'Advanced "Thriving in the US" Content' : 'အဆင့်မြင့် "အမေရိကန်တွင် ကြီးပွားတိုးတက်ခြင်း" အကြောင်းအရာ',
      language === 'en' ? 'Wealth Building & Advanced Investing' : 'ဥစ္စာဓနတည်ဆောက်ခြင်းနှင့် အဆင့်မြင့်ရင်းနှီးမြှုပ်နှံခြင်း',
      language === 'en' ? 'Entrepreneurship & Business Guidance' : 'စွန့်ဦးတီထွင်မှုနှင့် စီးပွားရေးလမ်းညွှန်မှု',
      language === 'en' ? 'Citizenship & Advanced Immigration' : 'နိုင်ငံသားဖြစ်မှုနှင့် အဆင့်မြင့်လူဝင်မှုကြီးကြပ်ရေး',
      language === 'en' ? 'U.S. Regulatory Updates' : 'အမေရိကန်စည်းမျဉ်းဆိုင်ရာ အပ်ဒိတ်များ',
      language === 'en' ? 'Exclusive "Elite Member" Community' : 'သီးသန့် "Elite အဖွဲ့ဝင်" အသိုင်းအဝိုင်း',
      language === 'en' ? 'Annual Live Q&A Sessions' : 'နှစ်စဉ်တိုက်ရိုက်မေးဖြေပွဲများ',
      language === 'en' ? 'Family Share (up to 2 members)' : 'မိသားစုမျှဝေခြင်း (အဖွဲ့ဝင် ၂ ဦးအထိ)',
      language === 'en' ? 'Exclusive Downloadable Tools' : 'သီးသန့်ဒေါင်းလုဒ်ရယူနိုင်သော ကိရိယာများ'
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Current Subscription Status */}
      {hasPremiumAccess && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Crown className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {language === 'en' ? 'Premium Active' : 'Premium အသုံးပြုနေသည်'}
                </h3>
                <p className="text-gray-600">
                  {premiumTier === 'lifetime' 
                    ? (language === 'en' ? 'Lifetime Access' : 'တစ်သက်တာ အသုံးပြုခွင့်')
                    : premiumAccessUntil 
                      ? `${language === 'en' ? 'Renews on' : 'ပြန်လည်သက်တမ်းတိုးမည့်ရက်'} ${premiumAccessUntil.toLocaleDateString()}`
                      : subscriptionStatus
                  }
                </p>
              </div>
            </div>
            
            {premiumTier !== 'lifetime' && (
              <button
                onClick={createPortalSession}
                className="flex items-center px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Manage Billing' : 'ငွေပေးချေမှု စီမံရန်'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Billing Interval Toggle */}
      {!hasPremiumAccess && (
        <div className="flex justify-center">
          <div className="bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? 'Monthly' : 'လစဉ်'}
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingInterval === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {language === 'en' ? 'Yearly' : 'နှစ်စဉ်'}
              <span className="ml-1 text-green-600 text-xs">
                {language === 'en' ? 'Save 36%' : '36% ချွေတာ'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Tier */}
        <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'en' ? 'Free' : 'အခမဲ့'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {language === 'en' ? 'Get started with basic guidance' : 'အခြေခံလမ်းညွှန်မှုဖြင့် စတင်ပါ'}
            </p>
            
            <div className="mb-6">
              <div className="text-2xl font-bold text-gray-900">
                {language === 'en' ? 'Free' : 'အခမဲ့'}
              </div>
              <div className="text-gray-600 text-sm">
                {language === 'en' ? 'Forever' : 'အမြဲတမ်း'}
              </div>
            </div>
            
            <div className="space-y-3 text-left mb-6">
              {tierFeatures.free.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <button
              disabled={true}
              className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              {language === 'en' ? 'Current Plan' : 'လက်ရှိအစီအစဉ်'}
            </button>
          </div>
        </div>

        {/* Premium Tier */}
        <div className="relative rounded-xl border border-purple-200 bg-gradient-to-b from-purple-50 to-white p-6 shadow-md">
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
            <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              {language === 'en' ? 'POPULAR' : 'လူကြိုက်များ'}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'en' ? 'Premium' : 'ပရီမီယံ'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {language === 'en' ? 'Comprehensive guidance and support' : 'ပြည့်စုံသော လမ်းညွှန်မှုနှင့် ပံ့ပိုးမှု'}
            </p>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                ${billingInterval === 'monthly' ? '12.99' : '99.99'}
              </div>
              <div className="text-gray-600 text-sm">
                {billingInterval === 'monthly'
                  ? (language === 'en' ? '/month' : '/လ')
                  : (language === 'en' ? '/year' : '/နှစ်')
                }
                {billingInterval === 'yearly' && (
                  <span className="ml-1 text-green-600">
                    (${(12.99 * 12 - 99.99).toFixed(2)} {language === 'en' ? 'saved' : 'ချွေတာ'})
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-3 text-left mb-6">
              {tierFeatures.premium.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            {hasPremiumAccess && premiumTier === 'premium' ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
              >
                {language === 'en' ? 'Current Plan' : 'လက်ရှိအစီအစဉ်'}
              </button>
            ) : (
              <button
                onClick={() => handleUpgrade('premium')}
                disabled={stripeLoading}
                className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                {stripeLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <>
                    {language === 'en' ? 'Upgrade' : 'အဆင့်မြှင့်ရန်'}
                    <Star className="h-4 w-4 ml-2 inline" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Elite/Lifetime Tier */}
        <div className="relative rounded-xl border border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-6 shadow-md">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === 'en' ? 'Lifetime' : 'တစ်သက်တာ'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {language === 'en' ? 'Long-term partnership for success' : 'အောင်မြင်မှုအတွက် ရေရှည်မိတ်ဖက်'}
            </p>
            
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900">
                $299
              </div>
              <div className="text-gray-600 text-sm">
                {language === 'en' ? 'One-time payment' : 'တစ်ကြိမ်တည်း ပေးချေမှု'}
              </div>
            </div>
            
            <div className="space-y-3 text-left mb-6">
              {tierFeatures.lifetime.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            {hasPremiumAccess && premiumTier === 'lifetime' ? (
              <button
                disabled
                className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
              >
                {language === 'en' ? 'Current Plan' : 'လက်ရှိအစီအစဉ်'}
              </button>
            ) : (
              <button
                disabled={true}
                className="w-full bg-gray-300 text-gray-600 px-4 py-3 rounded-lg font-medium cursor-not-allowed"
              >
                {language === 'en' ? 'Coming Soon' : 'မကြာမီလာမည်'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200 shadow-sm overflow-hidden">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          {language === 'en' ? 'Plan Comparison' : 'အစီအစဉ်နှိုင်းယှဉ်ချက်'}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Feature' : 'အင်္ဂါရပ်'}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {language === 'en' ? 'Free' : 'အခမဲ့'}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-purple-600 uppercase tracking-wider bg-purple-50">
                  {language === 'en' ? 'Premium' : 'ပရီမီယံ'}
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-indigo-600 uppercase tracking-wider bg-indigo-50">
                  {language === 'en' ? 'Lifetime' : 'တစ်သက်တာ'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Journey Paths */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Journey Paths' : 'ခရီးစဉ်လမ်းကြောင်းများ'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {language === 'en' ? 'First 1-2 modules' : 'ပထမ ၁-၂ မော်ဂျူး'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              
              {/* Mini Angel AI */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Mini Angel AI' : 'Mini Angel AI'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {language === 'en' ? '3-5 questions/day' : 'တစ်ရက်လျှင် ၃-၅ မေးခွန်း'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  {language === 'en' ? 'Unlimited' : 'အကန့်အသတ်မရှိ'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  {language === 'en' ? 'Unlimited' : 'အကန့်အသတ်မရှိ'}
                </td>
              </tr>
              
              {/* Knowledge Library */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Knowledge Library' : 'ဗဟုသုတစာကြည့်တိုက်'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {language === 'en' ? 'Selected articles' : 'ရွေးချယ်ထားသော ဆောင်းပါးများ'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
              </tr>
              
              {/* Advanced Content */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Advanced Content' : 'အဆင့်မြင့်အကြောင်းအရာ'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  <div className="flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-500 mr-1" />
                    <span className="text-xs">{language === 'en' ? '+ Elite content' : '+ Elite အကြောင်းအရာ'}</span>
                  </div>
                </td>
              </tr>
              
              {/* Support */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Support' : 'ပံ့ပိုးမှု'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {language === 'en' ? 'Community' : 'အသိုင်းအဝိုင်း'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  {language === 'en' ? 'Priority Email' : 'ဦးစားပေးအီးမေးလ်'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  {language === 'en' ? 'VIP Support' : 'VIP ပံ့ပိုးမှု'}
                </td>
              </tr>
              
              {/* Consultations */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Consultations' : 'တိုင်ပင်ဆွေးနွေးမှုများ'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-purple-50">
                  {language === 'en' ? '1 free (Annual)' : '၁ ကြိမ်အခမဲ့ (နှစ်စဉ်)'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  {language === 'en' ? 'Annual Q&A Sessions' : 'နှစ်စဉ်မေးဖြေပွဲများ'}
                </td>
              </tr>
              
              {/* Family Sharing */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {language === 'en' ? 'Family Sharing' : 'မိသားစုမျှဝေခြင်း'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-purple-50">
                  —
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center bg-indigo-50">
                  {language === 'en' ? 'Up to 2 members' : 'အဖွဲ့ဝင် ၂ ဦးအထိ'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {language === 'en' ? 'Frequently Asked Questions' : 'မေးလေ့ရှိသော မေးခွန်းများ'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">
              {language === 'en' ? 'Can I cancel anytime?' : 'မည်သည့်အချိန်တွင်မဆို ပယ်ဖျက်နိုင်ပါသလား။'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
                : 'ဟုတ်ကဲ့၊ သင့်အစီအစဉ်ကို မည်သည့်အချိန်တွင်မဆို ပယ်ဖျက်နိုင်ပါသည်။ သင့်ငွေပေးချေမှုကာလ ကုန်ဆုံးသည်အထိ အသုံးပြုခွင့် ဆက်လက်ရရှိမည်ဖြစ်သည်။'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              {language === 'en' ? 'What\'s included in the premium plan?' : 'Premium အစီအစဉ်တွင် ဘာတွေပါဝင်သလဲ။'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? 'Premium includes all lessons, premium courses, priority support, advanced analytics, and 1-on-1 consultations.'
                : 'Premium တွင် သင်ခန်းစာအားလုံး၊ premium သင်တန်းများ၊ ဦးစားပေးပံ့ပိုးမှု၊ အဆင့်မြင့်ဒေတာခွဲခြမ်းစိတ်ဖြာမှုနှင့် တစ်ဦးချင်းဆွေးနွေးမှုများ ပါဝင်သည်။'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              {language === 'en' ? 'Is there a refund policy?' : 'ငွေပြန်အမ်းမူဝါဒ ရှိပါသလား။'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? 'We offer a 14-day money-back guarantee for all subscription plans. If you\'re not satisfied, contact our support team.'
                : 'အစီအစဉ်အားလုံးအတွက် ၁၄ ရက် ငွေပြန်အမ်းအာမခံချက် ပေးပါသည်။ ကျေနပ်မှုမရှိပါက ကျွန်ုပ်တို့၏ ပံ့ပိုးမှုအဖွဲ့ကို ဆက်သွယ်ပါ။'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              {language === 'en' ? 'What does "Lifetime" access mean?' : '"တစ်သက်တာ" အသုံးပြုခွင့်ဆိုသည်မှာ ဘာကိုဆိုလိုသနည်း။'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? 'Lifetime access means you\'ll have access to the platform and all updates for as long as the platform exists, with a guaranteed minimum of 10 years of service and updates.'
                : 'တစ်သက်တာအသုံးပြုခွင့်ဆိုသည်မှာ ပလက်ဖောင်းတည်ရှိသရွေ့ ပလက်ဖောင်းနှင့် အပ်ဒိတ်အားလုံးကို ရယူနိုင်မည်ဖြစ်ပြီး၊ အနည်းဆုံး ၁၀ နှစ်ကြာ ဝန်ဆောင်မှုနှင့် အပ်ဒိတ်များကို အာမခံပါသည်။'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">
              {language === 'en' ? 'How does Family Sharing work?' : 'မိသားစုမျှဝေခြင်း မည်သို့အလုပ်လုပ်သနည်း။'}
            </h4>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? 'With the Lifetime plan, you can share your account with up to 2 immediate family members. Contact our support team after purchase to set this up.'
                : 'တစ်သက်တာအစီအစဉ်ဖြင့် သင့်အကောင့်ကို မိသားစုဝင် ၂ ဦးအထိ မျှဝေနိုင်ပါသည်။ ဝယ်ယူပြီးနောက် ဤအရာကို စီစဉ်ရန် ကျွန်ုပ်တို့၏ ပံ့ပိုးမှုအဖွဲ့ကို ဆက်သွယ်ပါ။'}
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          {language === 'en' ? 'What Our Members Say' : 'ကျွန်ုပ်တို့၏အဖွဲ့ဝင်များ ပြောကြားချက်'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Maria S.</h4>
                <p className="text-xs text-gray-500">Mexico</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? "Mini Angel helped me understand credit scores in just one week. Now I have my first credit card!"
                : "Mini Angel သည် တစ်ပတ်အတွင်း ခရက်ဒစ်အမှတ်များကို နားလည်ရန် ကူညီခဲ့သည်။ ယခု ကျွန်ုပ်တွင် ပထမဆုံး ခရက်ဒစ်ကတ်ရှိပါပြီ!"}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Ahmed K.</h4>
                <p className="text-xs text-gray-500">Syria</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? "The premium plan was worth every penny. The advanced content on buying a home saved me thousands of dollars!"
                : "ပရီမီယံအစီအစဉ်သည် ငွေတိုင်းတန်ပါသည်။ အိမ်ဝယ်ယူခြင်းဆိုင်ရာ အဆင့်မြင့်အကြောင်းအရာသည် ကျွန်ုပ်အတွက် ဒေါ်လာထောင်ပေါင်းများစွာ ချွေတာပေးခဲ့သည်!"}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">Lin W.</h4>
                <p className="text-xs text-gray-500">China</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              {language === 'en'
                ? "I upgraded to Lifetime and it's been the best investment. The exclusive community has connected me with successful entrepreneurs."
                : "တစ်သက်တာအစီအစဉ်သို့ အဆင့်မြှင့်ခဲ့ပြီး အကောင်းဆုံးရင်းနှီးမြှုပ်နှံမှုဖြစ်ခဲ့သည်။ သီးသန့်အသိုင်းအဝိုင်းသည် ကျွန်ုပ်ကို အောင်မြင်သော စွန့်ဦးတီထွင်သူများနှင့် ချိတ်ဆက်ပေးခဲ့သည်။"}
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 mb-4">
          {language === 'en' ? 'Secure Payment Processing' : 'လုံခြုံသော ငွေပေးချေမှုလုပ်ငန်းစဉ်'}
        </p>
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center text-gray-400">
            <Shield className="h-5 w-5 mr-1" />
            <span className="text-xs">SSL Secure</span>
          </div>
          <div className="flex items-center text-gray-400">
            <CreditCard className="h-5 w-5 mr-1" />
            <span className="text-xs">Stripe</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Zap className="h-5 w-5 mr-1" />
            <span className="text-xs">256-bit Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;