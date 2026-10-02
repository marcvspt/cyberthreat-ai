import type { AiModel } from '@/scripts/types.ts';

export const AVAILABLE_MODELS: AiModel[] = [
    { id: 'openrouter/auto', label: 'Default - OpenRouter (Auto)', provider: 'OpenRouter' },
    { id: 'openrouter/free', label: 'OpenRouter (Free)', provider: 'OpenRouter' },
    { id: 'poolside/laguna-xs-2.1:free', label: 'Poolside: Laguna XS 2.1 (free)', provider: 'Poolside' },
    { id: 'inclusionai/ling-3.0-flash:free', label: 'NovitaAI: Ling-3.0-flash (free)', provider: 'NovitaAI' },
];

export const DEFAULT_MODEL = 'openrouter/auto';
const MODEL_IDS = new Set(AVAILABLE_MODELS.map((model) => model.id));

export function isAllowedModel(model: string): boolean {
    return MODEL_IDS.has(model);
}
