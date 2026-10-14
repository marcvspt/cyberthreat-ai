import { TEXTS_GENERAL } from '@/lib/texts.ts';
import { analyzeIP } from '@/lib/server/analysis/ip.ts';
import { analyzeDomain } from '@/lib/server/analysis/domain.ts';
import { analyzeHash } from '@/lib/server/analysis/hash.ts';
import type { IoCType, IocAnalysisResult, CtiSourceResult } from '@/lib/types/analysis.ts';
import type { ResolvedApiKeys } from '@/lib/types/api-keys.ts';

export function allSourcesEmpty(toolResult: IocAnalysisResult): boolean {
    const sources: CtiSourceResult[] = toolResult.sources
    return sources.length > 0 && sources.every((s) => s.apiResponse === null)
}

export async function analyzeIocByType(iocType: IoCType, ioc: string, keys: ResolvedApiKeys) {
    switch (iocType) {
        case 'ip':
            return analyzeIP(ioc, keys.userVTKey, keys.userAbuseKey)
        case 'domain':
            return analyzeDomain(ioc, keys.userVTKey)
        case 'hash':
            return analyzeHash(ioc, keys.userVTKey, keys.userPolyKey)
        default:
            throw new Error(TEXTS_GENERAL.errors.unsupportedIoc)
    }
}
