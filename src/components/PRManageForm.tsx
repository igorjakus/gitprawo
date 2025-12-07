'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PRManageFormProps {
  pr: {
    id: number;
    title: string;
    status: string;
    isPublic: boolean;
    actTitle: string;
    authorName: string;
  };
}

export default function PRManageForm({ pr }: PRManageFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    status: pr.status,
    isPublic: pr.isPublic,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/pull-requests/${pr.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Błąd podczas aktualizacji propozycji');
      }

      router.push('/admin/pull-requests');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Tytuł:</span> {pr.title}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Akt prawny:</span> {pr.actTitle}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Autor:</span> {pr.authorName}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status propozycji
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="draft">Szkic</option>
          <option value="open">Otwarta</option>
          <option value="merged">Złączona</option>
          <option value="closed">Zamknięta</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          <strong>Szkic:</strong> propozycja w trakcie przygotowania<br />
          <strong>Otwarta:</strong> propozycja gotowa do dyskusji<br />
          <strong>Złączona:</strong> propozycja zaakceptowana i włączona do aktu<br />
          <strong>Zamknięta:</strong> propozycja odrzucona lub anulowana
        </p>
      </div>

      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Propozycja publiczna (widoczna dla wszystkich)
          </span>
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Anuluj
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
        </button>
      </div>
    </form>
  );
}
