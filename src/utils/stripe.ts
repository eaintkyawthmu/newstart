import { stripePromise } from '../lib/stripeClient';

// Utility functions for Stripe operations
export const redirectToCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw new Error(error.message);
  }
};

// Format currency for display
export const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// Calculate savings for yearly plans
export const calculateYearlySavings = (monthlyPrice: number, yearlyPrice: number) => {
  const yearlyEquivalent = monthlyPrice * 12;
  const savings = yearlyEquivalent - yearlyPrice;
  const savingsPercentage = (savings / yearlyEquivalent) * 100;
  
  return {
    savings,
    savingsPercentage: Math.round(savingsPercentage),
    yearlyEquivalent
  };
};

// Validate price IDs
export const validatePriceId = (priceId: string): boolean => {
  return priceId.startsWith('price_') && priceId.length > 10;
};

// Get plan details from price ID
export const getPlanFromPriceId = (priceId: string) => {
  // This would typically come from your Stripe dashboard or a configuration file
  const priceMap: Record<string, { name: string; interval: string; amount: number }> = {
    [import.meta.env.VITE_STRIPE_PRICE_MONTHLY]: { name: 'Premium', interval: 'month', amount: 1299 },
    [import.meta.env.VITE_STRIPE_PRICE_YEARLY]: { name: 'Premium', interval: 'year', amount: 9999 },
    [import.meta.env.VITE_STRIPE_PRICE_LIFETIME]: { name: 'Lifetime', interval: 'one-time', amount: 29999 }
  };
  
  return priceMap[priceId] || null;
};