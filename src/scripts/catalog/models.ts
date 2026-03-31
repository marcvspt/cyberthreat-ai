import { AI_MODELS } from '@/scripts/catalog/utils.ts';

export const AVAILABLE_MODELS = AI_MODELS;
export const DEFAULT_MODEL = AVAILABLE_MODELS[0]?.id ?? 'openrouter/auto';
export const MODEL_IDS = new Set(AVAILABLE_MODELS.map((model) => model.id));
