import type { AiModel } from '@/lib/types/model.ts';
import { TEXTS_GENERAL } from '@/lib/texts.ts';

export const AVAILABLE_MODELS: AiModel[] = [
    { id: 'openrouter/auto', label: 'Default - OpenRouter (auto)', provider: TEXTS_GENERAL.brands.openrouter },
    { id: 'openrouter/free', label: 'OpenRouter (free)', provider: TEXTS_GENERAL.brands.openrouter },
    { id: 'nvidia/nemotron-3-ultra-550b-a55b:free', label: 'NVIDIA: Nemotron 3 Ultra (free)', provider: 'NVIDIA' },
    { id: 'google/gemma-4-26b-a4b-it:free', label: 'Google: Gemma 4 26B A4B (free)', provider: 'Google AI Studio' },
    { id: 'liquid/lfm-3-1.7b:free', label: 'LiquidAI: LFM3-1.7B (free)', provider: 'Liquid' },
];

export const DEFAULT_MODEL = 'openrouter/auto';
const MODEL_IDS = new Set(AVAILABLE_MODELS.map((model) => model.id));

export function isAllowedModel(model: string): boolean {
    return MODEL_IDS.has(model);
}
