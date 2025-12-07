/**
 * Global AI Feedback Configuration
 * Centralizes settings for permissions and model selection
 */

export const AI_FEEDBACK_CONFIG = {
  // Roles allowed to GENERATE new AI feedback
  generatePermissions: {
    roles: ['default', 'expert', 'admin'] as const,
    description: 'Any logged-in user can generate AI feedback',
  },

  // Roles allowed to REGENERATE existing AI feedback
  regeneratePermissions: {
    roles: ['default', 'expert', 'admin'] as const,
    description: 'Any logged-in user can regenerate AI feedback',
  },

  // AI Model to use for feedback generation
  model: {
    default: 'gemma-3-27b',
    envKey: 'GEMINI_MODEL',
    description: 'Lightweight, fast Gemini model optimized for feedback',
  },
} as const;

export type AIFeedbackRole = typeof AI_FEEDBACK_CONFIG.generatePermissions.roles[number];

export function hasPermission(
  userRole: string | undefined,
  action: 'generate' | 'regenerate'
): boolean {
  if (!userRole) return false;

  const config =
    action === 'generate'
      ? AI_FEEDBACK_CONFIG.generatePermissions
      : AI_FEEDBACK_CONFIG.regeneratePermissions;

  return config.roles.includes(userRole as AIFeedbackRole);
}
