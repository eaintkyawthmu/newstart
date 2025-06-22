import React, { useMemo } from 'react';
import { Users, Crown, Shield, Clock } from 'lucide-react';
import { UserProfile } from '../UserList';

interface UserStatsCardsProps {
  users: UserProfile[];
}

const UserStatsCards: React.FC<UserStatsCardsProps> = ({ users }) => {
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const premiumUsers = users.filter(u => u.subscription_status === 'active').length;
    const staffMembers = users.filter(u => u.role === 'admin' || u.role === 'moderator').length;
    
    // Calculate active today
    const today = new Date().toDateString();
    const activeToday = users.filter(u => {
      const lastActive = u.last_active_at ? new Date(u.last_active_at) : null;
      return lastActive && lastActive.toDateString() === today;
    }).length;
    
    return { totalUsers, premiumUsers, staffMembers, activeToday };
  }, [users]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
          </div>
          <Users className="h-8 w-8 text-blue-600" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Premium Users</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.premiumUsers}</p>
          </div>
          <Crown className="h-8 w-8 text-purple-600" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Staff Members</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.staffMembers}</p>
          </div>
          <Shield className="h-8 w-8 text-red-600" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Active Today</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeToday}</p>
          </div>
          <Clock className="h-8 w-8 text-green-600" />
        </div>
      </div>
    </div>
  );
};

export default UserStatsCards;