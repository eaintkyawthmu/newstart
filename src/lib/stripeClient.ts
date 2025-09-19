import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };

// Stripe configuration
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  prices: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
    yearly: import.meta.env.VITE_STRIPE_PRICE_YEARLY,
    lifetime: import.meta.env.VITE_STRIPE_PRICE_LIFETIME,
  }
};

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const errors = [];
  
  if (!stripeConfig.publishableKey) {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is not set');
  }
  
  if (!stripeConfig.prices.monthly) {
    errors.push('VITE_STRIPE_PRICE_MONTHLY is not set');
  }
  
  if (!stripeConfig.prices.yearly) {
    errors.push('VITE_STRIPE_PRICE_YEARLY is not set');
  }
  
  if (!stripeConfig.prices.lifetime) {
    errors.push('VITE_STRIPE_PRICE_LIFETIME is not set');
  }
  
  if (errors.length > 0) {
    console.error('Stripe configuration errors:', errors);
    return false;
  }
  
  return true;
};