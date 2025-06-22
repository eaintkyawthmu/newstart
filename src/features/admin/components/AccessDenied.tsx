import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  );
};

export default AccessDenied;