import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import UserListHeader from './components/UserListHeader';
import UserStatsCards from './components/UserStatsCards';
import UserFilters from './components/UserFilters';
import UserTable from './components/UserTable';
import AccessDenied from './components/AccessDenied';
import LoadingSpinner from './components/LoadingSpinner';

export type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  subscription_status: string;
  premium_tier: string;
  total_spending: number;
  created_at: string;
  last_active_at: string;
  country_of_origin: string;
  employment_status: string;
  marital_status: string;
  dependents: number;
  phone_number?: string;
  zip_code?: string;
};

const UserList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (users.length > 0) {
      applyFilters();
    }
  }, [users, searchTerm, userFilter]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      const isUserAdmin = data?.role === 'admin';
      setIsAdmin(isUserAdmin);
      
      if (!isUserAdmin) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, email, first_name, last_name, role, subscription_status, 
          premium_tier, total_spending, created_at, last_active_at,
          country_of_origin, employment_status, marital_status, dependents,
          phone_number, zip_code
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term) ||
        user.country_of_origin?.toLowerCase().includes(term)
      );
    }
    
    // Apply role/subscription filter
    if (userFilter !== 'all') {
      if (userFilter === 'premium') {
        result = result.filter(user => user.subscription_status === 'active');
      } else if (userFilter === 'free') {
        result = result.filter(user => user.subscription_status !== 'active' && user.role === 'free');
      } else if (userFilter === 'admin') {
        result = result.filter(user => user.role === 'admin');
      } else if (userFilter === 'moderator') {
        result = result.filter(user => user.role === 'moderator');
      } else if (userFilter === 'staff') {
        result = result.filter(user => user.role === 'admin' || user.role === 'moderator');
      }
    }
    
    setFilteredUsers(result);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Show success message
      alert(`User role updated to ${newRole} successfully!`);
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const exportUserData = () => {
    const csvData = [
      ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Subscription', 'Country', 'Employment', 'Spending', 'Created', 'Last Active'],
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        user.first_name,
        user.last_name,
        user.role,
        user.subscription_status,
        user.country_of_origin,
        user.employment_status,
        user.total_spending,
        formatDate(user.created_at),
        formatDate(user.last_active_at)
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <UserListHeader />

      <UserStatsCards users={users} />

      <UserFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        exportUserData={exportUserData}
        refreshing={refreshing}
        fetchUsers={fetchUsers}
      />

      <UserTable 
        users={filteredUsers}
        updateUserRole={updateUserRole}
        formatDate={formatDate}
        navigate={navigate}
      />
    </div>
  );
};

export default UserList;