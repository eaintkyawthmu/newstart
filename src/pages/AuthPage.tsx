import React, { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Auth from '../components/Auth';
import { CreditCard } from 'lucide-react';

const AuthPage = () => {
  const { user } = useAuth();
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
        </div>

        {/* Right side - Auth form */}
        <div className="lg:w-5/12">
          <Auth />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;