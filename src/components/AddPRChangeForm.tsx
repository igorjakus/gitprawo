'use client';

import React, { useState } from 'react';

interface AddPRChangeFormProps {
  prId: number;
  token?: string;
  onSuccess?: () => void;
}

export default function AddPRChangeForm({
  prId,
  token: serverToken,
  onSuccess,
}: AddPRChangeFormProps) {
  const [oldContent, setOldContent] = useState('');
  const [newContent, setNewContent] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(serverToken);

  // Get token from localStorage if not provided from server
  React.useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!token) {
        throw new Error('Musisz być zalogowany');
      }

      if (!newContent.trim()) {
        throw new Error('Nowa treść jest wymagana');
      }

      const response = await fetch(
        `/api/pull-requests/${prId}/changes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldContentMd: oldContent || null,
            newContentMd: newContent,
            changeSummary: summary || null,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie udało się dodać zmiany');
      }

      setOldContent('');
      setNewContent('');
      setSummary('');

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Dodaj zmianę</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      {!token && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          Musisz być zalogowany jako ekspert aby dodać zmianę
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stara treść (opcjonalnie)
        </label>
        <textarea
          value={oldContent}
          onChange={(e) => setOldContent(e.target.value)}
          disabled={!token}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Jeśli modyfikujesz istniejący tekst, wklej tutaj jego staną wersję"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nowa treść *
        </label>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          disabled={!token}
          required
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Wprowadź nową treść lub zmienioną wersję tekstu"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Streszczenie zmiany
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          disabled={!token}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          placeholder="Krótko opisz jakie zmiany wprowadzasz"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !token || !newContent.trim()}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Dodawanie...' : 'Dodaj zmianę'}
      </button>
    </form>
  );
}
