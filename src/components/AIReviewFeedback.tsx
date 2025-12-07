'use client';

import React from 'react';
import AIFeedback from './AIFeedback';
import { PRAIFeedback } from '@/types';

interface AIReviewFeedbackProps {
  prId: number;
  aiFeedback: PRAIFeedback | null;
  aiError: string | null;
  aiLoading: boolean;
  token?: string;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export default function AIReviewFeedback({
  aiFeedback,
  aiError,
  aiLoading,
  token,
  onGenerate,
  onRegenerate,
}: AIReviewFeedbackProps) {
  return (
    <AIFeedback
      feedback={aiFeedback}
      loading={aiLoading}
      error={aiError}
      token={token}
      onGenerate={onGenerate}
      onRegenerate={onRegenerate}
      title="Wsparcie AI"
      description="Automatyczna ocena propozycji zmian"
      emptyTitle="Brak jeszcze opinii AI"
      emptyDescription="Wygeneruj automatyczną opinię w stylu recenzji dla tekstu prawnego."
      buttonLabel="Wygeneruj opinię"
      showApprovalBadge={true}
    />
  );
}
