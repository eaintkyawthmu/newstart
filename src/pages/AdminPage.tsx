import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../components/AdminDashboard';
import { UserDetail } from '../features/admin';

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/users/:userId" element={<UserDetail />} />
    </Routes>
  );
};

export default AdminPage;