import type { AiModel } from '@/scripts/types.ts';

export const AI_MODELS: AiModel[] = [
    { id: 'openrouter/auto', label: 'Default - OpenRouter (Auto)', provider: 'OpenRouter' },
    { id: 'openrouter/free', label: 'OpenRouter (Free)', provider: 'OpenRouter' },
    { id: 'liquid/lfm-2.5-1.2b-instruct-20260120:free', label: 'LiquidAI: LFM2.5-1.2B-Instruct (Free)', provider: 'Liquid' },
    { id: 'stepfun/step-3.5-flash:free', label: 'StepFun: Step 3.5 Flash (Free)', provider: 'StepFun' },
    { id: 'google/gemma-3-4b-it:free', label: 'Google: Gemma 3 4B (Free)', provider: 'Google AI Studio' },
];

export const PATTERNS = {
    ip: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
    domain: /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/,
    hash: /^[a-fA-F0-9]{32,64}$/,
}