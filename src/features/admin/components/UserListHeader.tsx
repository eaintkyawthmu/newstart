import React from 'react';

const UserListHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">View and manage all users in the system</p>
        </div>
      </div>
    </div>
  );
};

export default UserListHeader;