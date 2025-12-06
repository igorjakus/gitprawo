'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AIFeedbackSectionProps {
  feedback: {
    message: string;
    createdAt?: string;
  } | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
  buttonLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  generatingLabel?: string;
  generatingNewLabel?: string;
  disableButton?: boolean;
}

export default function AIFeedbackSection({
  feedback,
  loading,
  error,
  onGenerate,
  buttonLabel = 'Wygeneruj feedback',
  emptyTitle = 'Brak jeszcze opinii AI',
  emptyDescription = 'Wygeneruj automatyczną opinię AI.',
  generatingLabel = 'Generuję opinię...',
  generatingNewLabel = 'Generuję nową opinię...',
  disableButton = false,
}: AIFeedbackSectionProps) {
  return (
    <div>
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
              <span className="text-sm">{generatingNewLabel}</span>
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
              <span className="text-sm">{generatingLabel}</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 bg-white border border-dashed border-indigo-200 rounded-lg p-4">
            <div>
              <p className="text-gray-800 font-medium">{emptyTitle}</p>
              <p className="text-sm text-gray-600">{emptyDescription}</p>
            </div>
            <button
              type="button"
              onClick={onGenerate}
              disabled={loading || disableButton}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? 'Generuję...' : buttonLabel}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
