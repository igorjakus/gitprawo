'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AIReviewFeedback from './AIReviewFeedback';
import { PullRequest, PRChange, PRComment, PRAIFeedback } from '@/types';
import EditPRModal from './EditPR';
import AddPRChangeForm from './AddPRChangeForm';
import DiffViewer from './DiffViewer';
import { getDiff } from '@/lib/get_diff';

interface PRDetailProps {
  prId: number;
  token?: string;
  currentUserId?: number;
  userRole?: string;
}

export default function PRDetail({ prId, token: serverToken, currentUserId, userRole }: PRDetailProps) {
  const router = useRouter();
  const [pr, setPr] = useState<PullRequest | null>(null);
  const [changes, setChanges] = useState<PRChange[]>([]);
  const [comments, setComments] = useState<PRComment[]>([]);
  const [aiFeedback, setAiFeedback] = useState<PRAIFeedback | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [submitingComment, setSubmitingComment] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [token, setToken] = useState<string | undefined>(serverToken);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  // Get token from localStorage if not provided from server
  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
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
        }

        const [prRes, changesRes, commentsRes, aiRes] = await Promise.all([
          fetch(`/api/propozycje-zmian/${prId}`, { headers }),
          fetch(`/api/propozycje-zmian/${prId}/changes`, { headers }),
          fetch(`/api/propozycje-zmian/${prId}/comments`, { headers }),
          fetch(`/api/propozycje-zmian/${prId}/ai-feedback`, { headers }),
        ]);

        if (!prRes.ok) {
          throw new Error('Nie udało się pobrać propozycji zmian');
        }

        const prData = await prRes.json();
        setPr(prData);
        setLikesCount(prData.likesCount || 0);
        setDislikesCount(prData.dislikesCount || 0);
        setUserVote(prData.userVote || null);

        if (changesRes.ok) {
          const changesData = await changesRes.json();
          setChanges(changesData);
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiFeedback(aiData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prId, token]);

  const handleDelete = async () => {
    if (!token) return;
    
    if (!window.confirm('Czy na pewno chcesz usunąć tę propozycję zmian? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      const res = await fetch(`/api/propozycje-zmian/${prId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        router.push('/propozycje-zmian');
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Nie udało się usunąć propozycji zmian');
      }
    } catch (err) {
      console.error('Error deleting PR:', err);
      alert('Wystąpił błąd podczas usuwania');
    }
  };

  const handleVote = async (voteType: 'like' | 'dislike') => {
    if (!token) return;

    try {
      const res = await fetch(`/api/propozycje-zmian/${prId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType })
      });

      if (res.ok) {
        const data = await res.json();
        // Update state based on action
        if (data.action === 'added') {
          if (voteType === 'like') setLikesCount(prev => prev + 1);
          else setDislikesCount(prev => prev + 1);
          setUserVote(voteType);
        } else if (data.action === 'removed') {
          if (voteType === 'like') setLikesCount(prev => prev - 1);
          else setDislikesCount(prev => prev - 1);
          setUserVote(null);
        } else if (data.action === 'updated') {
          if (voteType === 'like') {
            setLikesCount(prev => prev + 1);
            setDislikesCount(prev => prev - 1);
          } else {
            setLikesCount(prev => prev - 1);
            setDislikesCount(prev => prev + 1);
          }
          setUserVote(voteType);
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!token) {
      setCommentError('Musisz być zalogowany aby dodać komentarz');
      return;
    }

    if (!newComment.trim()) {
      setCommentError('Komentarz nie może być pusty');
      return;
    }

    setSubmitingComment(true);

    try {
      const response = await fetch(
        `/api/propozycje-zmian/${prId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie udało się dodać komentarza');
      }

      const comment = await response.json();
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      setCommentError(
        err instanceof Error ? err.message : 'Unknown error'
      );
    } finally {
      setSubmitingComment(false);
    }
  };

  const handleGenerateAI = async () => {
    setAiError(null);
    setAiLoading(true);

    try {
      if (!token) {
        throw new Error('Musisz być zalogowany aby wygenerować feedback AI');
      }

      const res = await fetch(`/api/propozycje-zmian/${prId}/ai-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Nie udało się wygenerować feedbacku AI');
      }

      const aiData = await res.json();
      setAiFeedback(aiData);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleRegenerateAI = async () => {
    setAiError(null);
    setAiLoading(true);

    try {
      if (!token) {
        throw new Error('Musisz być zalogowany aby wygenerować feedback AI');
      }

      const res = await fetch(`/api/propozycje-zmian/${prId}/ai-feedback`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Nie udało się wygenerować feedbacku AI');
      }

      const aiData = await res.json();
      setAiFeedback(aiData);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Ładowanie...</div>;
  }

  if (error) {
    return <div className="text-red-500">Błąd: {error}</div>;
  }

  if (!pr) {
    return <div className="text-gray-500">Propozycja zmian nie znaleziona</div>;
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
            {token && (userRole === 'admin' || pr.authorId === currentUserId) && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium hover:bg-red-200 ml-2"
              >
                Usuń
              </button>
            )}
          </div>
        </div>

        {pr.description && (
          <p className="text-gray-700 mb-4">{pr.description}</p>
        )}

        {/* Voting */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => token && handleVote('like')}
            disabled={!token}
            className={`flex items-center gap-2 px-3 py-1 rounded border ${
              userVote === 'like'
                ? 'bg-green-100 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-600'
            } ${token ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default opacity-70'}`}
            title={!token ? 'Zaloguj się aby zagłosować' : ''}
          >
            Podoba mi się 👍 {likesCount}
          </button>
          <button
            onClick={() => token && handleVote('dislike')}
            disabled={!token}
            className={`flex items-center gap-2 px-3 py-1 rounded border ${
              userVote === 'dislike'
                ? 'bg-red-100 border-red-300 text-red-700'
                : 'bg-white border-gray-300 text-gray-600'
            } ${token ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default opacity-70'}`}
            title={!token ? 'Zaloguj się aby zagłosować' : ''}
          >
            Nie podoba mi się 👎 {dislikesCount}
          </button>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200">
          <div>
            <span className="font-medium">{pr.authorFirstName} {pr.authorLastName}</span> otworzył(a) tę
            propozycję zmian
          </div>
          <div>
            {new Date(pr.createdAt).toLocaleDateString('pl-PL')}{' '}
            {new Date(pr.createdAt).toLocaleTimeString('pl-PL')}
          </div>
        </div>

        {!pr.isPublic && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded text-sm">
            🔒 Ta propozycja zmian jest prywatna i widoczna tylko dla zalogowanych
            użytkowników
          </div>
        )}
      </div>

      {/* Changes */}
      {changes.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold mb-4">Zmiany ({changes.length})</h2>
          <div className="space-y-8">
            {changes.map((change) => (
              <div key={change.id}>
                {change.changeSummary && (
                  <p className="text-sm text-gray-700 mb-2">
                    {change.changeSummary}
                  </p>
                )}
                
                <DiffViewer
                  fromVersion="Obecna wersja"
                  toVersion="Proponowana zmiana"
                  fromDate={new Date(pr?.createdAt || Date.now()).toLocaleDateString('pl-PL')}
                  toDate={new Date(change.createdAt).toLocaleDateString('pl-PL')}
                  lines={getDiff(change.oldContentMd || '', change.newContentMd)}
                />
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
                `/api/propozycje-zmian/${prId}/changes`,
                { headers }
              );
              if (res.ok) {
                setChanges(await res.json());
              }
              // refresh AI feedback if it existed
              const ai = await fetch(`/api/propozycje-zmian/${prId}/ai-feedback`, { headers });
              if (ai.ok) {
                setAiFeedback(await ai.json());
              }
            };
            fetchChanges();
          }}
        />
      )}

      {/* AI Feedback */}
        <AIReviewFeedback
          prId={prId}
          aiFeedback={aiFeedback}
          aiError={aiError}
          aiLoading={aiLoading}
          token={token}
          onGenerate={handleGenerateAI}
          onRegenerate={handleRegenerateAI}
        />

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
                    {comment.authorFirstName} {comment.authorLastName}
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
