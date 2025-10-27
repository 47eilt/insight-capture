'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { MESSAGES } from '@/lib/constants';

export default function TeamPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadTeamMembers = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get all user roles with user emails
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (rolesError) {
        console.error('Error loading roles:', rolesError);
        return;
      }

      // Get all users from auth.users
      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();

      if (usersError) {
        // Fallback: If admin.listUsers doesn't work, show role data only
        console.log('Cannot access admin API, showing role data only');
        const members = rolesData.map(role => ({
          id: role.user_id,
          email: role.user_id === user.id ? user.email : 'User',
          role: role.role,
          created_at: role.created_at
        }));
        setTeamMembers(members);
      } else {
        // Merge users with their roles
        const members = rolesData.map(role => {
          const authUser = usersData.users.find(u => u.id === role.user_id);
          return {
            id: role.user_id,
            email: authUser?.email || role.user_id === user.id ? user.email : 'Unknown',
            role: role.role,
            created_at: role.created_at
          };
        });
        setTeamMembers(members);
      }

      // Get current user's role
      const currentRole = rolesData.find(r => r.user_id === user.id);
      setCurrentUserRole(currentRole?.role || 'contributor');

    } catch (error) {
      console.error('Error loading team members:', error);
      setMessage({ text: 'Failed to load team members', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  const handleRoleChange = useCallback(async (userId, newRole) => {
    if (currentUserRole !== 'admin') {
      setMessage({ text: 'Only admins can change roles', type: 'error' });
      return;
    }

    if (userId === user.id) {
      setMessage({ text: 'You cannot change your own role', type: 'error' });
      return;
    }

    try {
      setUpdatingRole(userId);
      setMessage({ text: '', type: '' });

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      setMessage({ text: `Role updated to ${newRole}`, type: 'success' });
      await loadTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ text: 'Failed to update role', type: 'error' });
    } finally {
      setUpdatingRole(null);
    }
  }, [currentUserRole, user, loadTeamMembers]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{MESSAGES.INFO.LOADING}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage team members and their roles</p>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-6xl">
        {/* Info Banner */}
        {currentUserRole !== 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-700">You are viewing team members as a contributor. Only admins can change roles.</p>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Team Members Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Team Members ({teamMembers.length})</h2>
            </div>
          </div>

          {teamMembers.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
              <p className="text-gray-500 text-sm">Team members will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    {currentUserRole === 'admin' && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            member.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
                          }`}>
                            {member.email[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{member.email}</p>
                            {member.id === user.id && (
                              <p className="text-xs text-gray-500">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          member.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {member.role === 'admin' ? '👑 Admin' : 'Contributor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(member.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </td>
                      {currentUserRole === 'admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {member.id === user.id ? (
                            <span className="text-gray-400 italic">Your account</span>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(
                                member.id,
                                member.role === 'admin' ? 'contributor' : 'admin'
                              )}
                              disabled={updatingRole === member.id}
                              className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                member.role === 'admin'
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-purple-600 hover:bg-purple-50'
                              }`}
                            >
                              {updatingRole === member.id ? (
                                'Updating...'
                              ) : member.role === 'admin' ? (
                                '↓ Downgrade to Contributor'
                              ) : (
                                '↑ Upgrade to Admin'
                              )}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Role Permissions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="font-medium text-purple-600">Admin:</span>
              <span>Can manage team members, change roles, and access all features</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-blue-600">Contributor:</span>
              <span>Can create insights and view team members</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
