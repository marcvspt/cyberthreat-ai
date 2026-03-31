export type AiModel = {
    id: string;
    label: string;
    provider: string;
};

export type ApiKeys = {
    openrouter: string;
    virustotal: string;
    abuseipdb: string;
    polyswarm: string;
};

export type StreamStatus = 'idle' | 'analyzing' | 'streaming' | 'done' | 'error';

export type SourceWarning = {
    source: string;
    message: string;
    reason?: ErrorType;
};

export type CtiSourceRequest = {
    name: string;
    fetch: () => Promise<unknown>;
};

export type CtiSourceResult = {
    name: string;
    apiResponse: unknown;
};

export type IocAnalysisResult = {
    ioc: string;
    type: string;
    sources: CtiSourceResult[];
    warnings?: SourceWarning[];
};

export type AnalyzeIoCMeta = {
    ioc: string;
    type: string;
    model: string;
    warnings?: SourceWarning[];
};

export type IoCType = 'ip' | 'domain' | 'hash';

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256';

export type ResolvedApiKeys = {
    openRouterKey: string;
    userVTKey?: string;
    userAbuseKey?: string;
    userPolyKey?: string;
};

export type OpenRouterStreamParams = {
    ioc: string;
    iocType: IoCType;
    toolResult: IocAnalysisResult;
    apiKey: string;
    model: string;
};

export type ErrorType = 'not_found' | 'api_unavailable' | 'invalid_api_key' | 'model_error' | 'unknown';
