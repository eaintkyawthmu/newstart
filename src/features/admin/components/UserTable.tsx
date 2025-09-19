import React, { useState } from 'react';
import { UserProfile } from '../UserList';
import { 
  User, 
  Crown, 
  Shield, 
  UserCheck, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { NavigateFunction } from 'react-router-dom';

interface UserTableProps {
  users: UserProfile[];
  updateUserRole: (userId: string, newRole: string) => void;
  formatDate: (dateString: string | null) => string;
  navigate: NavigateFunction;
}

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  updateUserRole, 
  formatDate,
  navigate
}) => {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const toggleExpandUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-600" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-blue-600" />;
      case 'premium':
        return <Crown className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'moderator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role & Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <React.Fragment key={user.id}>
                <tr className={`hover:bg-gray-50 ${expandedUser === user.id ? 'bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleExpandUser(user.id)}
                        className="mr-2 text-gray-400 hover:text-gray-600"
                      >
                        {expandedUser === user.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                          <span className="ml-2 text-xs text-gray-500">
                            ({user.user_type === 'immigrant' ? 'Immigrant' : 'Non-Immigrant'})
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </span>
                    </div>
                    {user.subscription_status === 'active' && (
                      <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {user.premium_tier || 'Premium'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.country_of_origin || 'N/A'}</div>
                    {user.zip_code && (
                      <div className="text-xs text-gray-500">ZIP: {user.zip_code}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(user.created_at)}</div>
                    <div className="text-xs text-gray-500">
                      Last active: {formatDate(user.last_active_at)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={user.role || 'free'}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="free">Free</option>
                        <option value="premium">Premium</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View user details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded User Details */}
                {expandedUser === user.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Contact Information</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{user.email}</span>
                            </div>
                            {user.phone_number && (
                              <div className="flex items-center text-sm">
                                <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-700">{user.phone_number}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Demographics</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{user.country_of_origin || 'N/A'}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">{user.marital_status || 'N/A'}, {user.dependents || 0} dependents</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-500 mb-1">Account</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">Joined: {formatDate(user.created_at)}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-gray-700">Last active: {formatDate(user.last_active_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          View Full Profile
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      {users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No users found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default UserTable;