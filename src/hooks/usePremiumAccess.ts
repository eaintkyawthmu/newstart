import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface PremiumStatus {
  hasPremiumAccess: boolean;
  subscriptionStatus: string | null;
  premiumTier: string | null;
  premiumAccessUntil: Date | null;
  loading: boolean;
}

export const usePremiumAccess = (): PremiumStatus => {
  const { user } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({
    hasPremiumAccess: false,
    subscriptionStatus: null,
    premiumTier: null,
    premiumAccessUntil: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setPremiumStatus({
        hasPremiumAccess: false,
        subscriptionStatus: null,
        premiumTier: null,
        premiumAccessUntil: null,
        loading: false,
      });
      return;
    }

    const checkPremiumAccess = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, subscription_status, premium_tier, premium_access_until')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Handle case where no profile exists yet
        if (!data) {
          setPremiumStatus({
            hasPremiumAccess: false,
            subscriptionStatus: null,
            premiumTier: null,
            premiumAccessUntil: null,
            loading: false,
          });
          return;
        }

        const now = new Date();
        const accessUntil = data.premium_access_until ? new Date(data.premium_access_until) : null;
        
        // Check if user has premium access
        const hasPremiumAccess = 
          data.role === 'admin' || 
          data.role === 'premium' ||
          (data.subscription_status === 'active' && (!accessUntil || accessUntil > now));

        setPremiumStatus({
          hasPremiumAccess,
          subscriptionStatus: data.subscription_status,
          premiumTier: data.premium_tier,
          premiumAccessUntil: accessUntil,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking premium access:', error);
        setPremiumStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkPremiumAccess();
  }, [user]);

  return premiumStatus;
};

// Hook for checking specific premium features
export const useFeatureAccess = (featureName: string): boolean => {
  const { hasPremiumAccess } = usePremiumAccess();

  // Define which features require premium access
  const premiumFeatures = [
    'premium_courses',
    'advanced_analytics',
    'priority_support',
    'one_on_one_consultations',
    'exclusive_content',
    'advanced_chat_features',
  ];

  // If it's a premium feature, check premium access
  if (premiumFeatures.includes(featureName)) {
    return hasPremiumAccess;
  }

  // Free features are always accessible
  return true;
};