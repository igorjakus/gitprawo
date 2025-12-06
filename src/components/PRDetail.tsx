'use client';

import React, { useEffect, useState } from 'react';
import { PullRequest, PRChange, PRComment } from '@/types';
import EditPRModal from './EditPR';
import AddPRChangeForm from './AddPRChangeForm';

interface PRDetailProps {
  prId: number;
  token?: string;
  currentUserId?: number;
}

export default function PRDetail({ prId, token: serverToken, currentUserId }: PRDetailProps) {
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [changes, setChanges] = useState<PRChange[]>([]);
  const [comments, setComments] = useState<PRComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitingComment, setSubmitingComment] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [token, setToken] = useState<string | undefined>(serverToken);

  // Get token from localStorage if not provided from server
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('PRDetail: Token loaded from localStorage');
        setToken(storedToken);
      } else {
        console.log('PRDetail: No token found in localStorage');
      }
    } else if (token) {
      console.log('PRDetail: Token provided from server');
    }
  }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          console.log('PRDetail: Using token for API request');
        } else {
          console.log('PRDetail: No token available for API request');
        }

        const [prRes, changesRes, commentsRes] = await Promise.all([
          fetch(`/api/pull-requests/${prId}`, { headers }),
          fetch(`/api/pull-requests/${prId}/changes`, { headers }),
          fetch(`/api/pull-requests/${prId}/comments`, { headers }),
        ]);

        if (!prRes.ok) {
          throw new Error('Nie udało się pobrać pull requesta');
        }

        const prData = await prRes.json();
        setPr(prData);

        if (changesRes.ok) {
          const changesData = await changesRes.json();
          setChanges(changesData);
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prId, token]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    console.log('handleAddComment: token =', token ? 'present' : 'missing');
    console.log('handleAddComment: newComment =', newComment);

    if (!token) {
      setCommentError('Musisz być zalogowany aby dodać komentarz');
      console.error('handleAddComment: No token available');
      return;
    }

    if (!newComment.trim()) {
      setCommentError('Komentarz nie może być pusty');
      return;
    }

    setSubmitingComment(true);

    try {
      console.log('handleAddComment: Sending request to /api/pull-requests/' + prId + '/comments');
      const response = await fetch(
        `/api/pull-requests/${prId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      console.log('handleAddComment: Response status =', response.status);

      if (!response.ok) {
        const data = await response.json();
        console.error('handleAddComment: Error response =', data);
        throw new Error(data.error || 'Nie udało się dodać komentarza');
      }

      const comment = await response.json();
      console.log('handleAddComment: Comment added successfully', comment);
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('handleAddComment: Exception =', err);
      setCommentError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setSubmitingComment(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Ładowanie...</div>;
  }

  if (error) {
    return <div className="text-red-500">Błąd: {error}</div>;
  }

  if (!pr) {
    return <div className="text-gray-500">Pull request nie znaleziony</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'merged':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Otwarty';
      case 'merged':
        return 'Scalony';
      case 'closed':
        return 'Zamknięty';
      case 'draft':
        return 'Wersja robocza';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <EditPRModal
        pr={pr}
        token={token}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={setPr}
      />

      {/* Header */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold">{pr.title}</h1>
          <div className="flex gap-2">
            <span
              className={`px-4 py-2 rounded-full font-medium ${getStatusColor(
                pr.status
              )}`}
            >
              {getStatusLabel(pr.status)}
            </span>
            {token && pr.authorId === currentUserId && (
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300"
              >
                Edytuj
              </button>
            )}
          </div>
        </div>

        {pr.description && (
          <p className="text-gray-700 mb-4">{pr.description}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
          <div>
            <span className="font-medium">{pr.authorLogin}</span> otworzył(a) to
            pull request
          </div>
          <div>
            {new Date(pr.createdAt).toLocaleDateString('pl-PL')}{' '}
            {new Date(pr.createdAt).toLocaleTimeString('pl-PL')}
          </div>
        </div>

        {!pr.isPublic && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
            🔒 Ten pull request jest prywatny i widoczny tylko dla zalogowanych
            użytkowników
          </div>
        )}
      </div>

      {/* Changes */}
      {changes.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Zmiany ({changes.length})</h2>
          <div className="space-y-4">
            {changes.map((change) => (
              <div
                key={change.id}
                className="border border-gray-200 rounded p-4"
              >
                {change.changeSummary && (
                  <p className="text-sm text-gray-700 mb-2">
                    {change.changeSummary}
                  </p>
                )}

                {change.oldContentMd && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Stara wersja:
                    </p>
                    <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto text-red-800">
                      {change.oldContentMd}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Nowa wersja:
                  </p>
                  <pre className="bg-green-50 p-2 rounded text-xs overflow-x-auto text-green-800">
                    {change.newContentMd}
                  </pre>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {new Date(change.createdAt).toLocaleDateString('pl-PL')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {token && (
        <AddPRChangeForm
          prId={prId}
          token={token}
          onSuccess={() => {
            const fetchChanges = async () => {
              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
              };
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }
              const res = await fetch(
                `/api/pull-requests/${prId}/changes`,
                { headers }
              );
              if (res.ok) {
                setChanges(await res.json());
              }
            };
            fetchChanges();
          }}
        />
      )}

      {/* Comments */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Komentarze ({comments.length})</h2>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6 p-4 bg-gray-50 rounded">
          {commentError && (
            <div className="mb-3 p-2 bg-red-100 text-red-800 rounded text-sm">
              {commentError}
            </div>
          )}

          {/* Debug info */}
          <div className="mb-3 p-2 bg-blue-50 text-blue-800 rounded text-xs">
            Debug: Token = {token ? '✓ Present' : '✗ Missing'} | 
            localStorage.token = {typeof window !== 'undefined' && localStorage.getItem('token') ? '✓ Present' : '✗ Missing'}
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              token
                ? 'Dodaj komentarz...'
                : 'Zaloguj się aby dodać komentarz'
            }
            disabled={!token}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-500"
          />

          <button
            type="submit"
            disabled={submitingComment || !token || !newComment.trim()}
            className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {submitingComment ? 'Dodawanie...' : 'Dodaj komentarz'}
          </button>
        </form>

        {/* Comments List */}
        {comments.length === 0 ? (
          <p className="text-gray-500">Brak komentarzy</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 rounded p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">
                    {comment.authorLogin}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('pl-PL')}{' '}
                    {new Date(comment.createdAt).toLocaleTimeString('pl-PL')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
