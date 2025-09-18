import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Auth from '../components/Auth';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check URL params to determine initial mode
  const initialMode = searchParams.get('mode') === 'login' ? false : true;
  
  // Update page title based on mode
  useEffect(() => {
    document.title = initialMode ? 'Get Started - My New Start' : 'Welcome Back - My New Start';
  }, [initialMode]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
      {/* Back to landing page button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-white hover:text-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 rounded-lg p-2"
          aria-label="Back to home page"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
      </div>
      
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between min-h-screen">
        {/* Left side - Branding */}
        <div className="lg:w-1/2 text-white text-center lg:text-left mb-8 lg:mb-0 animate-fade-in">
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
        </div>

        {/* Right side - Auth form */}
        <div className="lg:w-5/12 animate-slide-up">
          <Auth initialIsSignUp={initialMode} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;