import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AuthProps {
  initialIsSignUp?: boolean;
}

const Auth: React.FC<AuthProps> = ({ initialIsSignUp = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?reset=true`,
        });

        if (resetError) throw resetError;

        setSuccess('Password reset instructions have been sent to your email.');
        return;
      }

      if (isSignUp) {
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('User already registered')) {
            setIsSignUp(false);
            setError('An account with this email already exists. Please sign in instead.');
            return;
          }
          throw signUpError;
        }

        // Create profile for new user
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              full_name: fullName,
              email: email,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) throw profileError;
        }

        setSuccess('Account created successfully! You can now sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          // Handle different types of authentication errors
          if (signInError.message.includes('Invalid login credentials') || 
              signInError.message.includes('invalid_credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (signInError.message.includes('Email not confirmed')) {
            setError('Please check your email and click the confirmation link before signing in.');
          } else if (signInError.message.includes('Too many requests')) {
            setError('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            setError('Unable to sign in. Please try again or contact support if the problem persists.');
          }
          return;
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setError(null);
    setSuccess(null);
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-soft-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {isForgotPassword 
            ? 'Reset Your Password' 
            : isSignUp 
              ? 'Create an Account' 
              : 'Welcome Back'}
        </h2>
        <p className="text-gray-600 mt-2">
          {isForgotPassword
            ? 'Enter your email to receive reset instructions'
            : isSignUp
              ? 'Get started with your free account'
              : 'Sign in to access My New Start'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-error-50 border border-error-200 rounded-lg text-error-600 text-sm flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg text-success-600 text-sm flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && !isForgotPassword && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {!isForgotPassword && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                aria-describedby={error ? "password-error" : undefined}
                aria-describedby={error ? "email-error" : undefined}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus-ring rounded"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {isSignUp && (
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center focus-ring disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          aria-describedby={error ? "form-error" : undefined}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
          ) : (
            <>
              {isForgotPassword 
                ? 'Send Reset Instructions' 
                : isSignUp 
                  ? 'Sign Up' 
                  : 'Sign In'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>

        {!isSignUp && !isForgotPassword && (
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-primary-600 py-2 px-4 rounded-lg font-medium hover:text-primary-700 transition-colors duration-200 focus-ring min-h-[44px]"
          >
            Forgot your password?
          </button>
        )}

        {isForgotPassword && (
          <button
            type="button"
            onClick={handleBackToSignIn}
            className="w-full text-primary-600 py-2 px-4 rounded-lg font-medium hover:text-primary-700 transition-colors duration-200 focus-ring min-h-[44px]"
          >
            Back to Sign In
          </button>
        )}
      </form>

      {!isForgotPassword && (
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-primary-600 hover:text-primary-700 font-medium focus-ring rounded px-2 py-1"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;