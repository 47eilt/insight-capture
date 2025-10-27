'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/utils';
import { MESSAGES } from '@/lib/constants';

export default function TeamPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadInvites = useCallback(async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('invited_by', userId)
        .order('created_at', { ascending: false });

      if (!error) {
        setInvites(data || []);
      }
    } catch (error) {
      console.log('Invites table might not exist yet');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadInvites(user.id);
    }
  }, [user, loadInvites]);

  const handleInvite = useCallback(async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setMessage({ text: MESSAGES.ERROR.INVALID_EMAIL, type: 'error' });
      return;
    }

    setSending(true);
    setMessage({ text: '', type: '' });

    try {
      // Try to use Supabase's invite user function
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${window.location.origin}/login`
      });

      if (error) {
        // If admin function doesn't work, save to database
        const { error: insertError } = await supabase
          .from('invites')
          .insert({
            email: email,
            invited_by: user.id,
            status: 'pending'
          });

        if (insertError) throw insertError;

        setMessage({
          text: MESSAGES.SUCCESS.INVITE_SAVED,
          type: 'success'
        });
      } else {
        setMessage({
          text: MESSAGES.SUCCESS.INVITE_SENT,
          type: 'success'
        });
      }

      setEmail('');
      await loadInvites(user.id);
    } catch (error) {
      console.error('Error sending invite:', error);
      setMessage({
        text: MESSAGES.ERROR.INVITE_FAILED,
        type: 'error'
      });
    } finally {
      setSending(false);
    }
  }, [email, user, loadInvites]);

  const handleDeleteInvite = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInvites(prevInvites => prevInvites.filter(invite => invite.id !== id));
      setMessage({ text: MESSAGES.SUCCESS.DELETED, type: 'success' });
    } catch (error) {
      console.error('Error deleting invite:', error);
      setMessage({ text: MESSAGES.ERROR.DELETE_FAILED, type: 'error' });
    }
  }, []);

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
              <p className="text-gray-600 mt-1">Invite team members to collaborate</p>
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
      <main className="px-8 py-8 max-w-4xl">
        {/* Invite Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Invite New Member</h2>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex gap-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>

            {message.text && (
              <div className={`p-4 rounded-lg ${
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
          </form>
        </div>

        {/* Current Team */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Current Team Members</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Pending Invites</h2>
            </div>

            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                      {invite.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invite.email}</p>
                      <p className="text-xs text-gray-500">Invited {new Date(invite.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Pending
                    </span>
                    <button
                      onClick={() => handleDeleteInvite(invite.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
