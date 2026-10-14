import { DEFAULT_MODEL, isAllowedModel } from '@/lib/catalog/models.ts';
import { detectIocType } from '@/lib/validation/ioc.ts';
import type { ResolvedApiKeys } from '@/lib/types/api-keys.ts';

export function resolveIocType(ioc: string) {
    return detectIocType(ioc)
}

export function resolveModel(rawModel: string) {
    return isAllowedModel(rawModel) ? rawModel : DEFAULT_MODEL
}

export function resolveRequestApiKeys(request: Request, defaultOpenRouterApiKey: string) {
    return {
        openRouterKey: request.headers.get('X-OpenRouter-Key') || defaultOpenRouterApiKey || '',
        userVTKey: request.headers.get('X-VT-Key') || undefined,
        userAbuseKey: request.headers.get('X-AbuseIPDB-Key') || undefined,
        userPolyKey: request.headers.get('X-Polyswarm-Key') || undefined
    } satisfies ResolvedApiKeys
}
