'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, safeGetHostname } from '@/lib/utils';
import { MESSAGES, SCREENSHOT_PREVIEW_LIMIT } from '@/lib/constants';

export default function InsightsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  const loadInsights = useCallback(async (userId) => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadInsights(user.id);
    }
  }, [user, loadInsights]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;

    try {
      setDeleteLoading(id);
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setInsights(prevInsights => prevInsights.filter(insight => insight.id !== id));
    } catch (error) {
      console.error('Error deleting insight:', error);
      alert(MESSAGES.ERROR.DELETE_FAILED);
    } finally {
      setDeleteLoading(null);
    }
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{MESSAGES.INFO.LOADING_INSIGHTS}</p>
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
              <h1 className="text-3xl font-bold text-gray-900">All Insights</h1>
              <p className="text-gray-600 mt-1">Complete overview of captured insights</p>
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
      <main className="px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {insights.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights yet</h3>
              <p className="text-gray-500 text-sm">Start capturing insights using the Chrome extension</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshots</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {insights.map((insight) => (
                    <tr key={insight.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-1">
                          {insight.screenshots && insight.screenshots.length > 0 ? (
                            insight.screenshots.slice(0, SCREENSHOT_PREVIEW_LIMIT).map((screenshot, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedImage(screenshot)}
                                className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-500 transition-all hover:shadow-md"
                              >
                                <img src={screenshot} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          {insight.screenshots && insight.screenshots.length > SCREENSHOT_PREVIEW_LIMIT && (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xs text-blue-700 font-semibold">
                              +{insight.screenshots.length - SCREENSHOT_PREVIEW_LIMIT}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md">
                          {insight.text ? <p className="line-clamp-2">{insight.text}</p> : <span className="text-gray-400 italic">No text</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {insight.page_title ? <p className="line-clamp-1 font-medium">{insight.page_title}</p> : <span className="text-gray-400 italic">No title</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {insight.url ? (
                          <a href={insight.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-700 max-w-xs block truncate font-medium">
                            {safeGetHostname(insight.url)}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No URL</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{insight.creator_email || user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(insight.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(insight.id)}
                          disabled={deleteLoading === insight.id}
                          className="text-red-600 hover:text-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === insight.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-full">
            <button onClick={() => setSelectedImage(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={selectedImage} alt="Full size screenshot" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
