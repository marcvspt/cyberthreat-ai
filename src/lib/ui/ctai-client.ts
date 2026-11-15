import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { ApiKeys } from '@/lib/types/api-keys.ts';
import type { AnalyzeIoCMeta, SourceEvidence, SourceWarning } from '@/lib/types/analysis.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function isEvidence(value: unknown): value is SourceEvidence {
    return isRecord(value) && typeof value.name === 'string' && Array.isArray(value.metrics)
        && value.metrics.every((metric: unknown) => isRecord(metric) && typeof metric.label === 'string'
            && (typeof metric.value === 'number' || typeof metric.value === 'boolean'));
}

function isWarning(value: unknown): value is SourceWarning {
    return isRecord(value) && typeof value.source === 'string' && typeof value.message === 'string';
}

export function parseAnalysisMeta(payload: unknown): AnalyzeIoCMeta {
    if (isRecord(payload) && typeof payload.ioc === 'string' && typeof payload.type === 'string'
        && typeof payload.model === 'string' && typeof payload.hasEvidence === 'boolean'
        && Array.isArray(payload.sources) && payload.sources.every(isEvidence)
        && (payload.warnings === undefined || (Array.isArray(payload.warnings) && payload.warnings.every(isWarning)))) {
        const { ioc, type, model, sources, hasEvidence, warnings } = payload;
        return { ioc, type, model, sources, hasEvidence, warnings };
    }
    throw new Error(TEXTS_GENERAL.errors.streamInvalid);
}

export function buildUiErrorMessage(payload: unknown) {
    return isRecord(payload) && typeof payload.error === 'string' && payload.error
        ? payload.error
        : TEXTS_GENERAL.errors.clientAnalysisError;
}

export function buildRequestHeaders(keys: ApiKeys) {
    const requestHeaders: Record<string, string> = {};

    if (keys.openrouter) requestHeaders['X-OpenRouter-Key'] = keys.openrouter;
    if (keys.virustotal) requestHeaders['X-VT-Key'] = keys.virustotal;
    if (keys.abuseipdb) requestHeaders['X-AbuseIPDB-Key'] = keys.abuseipdb;
    if (keys.polyswarm) requestHeaders['X-Polyswarm-Key'] = keys.polyswarm;

    return requestHeaders;
}
