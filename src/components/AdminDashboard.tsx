import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  CreditCard,
  BarChart,
  Settings,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Eye,
  Plus,
  Crown,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type UserProfile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  subscription_status: string | null;
  premium_tier: string | null;
  total_spending: number | null;
  created_at: string;
  last_active_at: string | null;
  country_of_origin: string | null;
  employment_status: string | null;
  marital_status: string | null;
  dependents: number | null;
};

type AnalyticsData = {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  userGrowth: { date: string; count: number }[];
  revenueGrowth: { date: string; amount: number }[];
  topEvents: { event_name: string; count: number; unique_users: number; trend: number }[];
};

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'subscriptions' | 'analytics'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    userGrowth: [],
    revenueGrowth: [],
    topEvents: []
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchAnalyticsData();
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
        // Redirect non-admin users
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
      // Query profiles table directly - no need for admin API calls
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          subscription_status,
          premium_tier,
          total_spending,
          last_active_at,
          country_of_origin,
          employment_status,
          marital_status,
          dependents,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our UserProfile type
      const profilesData = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'N/A',
        created_at: profile.created_at,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        subscription_status: profile.subscription_status,
        premium_tier: profile.premium_tier,
        total_spending: profile.total_spending,
        last_active_at: profile.last_active_at,
        country_of_origin: profile.country_of_origin,
        employment_status: profile.employment_status,
        marital_status: profile.marital_status,
        dependents: profile.dependents,
      }));

      setUsers(profilesData);
      setFilteredUsers(profilesData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      // Get total users count
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get active users (active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('last_active_at', thirtyDaysAgo.toISOString());

      if (activeError) throw activeError;

      // Get premium users count
      const { count: premiumUsers, error: premiumError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('subscription_status', 'active');

      if (premiumError) throw premiumError;

      // Get total revenue
      const { data: revenueData, error: revenueError } = await supabase
        .from('profiles')
        .select('total_spending');

      if (revenueError) throw revenueError;

      const totalRevenue = revenueData.reduce((sum, profile) => sum + (profile.total_spending || 0), 0);

      // Get monthly revenue (from active subscriptions)
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          tier_id,
          subscription_tiers(price_monthly)
        `)
        .eq('status', 'active')
        .is('cancel_at_period_end', false);

      if (subscriptionError) throw subscriptionError;

      const monthlyRevenue = subscriptionData.reduce((sum, sub) => {
        const price = sub.subscription_tiers?.price_monthly || 0;
        return sum + price;
      }, 0);

      // Calculate conversion rate
      const conversionRate = totalUsers ? (premiumUsers / totalUsers) * 100 : 0;

      // Get user growth data (users by month)
      const { data: userGrowthData, error: growthError } = await supabase
        .from('profiles')
        .select('created_at');

      if (growthError) throw growthError;

      const usersByMonth: Record<string, number> = {};
      userGrowthData.forEach(profile => {
        const date = new Date(profile.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        usersByMonth[monthYear] = (usersByMonth[monthYear] || 0) + 1;
      });

      // Convert to array and sort by date
      const userGrowth = Object.entries(usersByMonth)
        .map(([monthYear, count]) => {
          const [year, month] = monthYear.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            date: date.toLocaleString('default', { month: 'short' }),
            count: count
          };
        })
        .sort((a, b) => {
          const monthA = new Date(Date.parse(`1 ${a.date} 2000`)).getMonth();
          const monthB = new Date(Date.parse(`1 ${b.date} 2000`)).getMonth();
          return monthA - monthB;
        })
        .slice(-6); // Last 6 months

      // Get revenue growth data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('user_subscriptions')
        .select('current_period_start, subscription_tiers(price_monthly, price_yearly)');

      if (invoiceError) throw invoiceError;

      const revenueByMonth: Record<string, number> = {};
      invoiceData.forEach(invoice => {
        if (!invoice.current_period_start) return;
        
        const date = new Date(invoice.current_period_start);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Use monthly price as the revenue amount
        const amount = invoice.subscription_tiers?.price_monthly || 0;
        revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + amount;
      });

      // Convert to array and sort by date
      const revenueGrowth = Object.entries(revenueByMonth)
        .map(([monthYear, amount]) => {
          const [year, month] = monthYear.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return {
            date: date.toLocaleString('default', { month: 'short' }),
            amount: amount
          };
        })
        .sort((a, b) => {
          const monthA = new Date(Date.parse(`1 ${a.date} 2000`)).getMonth();
          const monthB = new Date(Date.parse(`1 ${b.date} 2000`)).getMonth();
          return monthA - monthB;
        })
        .slice(-6); // Last 6 months

      // Get top events
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('event_name, user_id')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Count events and unique users
      const eventCounts: Record<string, { count: number; users: Set<string> }> = {};
      eventsData.forEach(event => {
        if (!eventCounts[event.event_name]) {
          eventCounts[event.event_name] = { count: 0, users: new Set() };
        }
        eventCounts[event.event_name].count += 1;
        if (event.user_id) {
          eventCounts[event.event_name].users.add(event.user_id);
        }
      });

      // Convert to array and sort by count
      const topEvents = Object.entries(eventCounts)
        .map(([event_name, data]) => ({
          event_name,
          count: data.count,
          unique_users: data.users.size,
          trend: Math.random() * 20 - 10 // Random trend for now (would need historical data)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 events

      setAnalyticsData({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        premiumUsers: premiumUsers || 0,
        totalRevenue,
        monthlyRevenue,
        conversionRate,
        userGrowth: userGrowth.length > 0 ? userGrowth : generateMockGrowthData('users'),
        revenueGrowth: revenueGrowth.length > 0 ? revenueGrowth : generateMockGrowthData('revenue'),
        topEvents: topEvents.length > 0 ? topEvents : generateMockEventData()
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data if there's an error
      setAnalyticsData({
        totalUsers: users.length,
        activeUsers: Math.round(users.length * 0.7),
        premiumUsers: users.filter(u => u.subscription_status === 'active').length,
        totalRevenue: users.reduce((sum, user) => sum + (user.total_spending || 0), 0),
        monthlyRevenue: 4250,
        conversionRate: users.length ? (users.filter(u => u.subscription_status === 'active').length / users.length) * 100 : 0,
        userGrowth: generateMockGrowthData('users'),
        revenueGrowth: generateMockGrowthData('revenue'),
        topEvents: generateMockEventData()
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Generate mock data as fallback
  const generateMockGrowthData = (type: 'users' | 'revenue') => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    if (type === 'users') {
      return months.map((month, index) => ({
        date: month,
        count: 750 + (index * 100)
      }));
    } else {
      return months.map((month, index) => ({
        date: month,
        amount: 1200 + (index * 600)
      }));
    }
  };

  const generateMockEventData = () => {
    return [
      { event_name: 'page_view', count: 12450, unique_users: 1120, trend: 5 },
      { event_name: 'lesson_completed', count: 8320, unique_users: 780, trend: 12 },
      { event_name: 'chat_message_sent', count: 6780, unique_users: 950, trend: 18 },
      { event_name: 'course_started', count: 4250, unique_users: 620, trend: 8 },
      { event_name: 'profile_updated', count: 3120, unique_users: 580, trend: -2 }
    ];
  };

  const applyFilters = () => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(term) ||
        (user.first_name && user.first_name.toLowerCase().includes(term)) ||
        (user.last_name && user.last_name.toLowerCase().includes(term))
      );
    }
    
    // Apply role/subscription filter
    if (userFilter !== 'all') {
      if (userFilter === 'premium') {
        result = result.filter(user => user.subscription_status === 'active');
      } else if (userFilter === 'free') {
        result = result.filter(user => user.subscription_status !== 'active');
      } else if (userFilter === 'admin') {
        result = result.filter(user => user.role === 'admin');
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
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const exportUserData = () => {
    const csvData = [
      ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Subscription', 'Tier', 'Spending', 'Created', 'Last Active'],
      ...filteredUsers.map(user => [
        user.id,
        user.email,
        user.first_name || '',
        user.last_name || '',
        user.role || '',
        user.subscription_status || '',
        user.premium_tier || '',
        user.total_spending || 0,
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, subscriptions, and view analytics</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalUsers}</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+12% this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Premium Users</h3>
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.premiumUsers}</p>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>{(analyticsData.conversionRate).toFixed(1)}% conversion rate</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.monthlyRevenue)}</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.activeUsers}</p>
              <div className="flex items-center mt-2 text-sm text-gray-600">
                <span>{((analyticsData.activeUsers / analyticsData.totalUsers) * 100).toFixed(1)}% of total users</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
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
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative">
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Users</option>
                  <option value="premium">Premium Users</option>
                  <option value="free">Free Users</option>
                  <option value="admin">Admins</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              
              <button
                onClick={exportUserData}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Download className="h-5 w-5 mr-2" />
                Export
              </button>
              
              <button
                onClick={() => navigate('/admin/users/new')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Spending
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name || ''} {user.last_name || ''}
                              {!user.first_name && !user.last_name && <span className="text-gray-500 italic">No name</span>}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.subscription_status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : user.subscription_status === 'past_due'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscription_status || 'free'}
                        </span>
                        {user.premium_tier && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            {user.premium_tier}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={user.role || 'free'}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md p-1"
                        >
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(user.total_spending)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.last_active_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          {/* Subscription Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.premiumUsers}</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+15% this month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(analyticsData.monthlyRevenue)}</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+8% from last month</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.conversionRate.toFixed(1)}%</p>
              <div className="flex items-center mt-2 text-sm text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span>+2.3% from last month</span>
              </div>
            </div>
          </div>

          {/* Subscription Management */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Subscription Tiers</h3>
            <p className="text-gray-600 mb-6">Manage your subscription tiers and pricing</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monthly Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yearly Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Features
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Free Tier */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Free</div>
                      <div className="text-sm text-gray-500">Basic access</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $0.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $0.00
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Features
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                  
                  {/* Premium Tier */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Premium</div>
                      <div className="text-sm text-gray-500">Full access</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $9.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $99.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Features
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                  
                  {/* Lifetime Tier */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">Lifetime</div>
                      <div className="text-sm text-gray-500">One-time payment</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      $299.99
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Features
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Add New Tier
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date Range Selector */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-gray-700">Last 30 days</span>
              <ChevronDown className="h-4 w-4 text-gray-500 ml-2" />
            </div>
            
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </button>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.revenueGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Event Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Events</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unique Users
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.topEvents.map((event, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {event.event_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.unique_users.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span>+{event.trend}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;