'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Act } from '@/types';
import CreatePRForm from '@/components/CreatePRForm';

export default function NewPullRequestPage() {
  const [acts, setActs] = useState<Act[]>([]);
  const [selectedActId, setSelectedActId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    const userFromStorage = localStorage.getItem('user');

    if (!tokenFromStorage) {
      router.push('/login');
      return;
    }

    setToken(tokenFromStorage);

    if (userFromStorage) {
      const user = JSON.parse(userFromStorage);

      if (user.role !== 'expert' && user.role !== 'admin') {
        router.push('/pull-requests');
        return;
      }
    }

    // Fetch acts
    const fetchActs = async () => {
      try {
        const response = await fetch('/api/acts');
        if (response.ok) {
          const data = await response.json();
          setActs(data);
        }
      } catch (error) {
        console.error('Error fetching acts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActs();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-gray-500">Ładowanie...</div>
        </div>
      </main>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Nowy pull request
        </h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wybierz ustawę *
          </label>
          <select
            value={selectedActId || ''}
            onChange={(e) => setSelectedActId(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Wybierz ustawę --</option>
            {acts.map((act) => (
              <option key={act.id} value={act.id}>
                {act.title}
              </option>
            ))}
          </select>
        </div>

        {selectedActId && (
          <CreatePRForm
            actId={selectedActId}
            token={token}
            onSuccess={() => setSelectedActId(null)}
          />
        )}
      </div>
    </main>
  );
}
