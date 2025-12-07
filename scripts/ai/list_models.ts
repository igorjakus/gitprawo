import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GeminiModel {
  name: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
}

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log('🔍 Fetching available Gemini models...\n');

  try {
    // Use fetch API to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const models: GeminiModel[] = data.models || [];

    console.log(`✅ Found ${models.length} models:\n`);
    console.log('─'.repeat(80));

    for (const model of models) {
      console.log(`\n📦 Model: ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log(`   Input Token Limit: ${model.inputTokenLimit || 'N/A'}`);
      console.log(`   Output Token Limit: ${model.outputTokenLimit || 'N/A'}`);
      console.log('─'.repeat(80));
    }

    // Filter models that support generateContent
    const generateContentModels = models.filter((m: GeminiModel) => 
      m.supportedGenerationMethods?.includes('generateContent')
    );

    console.log(`\n✨ Models supporting generateContent (${generateContentModels.length}):\n`);
    generateContentModels.forEach((m: GeminiModel) => {
      console.log(`   • ${m.name}`);
    });

  } catch (error) {
    console.error('❌ Error fetching models:', error);
    process.exit(1);
  }
}

listModels();
