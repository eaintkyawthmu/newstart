import React from 'react';
import { Search, Filter, Download, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  userFilter: string;
  setUserFilter: (filter: string) => void;
  exportUserData: () => void;
  refreshing: boolean;
  fetchUsers: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  userFilter,
  setUserFilter,
  exportUserData,
  refreshing,
  fetchUsers
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <div className="relative">
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="premium">Premium Users</option>
            <option value="free">Free Users</option>
            <option value="staff">All Staff</option>
            <option value="admin">Admins</option>
            <option value="moderator">Moderators</option>
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        </div>
        
        <button
          onClick={exportUserData}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Download className="h-5 w-5 mr-1" />
          <span className="hidden sm:inline">Export</span>
        </button>
        
        <button
          onClick={fetchUsers}
          disabled={refreshing}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline ml-1">Refresh</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/users/new')}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>
    </div>
  );
};

export default UserFilters;