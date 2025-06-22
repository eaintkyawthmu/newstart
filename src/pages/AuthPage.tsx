import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { CreditCard, ArrowRight, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const AuthPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Check URL params to determine initial mode
  const initialMode = searchParams.get('mode') === 'login' ? false : true;
  
  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update page title based on mode
  useEffect(() => {
    document.title = isSignUp ? 'Get Started - My New Start' : 'Welcome Back - My New Start';
  }, [isSignUp]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const createOrUpdateProfile = async (userId: string) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: fullName,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Profile error:', err);
      throw err;
    }
  };

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
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

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

        if (data.user) {
          await createOrUpdateProfile(data.user.id);
          setSuccess('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setPassword('');
          setConfirmPassword('');
          return;
        }
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

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
    setAcceptTerms(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    // Update URL without page reload
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('mode', !isSignUp ? 'signup' : 'login');
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleBackToSignIn = () => {
    setIsForgotPassword(false);
    setError(null);
    setSuccess(null);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between min-h-screen">
        {/* Left side - Branding */}
        <div className="lg:w-1/2 text-white text-center lg:text-left mb-8 lg:mb-0">
          <div className="flex items-center justify-center lg:justify-start mb-6">
            <CreditCard className="h-10 w-10 mr-3" />
            <h1 className="text-3xl font-bold">Welcome to MyNewStart</h1>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Understand life in America — one step at a time.
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey with step-by-step lessons to build credit, manage money, and confidently navigate life in the U.S.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-200 mr-2" />
              <span className="text-blue-100">Free to get started</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-200 mr-2" />
              <span className="text-blue-100">No credit card required</span>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="lg:w-5/12">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            {isForgotPassword ? (
              <>
                <button
                  onClick={handleBackToSignIn}
                  className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Sign In
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Reset Your Password
                </h2>
                <p className="text-gray-600 mb-6">
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {isSignUp ? 'Create an Account' : 'Welcome back'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isSignUp 
                    ? 'Get started with your free account. No credit card required.'
                    : 'Enter your credentials to access your account'}
                </p>
              </>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {isSignUp && (
                    <p className="mt-1 text-sm text-gray-500">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
              )}

              {isSignUp && !isForgotPassword && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      required
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      I accept the terms and conditions
                    </span>
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={loading || (isSignUp && !acceptTerms)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    {isForgotPassword ? 'Send Reset Instructions' : (isSignUp ? 'Create an Account' : 'Sign In')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>

              {!isSignUp && !isForgotPassword && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>

            {!isForgotPassword && (
              <div className="mt-6 text-center">
                <button
                  onClick={switchMode}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isSignUp 
                    ? 'Already have an account? Sign in' 
                    : "Don't have an account? Get started"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;