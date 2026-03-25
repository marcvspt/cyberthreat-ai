export type AnalysisStage = 'ioc' | 'ai' | 'unknown';

export class ProviderError extends Error {
    stage: AnalysisStage;
    provider?: string;

    constructor(stage: AnalysisStage, provider?: string, message?: string) {
        super(message ?? `Error in ${stage} analysis`);
        this.name = 'ProviderError';
        this.stage = stage;
        this.provider = provider;
    }
}

export function toClientError(error: unknown) {
    if (error instanceof ProviderError) {
        if (error.stage === 'ioc') {
            return {
                error: 'No se pudo completar la consulta de fuentes del IoC.',
                stage: 'ioc',
                failedApi: error.provider
            };
        }

        if (error.stage === 'ai') {
            return {
                error: 'No se pudo completar el análisis con la IA.',
                stage: 'ai',
                failedApi: error.provider
            };
        }
    }

    return {
        error: 'No se pudo completar el análisis.',
        stage: 'unknown'
    };
}