import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { stripeConfig } from '../lib/stripeClient';
import { useToast } from '../contexts/ToastContext';
import { useLanguage } from '../contexts/LanguageContext';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const createCheckoutSession = async (
    priceId: string, 
    mode: 'subscription' | 'payment' = 'subscription'
  ) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          priceId, 
          mode,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned from server');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('error', language === 'en' 
        ? 'Failed to start checkout process. Please try again.' 
        : 'ငွေပေးချေမှုလုပ်ငန်းစဉ်ကို စတင်ရန် မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။');
    } finally {
      setLoading(false);
    }
  };

  const createPortalSession = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session');

      if (error) {
        console.error('Error creating portal session:', error);
        throw new Error(error.message || 'Failed to create portal session');
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error('No portal URL returned from server');
      }
    } catch (error) {
      console.error('Portal error:', error);
      showToast('error', language === 'en' 
        ? 'Failed to open billing portal. Please try again.' 
        : 'ငွေပေးချေမှုပေါ်တယ်ကို ဖွင့်ရန် မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPlan = async (plan: 'monthly' | 'yearly' | 'lifetime') => {
    const priceId = stripeConfig.prices[plan];
    const mode = plan === 'lifetime' ? 'payment' : 'subscription';
    
    if (!priceId) {
      showToast('error', 'Invalid subscription plan selected');
      return;
    }
    
    await createCheckoutSession(priceId, mode);
  };

  return {
    loading,
    createCheckoutSession,
    createPortalSession,
    subscribeToPlan,
    prices: stripeConfig.prices
  };
};