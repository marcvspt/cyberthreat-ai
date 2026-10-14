import { TEXTS_GENERAL } from '@/lib/texts.ts';
import type { ErrorType } from '@/lib/types/analysis.ts';

export type AnalysisStage = 'ioc' | 'ai' | 'unknown';

export class ProviderError extends Error {
    stage: AnalysisStage;
    provider?: string;
    errorType: ErrorType;

    constructor(stage: AnalysisStage, provider?: string, errorType: ErrorType = 'unknown', message?: string) {
        super(message ?? `Error in ${stage} analysis`);
        this.name = 'ProviderError';
        this.stage = stage;
        this.provider = provider;
        this.errorType = errorType;
    }
}

export function toClientError(error: unknown) {
    if (error instanceof ProviderError) {
        if (error.stage === 'ioc') {
            let baseError = TEXTS_GENERAL.errors.iocAnalysisError;

            if (error.errorType === 'not_found') {
                baseError = TEXTS_GENERAL.errors.iocNotFound(error.provider);
            } else if (error.errorType === 'invalid_api_key') {
                baseError = TEXTS_GENERAL.errors.invalidProviderKey(error.provider);
            } else if (error.errorType === 'api_unavailable') {
                baseError = TEXTS_GENERAL.errors.providerUnavailable(error.provider);
            }

            return {
                error: baseError,
                stage: 'ioc',
                errorType: error.errorType
            };
        }

        if (error.stage === 'ai') {
            let baseError = TEXTS_GENERAL.errors.aiAnalysisError;

            if (error.errorType === 'invalid_api_key') {
                baseError = TEXTS_GENERAL.errors.invalidAiKey(error.provider);
            } else if (error.errorType === 'model_error') {
                const detail = error.message && !error.message.startsWith('Error in')
                    ? error.message
                    : null;
                baseError = detail ?? TEXTS_GENERAL.errors.modelError;
            } else if (error.errorType === 'api_unavailable') {
                baseError = TEXTS_GENERAL.errors.aiUnavailable(error.provider);
            }

            return {
                error: baseError,
                stage: 'ai',
                errorType: error.errorType
            };
        }
    }

    return {
        error: TEXTS_GENERAL.errors.analysisError,
        stage: 'unknown'
    };
}
