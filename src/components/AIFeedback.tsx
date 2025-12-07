'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AIFeedbackProps {
  feedback: { message: string; createdAt?: string; approved?: boolean } | null;
  error: string | null;
  loading: boolean;
  token?: string;
  onGenerate: () => void;
  onRegenerate?: () => void;
  // Customizable labels and descriptions
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  buttonLabel?: string;
  showApprovalBadge?: boolean;
}

const AIFeedback: React.FC<AIFeedbackProps> = ({
  feedback,
  error,
  loading,
  token: propToken,
  onGenerate,
  onRegenerate,
  title = 'Wsparcie AI',
  description = 'Automatyczna analiza',
  emptyTitle = 'Brak jeszcze opinii AI',
  emptyDescription = 'Wygeneruj automatyczną opinię AI.',
  buttonLabel = 'Wygeneruj opinię',
  showApprovalBadge = false,
}) => {
  const [token, setToken] = React.useState<string | undefined>(propToken);

  React.useEffect(() => {
    if (!propToken && typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, [propToken]);

  return (
    <div
      className={`p-6 rounded-lg border shadow-sm transition-colors ${
        showApprovalBadge && feedback && !feedback.approved
          ? 'bg-rose-100 border-rose-200'
          : 'bg-sky-100 border-indigo-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold">
            ✦
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-indigo-700">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <>
              {showApprovalBadge && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    feedback.approved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-900 border border-red-300 shadow-[0_0_0_1px_rgba(248,113,113,0.35)]'
                  }`}
                >
                  {feedback.approved ? 'Zatwierdzone' : 'Wymaga poprawek'}
                </span>
              )}
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  disabled={loading || !token}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="Regeneruj opinię AI"
                >
                  Odśwież
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 text-red-800 rounded text-sm">
          {error}
        </div>
      )}

      {feedback ? (
        <>
          {loading && (
            <div className="mb-3 flex items-center gap-2 text-indigo-700">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Generuję nową opinię...</span>
            </div>
          )}
          <div className="bg-white border border-indigo-100 rounded-lg p-4 shadow-sm">
            <div className="prose prose-sm text-gray-800 max-w-none">
              <ReactMarkdown>{feedback.message}</ReactMarkdown>
            </div>
            {feedback.createdAt && (
              <div className="mt-3 text-xs text-gray-500">
                Wygenerowano: {new Date(feedback.createdAt).toLocaleString('pl-PL')}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {loading && (
            <div className="mb-3 flex items-center gap-2 text-indigo-700">
              <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
              <span className="text-sm">Generuję opinię...</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 bg-white border border-dashed border-indigo-200 rounded-lg p-4">
            <div>
              <p className="text-gray-800 font-medium">{emptyTitle}</p>
              <p className="text-sm text-gray-600">{emptyDescription}</p>
              {!token && (
                <p className="mt-2 text-xs text-red-500">
                  Musisz być zalogowany, aby wygenerować opinię.
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || !token}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Generuję...' : buttonLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIFeedback;
