import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const StripeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const testCheckoutSession = async (priceId: string, mode: 'subscription' | 'payment') => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log(`Creating checkout session for price ID: ${priceId}, mode: ${mode}`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId, mode }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        throw new Error(`Failed to create checkout session: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error('No checkout URL returned from server');
      }

      setSuccess(`Checkout session created successfully! Redirecting to Stripe...`);
      
      // Redirect to Stripe Checkout
      setTimeout(() => {
        window.location.href = data.url;
      }, 1500);
      
    } catch (err) {
      console.error('Error in testCheckoutSession:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testPortalSession = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Creating customer portal session');
      
      const { data, error } = await supabase.functions.invoke('create-portal-session');

      if (error) {
        console.error('Error creating portal session:', error);
        throw new Error(`Failed to create portal session: ${error.message}`);
      }

      if (!data?.url) {
        throw new Error('No portal URL returned from server');
      }

      setSuccess(`Portal session created successfully! Opening Stripe Customer Portal...`);
      
      // Open Stripe Customer Portal in a new tab
      window.open(data.url, '_blank');
      
    } catch (err) {
      console.error('Error in testPortalSession:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-8"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center mb-6">
          <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-800">Stripe Integration Test</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Checkout Session</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => testCheckoutSession(import.meta.env.VITE_STRIPE_PRICE_MONTHLY, 'subscription')}
                disabled={loading}
                className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Test Monthly Subscription'
                )}
              </button>
              
              <button
                onClick={() => testCheckoutSession(import.meta.env.VITE_STRIPE_PRICE_YEARLY, 'subscription')}
                disabled={loading}
                className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Test Yearly Subscription'
                )}
              </button>
              
              <button
                onClick={() => testCheckoutSession(import.meta.env.VITE_STRIPE_PRICE_LIFETIME, 'payment')}
                disabled={loading}
                className="p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  'Test Lifetime Payment'
                )}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Test Customer Portal</h2>
            <button
              onClick={testPortalSession}
              disabled={loading}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Test Customer Portal'
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Environment Variables</h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-700">
              <strong>VITE_STRIPE_PUBLISHABLE_KEY:</strong> {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Not set'}
            </p>
            <p className="text-blue-700">
              <strong>VITE_STRIPE_PRICE_MONTHLY:</strong> {import.meta.env.VITE_STRIPE_PRICE_MONTHLY ? '✅ Set' : '❌ Not set'}
            </p>
            <p className="text-blue-700">
              <strong>VITE_STRIPE_PRICE_YEARLY:</strong> {import.meta.env.VITE_STRIPE_PRICE_YEARLY ? '✅ Set' : '❌ Not set'}
            </p>
            <p className="text-blue-700">
              <strong>VITE_STRIPE_PRICE_LIFETIME:</strong> {import.meta.env.VITE_STRIPE_PRICE_LIFETIME ? '✅ Set' : '❌ Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Webhook Testing Instructions</h2>
        <p className="text-gray-600 mb-4">
          To test the webhook functionality, you'll need to use the Stripe CLI or the Stripe dashboard to send test events to your webhook endpoint.
        </p>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-800">Using Stripe Dashboard:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm mt-2">
              <li>Go to the Stripe Dashboard &gt; Developers &gt; Webhooks</li>
              <li>Find your webhook endpoint</li>
              <li>Click "Send test webhook"</li>
              <li>Select an event type (e.g., checkout.session.completed)</li>
              <li>Click "Send test webhook"</li>
            </ol>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">Using Stripe CLI:</h3>
            <div className="bg-gray-100 p-3 rounded-md mt-2 overflow-x-auto">
              <code className="text-sm text-gray-800">
                stripe trigger checkout.session.completed
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;