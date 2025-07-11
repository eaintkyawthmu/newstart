import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { StepProvider } from './contexts/StepContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabaseClient';
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
import SampleLessonPage from './pages/SampleLessonPage';

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

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        
        {/* Sample lesson page for demonstration */}
        <Route path="/sample-lesson" element={<SampleLessonPage />} />
        
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
    <BrowserRouter>
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
  );
}

export default App;