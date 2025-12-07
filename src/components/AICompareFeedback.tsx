"use client";

import React, { useState } from "react";
import AIFeedback from "./AIFeedback";

interface AICompareFeedbackProps {
  fromContent: string;
  toContent: string;
}

export default function AICompareFeedback({ fromContent, toContent }: AICompareFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string } | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch('/api/acts/compare-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: fromContent, to: toContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const aiSummary = await response.json();
      setFeedback({ message: aiSummary.message });
    } catch {
      setError("Nie udało się wygenerować podsumowania AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AIFeedback
      feedback={feedback}
      loading={loading}
      error={error}
      onGenerate={handleGenerate}
      onRegenerate={handleGenerate}
      title="Podsumowanie AI"
      description="Automatyczne podsumowanie zmian między wersjami"
      emptyTitle="Brak jeszcze podsumowania AI"
      emptyDescription="Wygeneruj automatyczne podsumowanie zmian i ich wpływu prostym językiem."
      buttonLabel="Wygeneruj podsumowanie"
      showApprovalBadge={false}
    />
  );
}
