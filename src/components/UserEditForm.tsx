'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserEditFormProps {
  user: {
    id: number;
    login: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export default function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Błąd podczas aktualizacji użytkownika');
      }

      router.push('/admin/users');
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
          <span className="font-medium">Email:</span> {user.login}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Imię i nazwisko:</span> {user.firstName} {user.lastName}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rola użytkownika
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="default">Użytkownik (default)</option>
          <option value="expert">Ekspert</option>
          <option value="admin">Administrator</option>
        </select>
        <p className="mt-2 text-sm text-gray-500">
          <strong>Użytkownik:</strong> może przeglądać akty i tworzyć propozycje zmian<br />
          <strong>Ekspert:</strong> może dodatkowo dodawać nowe akty prawne<br />
          <strong>Administrator:</strong> pełny dostęp do panelu administracyjnego
        </p>
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
