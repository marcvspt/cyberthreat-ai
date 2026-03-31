import type { ErrorType } from '@/scripts/types.ts';

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
            let baseError = 'No se pudo completar la consulta de fuentes del IoC.';

            if (error.errorType === 'not_found') {
                baseError = `El IoC no existe en los registros de ${error.provider}.`;
            } else if (error.errorType === 'invalid_api_key') {
                baseError = `La API Key de ${error.provider} es incorrecta.`;
            } else if (error.errorType === 'api_unavailable') {
                baseError = `La API de ${error.provider} no está disponible en este momento.`;
            }

            return {
                error: baseError,
                stage: 'ioc',
                errorType: error.errorType
            };
        }

        if (error.stage === 'ai') {
            let baseError = 'No se pudo completar el análisis con la IA.';

            if (error.errorType === 'invalid_api_key') {
                baseError = `La API Key de ${error.provider} no es válida o no tiene permisos suficientes.`;
            } else if (error.errorType === 'model_error') {
                const detail = error.message && !error.message.startsWith('Error in')
                    ? error.message
                    : null;
                baseError = detail ?? 'El modelo devolvió un error inesperado durante el análisis.';
            } else if (error.errorType === 'api_unavailable') {
                baseError = `El servicio de ${error.provider} no está disponible en este momento.`;
            }

            return {
                error: baseError,
                stage: 'ai',
                errorType: error.errorType
            };
        }
    }

    return {
        error: 'No se pudo completar el análisis.',
        stage: 'unknown'
    };
}