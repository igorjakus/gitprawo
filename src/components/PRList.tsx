'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PullRequest } from '@/types';

interface PRListProps {
  actId?: number;
  status?: string;
  showPrivate?: boolean;
  token?: string;
}

export default function PRList({
  actId,
  status,
  showPrivate = false,
  token: serverToken,
}: PRListProps) {
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(serverToken);

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
    const fetchPRs = async () => {
      try {
        const params = new URLSearchParams();
        if (actId) params.append('actId', actId.toString());
        if (status) params.append('status', status);
        if (showPrivate && token) params.append('visibility', 'private');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `/api/pull-requests?${params.toString()}`,
          { headers }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch pull requests (${response.status})`);
        }

        const data = await response.json();
        setPrs(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('PRList error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPRs();
  }, [actId, status, showPrivate, token]);

  if (loading) {
    return <div className="text-gray-500">Ładowanie pull requestów...</div>;
  }

  if (error) {
    return <div className="text-red-500">Błąd: {error}</div>;
  }

  if (prs.length === 0) {
    return <div className="text-gray-500">Brak pull requestów</div>;
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
    <div className="space-y-4">
      {prs.map((pr) => (
        <div
          key={pr.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-2">
            <Link
              href={`/pull-requests/${pr.id}`}
              className="text-lg font-semibold text-blue-600 hover:text-blue-800"
            >
              {pr.title}
            </Link>
            <div className="flex gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  pr.status
                )}`}
              >
                {getStatusLabel(pr.status)}
              </span>
              {!pr.isPublic && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Prywatny
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-3">
            {pr.description || 'Brak opisu'}
          </p>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Autor: <span className="font-medium">{pr.authorFirstName} {pr.authorLastName}</span>
            </span>
            <span>
              {pr.actTitle && (
                <span>
                  Ustawa: <span className="font-medium">{pr.actTitle}</span>
                </span>
              )}
            </span>
          </div>

          <div className="text-xs text-gray-400 mt-2">
            {new Date(pr.createdAt).toLocaleDateString('pl-PL')}
          </div>
        </div>
      ))}
    </div>
  );
}
