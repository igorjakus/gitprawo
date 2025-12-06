import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIFeedback {
  message: string;
  approved: boolean;
}

// Allow model override via env; default to lightweight fast model
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

const FEEDBACK_PROMPT = `Jesteś ekspertem w legislacji i językoznawstwie. Przeanalizuj poniższy tekst aktu prawnego pod względem:

1. **Zrozumiałość i klarowność** - czy tekst jest jasny i łatwy do zrozumienia?
2. **Spójność** - czy terminologia jest konsystentna w całym tekście?
3. **Poziom języka** - czy tekst jest na poziomie B2 (nie zbyt trudny)?
4. **Błędy ortograficzne i gramatyczne** - czy są jakieś błędy?
5. **Interpunkcja** - czy interpunkcja jest prawidłowa?

Na podstawie analizy, wydaj werdykt:
- Jeśli tekst jest dobry (maksymalnie drobne uwagi) - odpowiedz "APPROVED" na początek
- Jeśli są znaczące problemy do poprawy - odpowiedz "REJECTED" na początek

Następnie krótko opisz swoje spostrzeżenia (max 2-3 zdania).

Tekst do analizy:
---
{TEXT}
---

Odpowiedź:`;

// Lazily create a single Gemini client to avoid re-instantiating per request
let genAIClient: GoogleGenerativeAI | null = null;

const getGenAIClient = () => {
  if (genAIClient) return genAIClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  genAIClient = new GoogleGenerativeAI(apiKey);
  return genAIClient;
};

export async function getAIFeedback(text: string): Promise<AIFeedback> {
  try {
    const model = getGenAIClient().getGenerativeModel({ model: MODEL_NAME });
    const prompt = FEEDBACK_PROMPT.replace('{TEXT}', text);

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Parse response - first word should be APPROVED or REJECTED
    const firstWord = responseText.split('\n')[0].toUpperCase();
    const approved = firstWord.includes('APPROVED');

    // Get the rest of the message (skip the first line)
    const message = responseText.split('\n').slice(1).join('\n').trim();

    return {
      message: message || responseText,
      approved,
    };
  } catch (error) {
    console.error('Error getting AI feedback:', error);
    throw error;
  }
}
