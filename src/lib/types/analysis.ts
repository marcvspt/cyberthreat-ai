export type StreamStatus = 'idle' | 'analyzing' | 'streaming' | 'done' | 'no_data' | 'cancelled' | 'error';

export type SourceWarning = {
    source: string;
    message: string;
    reason?: ErrorType;
};

export type CtiSourceRequest = {
    name: string;
    fetch: () => Promise<SourceMetric[]>;
};

export type SourceMetric = {
    label: string;
    value: number | boolean;
};

export type SourceEvidence = {
    name: string;
    metrics: SourceMetric[];
};

export type IocAnalysisResult = {
    ioc: string;
    type: string;
    sources: SourceEvidence[];
    warnings?: SourceWarning[];
};

export type AnalyzeIoCMeta = {
    ioc: string;
    type: string;
    model: string;
    sources: SourceEvidence[];
    hasEvidence: boolean;
    warnings?: SourceWarning[];
};

export type AnalysisEventPayloads = {
    meta: AnalyzeIoCMeta;
    model: { model: string };
    chunk: { content: string };
    done: { done: true };
    error: { error: string; stage: string; errorType?: ErrorType };
};

export type IoCType = 'ip' | 'domain' | 'hash';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256';

export type OpenRouterStreamParams = {
    iocType: IoCType;
    meta: AnalyzeIoCMeta;
    apiKey: string;
    siteUrl: string;
    requestSignal: AbortSignal;
};

export type ErrorType = 'not_found' | 'api_unavailable' | 'invalid_api_key' | 'model_error' | 'unknown';
