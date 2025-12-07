import { GoogleGenerativeAI } from '@google/generative-ai';
import { AI_FEEDBACK_CONFIG } from './ai-config';

export interface AIFeedback {
  message: string;
  approved: boolean;
}

export interface AISupportSummary {
  message: string;
}

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

const SUMMARY_PROMPT = `Porównaj poniższe dwie wersje aktu prawnego i wygeneruj podsumowanie najważniejszych zmian oraz wyjaśnij ich wpływ na obywateli. Podsumowanie ma być krótkie, łatwe w odbiorze i napisane prostym, zrozumiałym językiem. Skup się na praktycznych konsekwencjach zmian.

Wersja wcześniejsza:
---
{FROM}
---
Wersja późniejsza:
---
{TO}
---

Odpowiedź:`;

const MODEL_NAME = AI_FEEDBACK_CONFIG.model.default;
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
    const firstWord = responseText.split('\n')[0].toUpperCase();
    const approved = firstWord.includes('APPROVED');
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

export async function getAISupportSummary(from: string, to: string): Promise<AISupportSummary> {
  try {
    const model = getGenAIClient().getGenerativeModel({ model: MODEL_NAME });
    const prompt = SUMMARY_PROMPT.replace('{FROM}', from).replace('{TO}', to);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    return {
      message: responseText,
    };
  } catch (error) {
    console.error('Error getting AI summary:', error);
    throw error;
  }
}
