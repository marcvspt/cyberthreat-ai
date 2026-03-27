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

export type IoCSearchFormProps = {
    loading: boolean;
    onSubmit: (event: any) => void;
    hasCustomKeys: boolean;
    onOpenSettings: () => void;
    selectedModel: string;
    onModelChange: (model: string) => void;
};

export type AIResponsePanelProps = {
    data: string;
    loading: boolean;
    status: StreamStatus;
    meta: AnalyzeIoCMeta | null;
};

export type ModelSelectorProps = {
    loading: boolean;
    selectedModel: string;
    onModelChange: (model: string) => void;
    models: readonly AiModel[];
};

export type ApiKeysSettingsButtonProps = {
    hasCustomKeys: boolean;
    onOpenSettings: () => void;
};

export type ResolvedApiKeys = {
    openRouterKey: string;
    userVTKey?: string;
    userAbuseKey?: string;
    userPolyKey?: string;
};

export type OpenRouterStreamParams = {
    ioc: string;
    iocType: IoCType;
    toolResult: unknown;
    apiKey: string;
    model: string;
};
