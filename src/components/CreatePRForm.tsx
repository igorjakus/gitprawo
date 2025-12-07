'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CreatePRFormProps {
  actId: number;
  token?: string;
  onSuccess?: () => void;
}

export default function CreatePRForm({
  actId,
  token: serverToken,
  onSuccess,
}: CreatePRFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!token) {
        setError('Musisz być zalogowany aby utworzyć propozycję zmian');
        return;
      }

      if (!content) {
        setError('Musisz załączyć plik z nową treścią ustawy');
        return;
      }

      const response = await fetch('/api/propozycje-zmian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actId,
          title,
          description,
          isPublic,
          content,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Nie udało się utworzyć propozycji zmian');
      }

      const pr = await response.json();
      setTitle('');
      setDescription('');
      setContent('');
      setIsPublic(true);

      if (onSuccess) {
        onSuccess();
      }

      router.push(`/propozycje-zmian/${pr.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-xl font-semibold mb-4">Utwórz nową propozycję zmian</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tytuł *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Wprowadź tytuł zmian"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Opis
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Opisz zmiany i ich uzasadnienie"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plik z nową treścią (Markdown) *
        </label>
        <input
          type="file"
          accept=".md,.txt"
          onChange={handleFileChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Wybierz plik z lokalnego dysku zawierający nową treść ustawy.
        </p>
      </div>

      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 mr-2"
          />
          <span className="text-sm text-gray-700">
            Publiczny (widoczny dla wszystkich)
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          {isPublic
            ? 'Ta propozycja zmian będzie widoczna dla wszystkich użytkowników'
            : 'Ta propozycja zmian będzie widoczna tylko dla zalogowanych użytkowników'}
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !title}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Tworzenie...' : 'Utwórz propozycję zmian'}
      </button>
    </form>
  );
}
