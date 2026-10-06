import type { AiModel } from '@/scripts/types.ts';
import { TEXTS_GENERAL } from '@/scripts/catalog/texts.ts';

export const AVAILABLE_MODELS: AiModel[] = [
    { id: 'openrouter/auto', label: TEXTS_GENERAL.modelLabels.auto, provider: TEXTS_GENERAL.brands.openrouter },
    { id: 'openrouter/free', label: TEXTS_GENERAL.modelLabels.free, provider: TEXTS_GENERAL.brands.openrouter },
    { id: 'poolside/laguna-xs-2.1:free', label: TEXTS_GENERAL.modelLabels.poolside, provider: TEXTS_GENERAL.brands.poolside },
    { id: 'inclusionai/ling-3.0-flash:free', label: TEXTS_GENERAL.modelLabels.novita, provider: TEXTS_GENERAL.brands.novita },
];

export const DEFAULT_MODEL = 'openrouter/auto';
const MODEL_IDS = new Set(AVAILABLE_MODELS.map((model) => model.id));

export function isAllowedModel(model: string): boolean {
    return MODEL_IDS.has(model);
}
