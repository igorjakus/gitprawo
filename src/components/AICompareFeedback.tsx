"use client";

import React, { useState } from "react";
import AIFeedbackSection from "./AIFeedbackSection";

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
    <AIFeedbackSection
      feedback={feedback}
      loading={loading}
      error={error}
      onGenerate={handleGenerate}
      buttonLabel="Wygeneruj podsumowanie AI"
      emptyTitle="Brak jeszcze podsumowania AI"
      emptyDescription="Wygeneruj automatyczne podsumowanie zmian i ich wpływu prostym językiem."
      generatingLabel="Generuję podsumowanie..."
      generatingNewLabel="Generuję nowe podsumowanie..."
    />
  );
}
