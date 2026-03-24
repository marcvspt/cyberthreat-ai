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

export type AnalyzeIoCMeta = {
    ioc: string;
    type: string;
    model: string;
};

export type IoCType = 'ip' | 'domain' | 'hash';
