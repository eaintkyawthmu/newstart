import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import {
  User,
  ArrowLeft,
  Shield,
  CreditCard,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Users,
  Clock,
  Edit,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Crown,
  FileText,
  Heart,
  Target,
  Globe,
  DollarSign,
  UserCheck,
  Plus
} from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  subscription_status: string;
  premium_tier: string;
  premium_access_until: string | null;
  total_spending: number;
  created_at: string;
  last_active_at: string;
  country_of_origin: string;
  employment_status: string;
  marital_status: string;
  dependents: number;
  phone_number: string;
  zip_code: string;
  street_address: string;
  immigration_year: number;
  has_ssn: boolean;
  has_phone: boolean;
  has_housing: boolean;
  concerns: string;
  life_goals: string[];
  completed_welcome_steps: number[];
  checklist_items: string[];
  onboarding_tasks: string[];
};

const UserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin && userId) {
      if (userId === 'new') {
        setIsNewUser(true);
        setIsEditing(true);
        setProfile(null);
        setEditedProfile({
          email: '',
          first_name: '',
          last_name: '',
          role: 'free',
          subscription_status: 'inactive',
          premium_tier: '',
          premium_access_until: null,
          total_spending: 0,
          country_of_origin: '',
          employment_status: 'not_working',
          marital_status: 'Single',
          dependents: 0,
          phone_number: '',
          zip_code: '',
          street_address: '',
          immigration_year: new Date().getFullYear(),
          has_ssn: false,
          has_phone: false,
          has_housing: false,
          concerns: '',
          life_goals: [],
          completed_welcome_steps: [],
          checklist_items: [],
          onboarding_tasks: []
        });
        setLoading(false);
      } else {
        fetchUserProfile();
        fetchUserActivity();
      }
    }
  }, [isAdmin, userId]);

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

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      setProfile(data);
      setEditedProfile(data || {});
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async () => {
    setLoadingActivity(true);
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setActivityData(data || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEditedProfile(prev => ({
        ...prev,
        [name]: checked
      }));
      return;
    }
    
    // Handle number inputs
    if (type === 'number') {
      setEditedProfile(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
      return;
    }
    
    // Handle all other inputs
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async () => {
    try {
      if (isNewUser) {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: editedProfile.email!,
          password: 'TempPassword123!', // Temporary password - user should reset
          email_confirm: true
        });

        if (authError) throw authError;

        // Create profile with the new user ID
        const profileData = {
          ...editedProfile,
          id: authData.user.id,
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData]);

        if (profileError) throw profileError;

        // Navigate to the new user's detail page
        navigate(`/admin/users/${authData.user.id}`);
        setSaveSuccess(true);
        setSaveError(null);
      } else {
        // Update existing user
        const { error } = await supabase
          .from('profiles')
          .update(editedProfile)
          .eq('id', userId);

        if (error) throw error;
        
        setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
        setIsEditing(false);
        setSaveSuccess(true);
        setSaveError(null);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(isNewUser ? 'Failed to create user. Please try again.' : 'Failed to save changes. Please try again.');
      setSaveSuccess(false);
    }
  };

  const deleteUser = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // First delete related records
      await supabase
        .from('analytics_events')
        .delete()
        .eq('user_id', userId);
        
      await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', userId);
        
      await supabase
        .from('journey_progress')
        .delete()
        .eq('user_id', userId);
        
      await supabase
        .from('course_progress')
        .delete()
        .eq('user_id', userId);
      
      // Then delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
      
      // Finally, delete the auth user (requires admin privileges)
      // Note: This would typically be done through a secure server-side function
      alert('User data deleted. Note: The actual auth user record would need to be deleted through Supabase dashboard.');
      
      navigate('/admin');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount || 0);
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

  if (!isNewUser && !profile) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">User Not Found</h2>
        <p className="text-gray-600">The requested user profile could not be found.</p>
        <button
          onClick={() => navigate('/admin')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Admin Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin')}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNewUser ? 'Create New User' : 'User Profile'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  if (isNewUser) {
                    navigate('/admin');
                  } else {
                    setIsEditing(false);
                    setEditedProfile(profile);
                  }
                }}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isNewUser ? <Plus className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {isNewUser ? 'Create User' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
          <p className="text-sm text-green-600">
            {isNewUser ? 'User created successfully!' : 'Profile updated successfully!'}
          </p>
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-16 w-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {isNewUser ? 'New User' : `${profile?.first_name || ''} ${profile?.last_name || ''}`}
                  </h2>
                  <p className="text-gray-500">{isNewUser ? editedProfile.email : profile?.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Role</span>
                </div>
                {isEditing ? (
                  <select
                    name="role"
                    value={editedProfile.role || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-1 text-sm"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(profile?.role || 'free')}`}>
                    {profile?.role === 'admin' && <Shield className="h-4 w-4 mr-1 text-red-600" />}
                    {profile?.role === 'moderator' && <UserCheck className="h-4 w-4 mr-1 text-blue-600" />}
                    {profile?.role === 'premium' && <Crown className="h-4 w-4 mr-1 text-purple-600" />}
                    <span className="capitalize">{profile?.role || 'free'}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Subscription</span>
                </div>
                {isEditing ? (
                  <select
                    name="subscription_status"
                    value={editedProfile.subscription_status || ''}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-1 text-sm"
                  >
                    <option value="inactive">Inactive</option>
                    <option value="active">Active</option>
                    <option value="trialing">Trialing</option>
                    <option value="canceled">Canceled</option>
                    <option value="past_due">Past Due</option>
                  </select>
                ) : (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (profile?.subscription_status || editedProfile.subscription_status) === 'active'
                      ? 'bg-green-100 text-green-800'
                      : (profile?.subscription_status || editedProfile.subscription_status) === 'past_due'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.subscription_status || editedProfile.subscription_status || 'inactive'}
                  </span>
                )}
              </div>

              {((profile?.subscription_status || editedProfile.subscription_status) === 'active') && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Crown className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">Premium Tier</span>
                  </div>
                  {isEditing ? (
                    <select
                      name="premium_tier"
                      value={editedProfile.premium_tier || ''}
                      onChange={handleInputChange}
                      className="border border-gray-300 rounded-md p-1 text-sm"
                    >
                      <option value="premium">Premium</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  ) : (
                    <span className="text-sm font-medium text-purple-600">
                      {profile?.premium_tier || editedProfile.premium_tier || 'Standard'}
                    </span>
                  )}
                </div>
              )}

              {!isNewUser && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">Joined</span>
                    </div>
                    <span className="text-sm text-gray-700">{formatDate(profile?.created_at || null)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-gray-600">Last Active</span>
                    </div>
                    <span className="text-sm text-gray-700">{formatDate(profile?.last_active_at || null)}</span>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Total Spending</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    name="total_spending"
                    value={editedProfile.total_spending || 0}
                    onChange={handleInputChange}
                    className="border border-gray-300 rounded-md p-1 text-sm w-24"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(profile?.total_spending || editedProfile.total_spending || 0)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Life Goals */}
          {!isNewUser && profile?.life_goals && profile.life_goals.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                Life Goals
              </h3>
              
              <div className="space-y-2">
                {profile.life_goals.map((goal, index) => (
                  <div key={index} className="flex items-center">
                    <Heart className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Danger Zone - Only show for existing users */}
          {!isNewUser && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <button
                  onClick={deleteUser}
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User Data
                </button>
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Suspend Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Detailed Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={editedProfile.first_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profile?.first_name || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={editedProfile.last_name || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profile?.last_name || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedProfile.email || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-800">{profile?.email || 'N/A'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={editedProfile.phone_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-800">{profile?.phone_number || 'N/A'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country of Origin
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country_of_origin"
                    value={editedProfile.country_of_origin || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-800">{profile?.country_of_origin || 'N/A'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year of Immigration
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="immigration_year"
                    value={editedProfile.immigration_year || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profile?.immigration_year || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              Address Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="street_address"
                    value={editedProfile.street_address || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-1" />
                    <p className="text-gray-800">{profile?.street_address || 'N/A'}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="zip_code"
                    value={editedProfile.zip_code || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-800">{profile?.zip_code || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Family & Employment */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Family & Employment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marital Status
                </label>
                {isEditing ? (
                  <select
                    name="marital_status"
                    value={editedProfile.marital_status || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                ) : (
                  <p className="text-gray-800">{profile?.marital_status || 'N/A'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dependents
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    name="dependents"
                    value={editedProfile.dependents || 0}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-800">{profile?.dependents || 0}</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                {isEditing ? (
                  <select
                    name="employment_status"
                    value={editedProfile.employment_status || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="not_working">Not working yet</option>
                    <option value="looking">Looking for a job</option>
                    <option value="student">Student</option>
                    <option value="w2">W-2 Employee</option>
                    <option value="1099">1099/Gig/Business Owner</option>
                  </select>
                ) : (
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-800">{profile?.employment_status || 'N/A'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              Document Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="has_ssn"
                    checked={editedProfile.has_ssn || false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      has_ssn: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded-full mr-3 ${(profile?.has_ssn || editedProfile.has_ssn) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
                <span className="text-gray-700">Has SSN/ITIN</span>
              </div>
              
              <div className="flex items-center">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="has_phone"
                    checked={editedProfile.has_phone || false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      has_phone: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded-full mr-3 ${(profile?.has_phone || editedProfile.has_phone) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
                <span className="text-gray-700">Has U.S. Phone Number</span>
              </div>
              
              <div className="flex items-center">
                {isEditing ? (
                  <input
                    type="checkbox"
                    name="has_housing"
                    checked={editedProfile.has_housing || false}
                    onChange={(e) => setEditedProfile(prev => ({
                      ...prev,
                      has_housing: e.target.checked
                    }))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-3"
                  />
                ) : (
                  <div className={`w-4 h-4 rounded-full mr-3 ${(profile?.has_housing || editedProfile.has_housing) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                )}
                <span className="text-gray-700">Has Housing (Rented/Owned)</span>
              </div>
            </div>
          </div>

          {/* Progress Tracking - Only show for existing users */}
          {!isNewUser && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="h-5 w-5 text-blue-600 mr-2" />
                Progress Tracking
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Welcome Steps Completed</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.completed_welcome_steps && profile.completed_welcome_steps.length > 0 ? (
                      profile.completed_welcome_steps.map((step, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Step {step}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No steps completed yet</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Checklist Items</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.checklist_items && profile.checklist_items.length > 0 ? (
                      profile.checklist_items.map((item, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No checklist items completed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Activity - Only show for existing users */}
          {!isNewUser && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                Recent Activity
              </h3>
              
              {loadingActivity ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : activityData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activityData.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {event.event_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(event.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {event.properties && Object.keys(event.properties).length > 0 ? (
                              <details className="cursor-pointer">
                                <summary className="text-blue-600 hover:text-blue-800">View Details</summary>
                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                  <pre className="whitespace-pre-wrap">
                                    {JSON.stringify(event.properties, null, 2)}
                                  </pre>
                                </div>
                              </details>
                            ) : (
                              <span className="text-gray-400">No details available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No activity data available for this user.</p>
                </div>
              )}
            </div>
          )}

          {/* User Concerns */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 text-blue-600 mr-2" />
              User Concerns
            </h3>
            
            {isEditing ? (
              <textarea
                name="concerns"
                value={editedProfile.concerns || ''}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any concerns or notes about this user..."
              />
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {profile?.concerns || editedProfile.concerns || 'No concerns noted.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;