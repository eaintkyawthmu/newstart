import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import SkipLink from './components/SkipLink';
import { LanguageProvider } from './contexts/LanguageContext';
import { StepProvider } from './contexts/StepContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AccessibilityProvider } from './components/ui';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
import { initMonitoring } from './utils/monitoring';
import { trackCustomError } from './utils/errorTracking';
import { useAnalytics } from './hooks/useAnalytics';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Guide from './pages/Guide';
import Library from './pages/Library';
import ProfileSetupPage from './pages/ProfileSetupPage';
import Help from './pages/Help';
import JourneyHub from './pages/JourneyHub';
import { CourseDetail, LessonDetail } from './features/courses';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import SubscriptionPage from './pages/SubscriptionPage';
import MilestonesPage from './pages/MilestonesPage';
import StripeTestPage from './pages/StripeTestPage';
import UserTypeTestPage from './pages/UserTypeTestPage';
import ReflectionsPage from './pages/ReflectionsPage';
import { 
  BankingCredit, 
  BudgetingSaving, 
  TaxSelfEmployment, 
  HousingUtilities, 
  InsuranceProtection, 
  EducationRetirement, 
  InitialOnboardingChecklist,
  InitialDocumentSetup,
  SafetyEmergency
} from './features/onboarding-steps';
import ConsultationCommunity from './pages/ConsultationCommunity';
import MiniAngel from './components/MiniAngel';
import { initAnalytics } from './utils/analytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, profileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but profile is not complete, redirect to profile setup
  // unless they're already on the profile setup page
  if (!profileComplete && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        setIsAdmin(data?.role === 'admin');
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!loading) {
      checkAdminStatus();
    }
  }, [user, loading]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  
  // Initialize monitoring
  useEffect(() => {
    initMonitoring();
  }, []);
  
  // Don't show MiniAngel on these pages
  const hideFloatingChatOn = [
    '/auth',
    '/profile-setup',
    '/chat',
    '/admin',
    '/stripe-test'
  ];
  
  // Check if we're on a page where we should hide the floating chat
  const shouldHideFloatingChat = 
    !user || 
    hideFloatingChatOn.some(path => location.pathname.startsWith(path)) ||
    window.innerWidth < 768; // Hide on mobile screens (where bottom nav is visible)

  // Initialize analytics
  useEffect(() => {
    if (user) {
      initAnalytics();
    }
  }, [user]);

  // Track route changes
  useEffect(() => {
    if (user) {
      trackEvent('page_view', {
        page_path: location.pathname,
        page_title: document.title
      });
    }
  }, [location.pathname, user]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      trackCustomError('Unhandled promise rejection', {
        reason: event.reason?.message || 'Unknown error',
        stack: event.reason?.stack,
        pathname: location.pathname
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, [location.pathname]);

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        
        {/* Profile setup route */}
        <Route path="/profile-setup" element={
          user ? <ProfileSetupPage /> : <Navigate to="/auth" replace />
        } />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        } />
        
        {/* Dedicated chat page */}
        <Route path="/chat" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ChatPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        {/* Subscription page */}
        <Route path="/subscription" element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        } />

        {/* Stripe test page */}
        <Route path="/stripe-test" element={
          <ProtectedRoute>
            <StripeTestPage />
          </ProtectedRoute>
        } />
        
        {/* User Type Testing page - Development only */}
        {process.env.NODE_ENV === 'development' && (
          <Route path="/user-type-test" element={
            <ProtectedRoute>
              <DashboardLayout>
                <UserTypeTestPage />
              </DashboardLayout>
            </ProtectedRoute>
          } />
        )}
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/journey" element={
          <ProtectedRoute>
            <DashboardLayout>
              <JourneyHub />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/courses/:slug" element={
          <ProtectedRoute>
            <DashboardLayout>
              <CourseDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/courses/:pathSlug/lessons/:lessonSlug" element={
          <ProtectedRoute>
            <DashboardLayout>
              <LessonDetail />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/guide" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Guide />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/library" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Library />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/help" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Help />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/milestones" element={
          <ProtectedRoute>
            <DashboardLayout>
              <MilestonesPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/reflections" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ReflectionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/consultation" element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConsultationCommunity />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/welcome-setup" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InitialOnboardingChecklist />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/initial-documents" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InitialDocumentSetup />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/safety-emergency" element={
          <ProtectedRoute>
            <DashboardLayout>
              <SafetyEmergency />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/banking-credit" element={
          <ProtectedRoute>
            <DashboardLayout>
              <BankingCredit />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/budgeting-saving" element={
          <ProtectedRoute>
            <DashboardLayout>
              <BudgetingSaving />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/tax-employment" element={
          <ProtectedRoute>
            <DashboardLayout>
              <TaxSelfEmployment />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/housing-utilities" element={
          <ProtectedRoute>
            <DashboardLayout>
              <HousingUtilities />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/insurance-protection" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InsuranceProtection />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/steps/education-retirement" element={
          <ProtectedRoute>
            <DashboardLayout>
              <EducationRetirement />
            </DashboardLayout>
          </ProtectedRoute>
        } />
      </Routes>
      {!shouldHideFloatingChat && <MiniAngel />}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <BrowserRouter>
          <SkipLink />
          <AuthProvider>
            <LanguageProvider>
              <StepProvider>
                <ToastProvider>
                  <AppContent />
                </ToastProvider>
              </StepProvider>
            </LanguageProvider>
          </AuthProvider>
        </BrowserRouter>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;