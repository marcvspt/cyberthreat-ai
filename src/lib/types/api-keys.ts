export type ApiKeys = {
    openrouter: string;
    virustotal: string;
    abuseipdb: string;
    polyswarm: string;
};

export type ResolvedApiKeys = {
    openRouterKey: string;
    userVTKey?: string;
    userAbuseKey?: string;
    userPolyKey?: string;
};
